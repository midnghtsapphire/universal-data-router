"""
Source management endpoints — connect, disconnect, sync data sources.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from app.core.database import get_db
from app.core.security import get_current_user_id
from app.models.source import Source
from app.schemas.source import SourceCreate, SourceResponse, SourceUpdate
from app.tasks.file_tasks import scan_source_task

router = APIRouter(prefix="/sources", tags=["Sources"])


@router.get("/", response_model=List[SourceResponse])
async def list_sources(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """List all connected sources for the current user."""
    stmt = select(Source).where(Source.user_id == user_id).order_by(Source.created_at.desc())
    result = await db.execute(stmt)
    sources = result.scalars().all()
    return [
        SourceResponse(
            id=str(s.id),
            source_type=s.source_type,
            display_name=s.display_name,
            status=s.status,
            root_path=s.root_path,
            last_sync_at=s.last_sync_at,
            total_files=s.total_files,
            total_size_bytes=s.total_size_bytes,
            is_active=s.is_active,
            created_at=s.created_at,
        )
        for s in sources
    ]


@router.post("/", response_model=SourceResponse, status_code=201)
async def create_source(
    source_data: SourceCreate,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Connect a new data source."""
    source = Source(
        user_id=user_id,
        source_type=source_data.source_type,
        display_name=source_data.display_name,
        root_path=source_data.root_path,
        config=source_data.config,
        status="connected",
    )
    db.add(source)
    await db.flush()

    return SourceResponse(
        id=str(source.id),
        source_type=source.source_type,
        display_name=source.display_name,
        status=source.status,
        root_path=source.root_path,
        last_sync_at=source.last_sync_at,
        total_files=source.total_files,
        total_size_bytes=source.total_size_bytes,
        is_active=source.is_active,
        created_at=source.created_at,
    )


@router.get("/{source_id}", response_model=SourceResponse)
async def get_source(
    source_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Get details of a specific source."""
    stmt = select(Source).where(Source.id == source_id, Source.user_id == user_id)
    result = await db.execute(stmt)
    source = result.scalar_one_or_none()
    if not source:
        raise HTTPException(status_code=404, detail="Source not found")

    return SourceResponse(
        id=str(source.id),
        source_type=source.source_type,
        display_name=source.display_name,
        status=source.status,
        root_path=source.root_path,
        last_sync_at=source.last_sync_at,
        total_files=source.total_files,
        total_size_bytes=source.total_size_bytes,
        is_active=source.is_active,
        created_at=source.created_at,
    )


@router.patch("/{source_id}", response_model=SourceResponse)
async def update_source(
    source_id: str,
    update_data: SourceUpdate,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Update source configuration."""
    stmt = select(Source).where(Source.id == source_id, Source.user_id == user_id)
    result = await db.execute(stmt)
    source = result.scalar_one_or_none()
    if not source:
        raise HTTPException(status_code=404, detail="Source not found")

    for field, value in update_data.model_dump(exclude_unset=True).items():
        setattr(source, field, value)

    await db.flush()

    return SourceResponse(
        id=str(source.id),
        source_type=source.source_type,
        display_name=source.display_name,
        status=source.status,
        root_path=source.root_path,
        last_sync_at=source.last_sync_at,
        total_files=source.total_files,
        total_size_bytes=source.total_size_bytes,
        is_active=source.is_active,
        created_at=source.created_at,
    )


@router.delete("/{source_id}", status_code=204)
async def delete_source(
    source_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Disconnect and remove a source."""
    stmt = select(Source).where(Source.id == source_id, Source.user_id == user_id)
    result = await db.execute(stmt)
    source = result.scalar_one_or_none()
    if not source:
        raise HTTPException(status_code=404, detail="Source not found")

    await db.delete(source)
    await db.flush()


@router.post("/{source_id}/scan")
async def trigger_scan(
    source_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Trigger a file scan on a source."""
    stmt = select(Source).where(Source.id == source_id, Source.user_id == user_id)
    result = await db.execute(stmt)
    source = result.scalar_one_or_none()
    if not source:
        raise HTTPException(status_code=404, detail="Source not found")

    task = scan_source_task.delay(user_id, source_id)
    return {"task_id": task.id, "status": "queued", "message": "Scan started"}


@router.post("/{source_id}/sync")
async def trigger_sync(
    source_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Trigger a sync operation on a source."""
    stmt = select(Source).where(Source.id == source_id, Source.user_id == user_id)
    result = await db.execute(stmt)
    source = result.scalar_one_or_none()
    if not source:
        raise HTTPException(status_code=404, detail="Source not found")

    from app.tasks.sync_tasks import sync_sources_task
    task = sync_sources_task.delay(user_id)
    return {"task_id": task.id, "status": "queued", "message": "Sync started"}
