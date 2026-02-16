"""
Celery application configuration for background task processing.
"""
from celery import Celery
from celery.schedules import crontab
from app.core.config import settings

celery_app = Celery(
    "universal_data_router",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=3600,  # 1 hour max per task
    task_soft_time_limit=3000,
    worker_prefetch_multiplier=1,
    worker_max_tasks_per_child=100,
    task_acks_late=True,
    task_reject_on_worker_lost=True,
)

# Scheduled tasks (beat schedule)
celery_app.conf.beat_schedule = {
    "daily-organization": {
        "task": "app.tasks.scheduled_tasks.daily_organization_task",
        "schedule": crontab(hour=2, minute=0),  # 2 AM UTC daily
        "args": (),
    },
    "weekly-report": {
        "task": "app.tasks.scheduled_tasks.weekly_report_task",
        "schedule": crontab(hour=8, minute=0, day_of_week=1),  # Monday 8 AM UTC
        "args": (),
    },
    "hourly-sync-check": {
        "task": "app.tasks.sync_tasks.sync_sources_task",
        "schedule": crontab(minute=0),  # Every hour
        "args": (),
    },
}

celery_app.autodiscover_tasks(["app.tasks"])
