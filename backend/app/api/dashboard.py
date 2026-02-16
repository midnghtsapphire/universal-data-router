"""
Dashboard endpoints — aggregated stats, activity feed, carbon metrics.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.core.database import get_db
from app.core.security import get_current_user_id
from app.core.carbon import carbon_tracker
from app.models.file import File
from app.models.source import Source
from app.models.category import Category
from app.models.rule import RoutingRule
from app.models.sync_log import SyncLog
from app.models.subscription import Subscription
from app.schemas.dashboard import DashboardStats, StorageBreakdown, CategoryBreakdown, ActivityItem

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Get comprehensive dashboard statistics."""

    # Total files
    file_count_stmt = select(func.count(File.id)).where(
        File.user_id == user_id, File.is_deleted == False
    )
    file_count = (await db.execute(file_count_stmt)).scalar() or 0

    # Total size
    size_stmt = select(func.coalesce(func.sum(File.size_bytes), 0)).where(
        File.user_id == user_id, File.is_deleted == False
    )
    total_size = (await db.execute(size_stmt)).scalar() or 0

    # Total sources
    source_count_stmt = select(func.count(Source.id)).where(
        Source.user_id == user_id, Source.is_active == True
    )
    source_count = (await db.execute(source_count_stmt)).scalar() or 0

    # Total duplicates
    dup_count_stmt = select(func.count(File.id)).where(
        File.user_id == user_id, File.is_duplicate == True, File.is_deleted == False
    )
    dup_count = (await db.execute(dup_count_stmt)).scalar() or 0

    # Categories
    cat_count_stmt = select(func.count(Category.id)).where(
        Category.is_active == True
    )
    cat_count = (await db.execute(cat_count_stmt)).scalar() or 0

    # Active rules
    rule_count_stmt = select(func.count(RoutingRule.id)).where(
        RoutingRule.user_id == user_id, RoutingRule.is_active == True
    )
    rule_count = (await db.execute(rule_count_stmt)).scalar() or 0

    # Storage breakdown by source
    storage_stmt = (
        select(
            Source.source_type,
            Source.display_name,
            func.count(File.id),
            func.coalesce(func.sum(File.size_bytes), 0),
        )
        .join(File, File.source_id == Source.id)
        .where(Source.user_id == user_id, File.is_deleted == False)
        .group_by(Source.source_type, Source.display_name)
    )
    storage_result = await db.execute(storage_stmt)
    storage_rows = storage_result.all()

    storage_breakdown = [
        StorageBreakdown(
            source_type=row[0],
            source_name=row[1],
            total_files=row[2],
            total_size_bytes=row[3],
            percentage=round((row[3] / total_size * 100) if total_size > 0 else 0, 1),
        )
        for row in storage_rows
    ]

    # Category breakdown
    cat_stmt = (
        select(
            File.ai_category,
            func.count(File.id),
        )
        .where(
            File.user_id == user_id,
            File.is_deleted == False,
            File.ai_category.isnot(None),
        )
        .group_by(File.ai_category)
        .order_by(func.count(File.id).desc())
        .limit(10)
    )
    cat_result = await db.execute(cat_stmt)
    cat_rows = cat_result.all()

    category_colors = {
        "Documents": "#8B4513", "Spreadsheets": "#2E8B57", "Images": "#DAA520",
        "Code": "#CD853F", "Videos": "#A0522D", "Audio": "#6B8E23",
        "Archives": "#556B2F", "Finance": "#B8860B", "Design": "#D2691E",
        "Other": "#808080",
    }

    category_breakdown = [
        CategoryBreakdown(
            category_name=row[0] or "Uncategorized",
            category_color=category_colors.get(row[0], "#808080"),
            file_count=row[1],
            percentage=round((row[1] / file_count * 100) if file_count > 0 else 0, 1),
        )
        for row in cat_rows
    ]

    # Recent activity
    activity_stmt = (
        select(SyncLog)
        .where(SyncLog.user_id == user_id)
        .order_by(SyncLog.created_at.desc())
        .limit(10)
    )
    activity_result = await db.execute(activity_stmt)
    activities = activity_result.scalars().all()

    recent_activity = [
        ActivityItem(
            id=str(a.id),
            operation=a.operation,
            status=a.status,
            message=a.message,
            files_processed=a.files_processed,
            created_at=a.created_at,
        )
        for a in activities
    ]

    # Subscription info
    sub_stmt = select(Subscription).where(Subscription.user_id == user_id)
    sub_result = await db.execute(sub_stmt)
    subscription = sub_result.scalar_one_or_none()

    return DashboardStats(
        total_files=file_count,
        total_sources=source_count,
        total_size_bytes=total_size,
        total_duplicates=dup_count,
        total_categories=cat_count,
        active_rules=rule_count,
        storage_breakdown=storage_breakdown,
        category_breakdown=category_breakdown,
        recent_activity=recent_activity,
        carbon_metrics=carbon_tracker.get_summary(),
        subscription_tier=subscription.tier if subscription else "free",
        ai_calls_remaining=subscription.ai_categorizations_remaining if subscription else 50,
    )


@router.get("/carbon")
async def get_carbon_metrics():
    """Get current carbon footprint metrics."""
    return carbon_tracker.get_summary()
