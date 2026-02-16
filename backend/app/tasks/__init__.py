from app.tasks.celery_app import celery_app
from app.tasks.file_tasks import scan_source_task, categorize_files_task, deduplicate_task
from app.tasks.sync_tasks import sync_sources_task, backup_task
from app.tasks.scheduled_tasks import daily_organization_task, weekly_report_task
