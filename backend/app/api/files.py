"""
File management endpoints — browse, search, categorize, convert, deduplicate.
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_, and_
from typing import List, Optional
from app.core.database import get_db
from app.core.security import get_current_user_id
from app.models.file import File
from app.models.source import Source
from app.schemas.file import FileResponse, FileSearchQuery, FileCategorizeRequest
from app.services.converter import file_converter
from app.tasks.file_tasks import categorize_files_task, deduplicate_task

router = APIRouter(prefix="/files", tags=["Files"])


@router.get("/", response_model=List[FileResponse])
async def list_files(
    source_id: Optional[str] = None,
    category_id: Optional[str] = None,
    file_type: Optional[str] = None,
    is_duplicate: Optional[bool] = None,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """List files with optional filtering."""
    stmt = select(File).where(File.user_id == user_id, File.is_deleted == False)

    if source_id:
        stmt = stmt.where(File.source_id == source_id)
    if category_id:
        stmt = stmt.where(File.category_id == category_id)
    if file_type:
        stmt = stmt.where(File.file_extension == file_type)
    if is_duplicate is not None:
        stmt = stmt.where(File.is_duplicate == is_duplicate)

    stmt = stmt.order_by(File.file_modified_at.desc().nullslast())
    stmt = stmt.offset((page - 1) * per_page).limit(per_page)

    result = await db.execute(stmt)
    files = result.scalars().all()

    return [
        FileResponse(
            id=str(f.id),
            source_id=str(f.source_id),
            category_id=str(f.category_id) if f.category_id else None,
            filename=f.filename,
            file_path=f.file_path,
            file_extension=f.file_extension,
            mime_type=f.mime_type,
            size_bytes=f.size_bytes,
            checksum_sha256=f.checksum_sha256,
            ai_category=f.ai_category,
            ai_confidence=f.ai_confidence,
            ai_tags=f.ai_tags,
            ai_summary=f.ai_summary,
            external_url=f.external_url,
            is_duplicate=f.is_duplicate,
            is_archived=f.is_archived,
            file_created_at=f.file_created_at,
            file_modified_at=f.file_modified_at,
            indexed_at=f.indexed_at,
            created_at=f.created_at,
        )
        for f in files
    ]


@router.get("/count")
async def get_file_count(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Get total file count and size for the user."""
    stmt = select(
        func.count(File.id),
        func.coalesce(func.sum(File.size_bytes), 0),
    ).where(File.user_id == user_id, File.is_deleted == False)

    result = await db.execute(stmt)
    count, total_size = result.one()
    return {"total_files": count, "total_size_bytes": total_size}


@router.post("/search", response_model=List[FileResponse])
async def search_files(
    query: FileSearchQuery,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Smart search across all connected sources."""
    stmt = select(File).where(File.user_id == user_id, File.is_deleted == False)

    # Text search across filename, path, AI summary, and tags
    if query.query:
        search_term = f"%{query.query}%"
        stmt = stmt.where(
            or_(
                File.filename.ilike(search_term),
                File.file_path.ilike(search_term),
                File.ai_summary.ilike(search_term),
                File.ai_tags.ilike(search_term),
                File.ai_category.ilike(search_term),
            )
        )

    if query.source_ids:
        stmt = stmt.where(File.source_id.in_(query.source_ids))
    if query.category_ids:
        stmt = stmt.where(File.category_id.in_(query.category_ids))
    if query.file_types:
        stmt = stmt.where(File.file_extension.in_(query.file_types))
    if query.date_from:
        stmt = stmt.where(File.file_modified_at >= query.date_from)
    if query.date_to:
        stmt = stmt.where(File.file_modified_at <= query.date_to)
    if query.min_size:
        stmt = stmt.where(File.size_bytes >= query.min_size)
    if query.max_size:
        stmt = stmt.where(File.size_bytes <= query.max_size)
    if not query.include_duplicates:
        stmt = stmt.where(File.is_duplicate == False)

    stmt = stmt.order_by(File.file_modified_at.desc().nullslast())
    stmt = stmt.offset((query.page - 1) * query.per_page).limit(query.per_page)

    result = await db.execute(stmt)
    files = result.scalars().all()

    return [
        FileResponse(
            id=str(f.id),
            source_id=str(f.source_id),
            category_id=str(f.category_id) if f.category_id else None,
            filename=f.filename,
            file_path=f.file_path,
            file_extension=f.file_extension,
            mime_type=f.mime_type,
            size_bytes=f.size_bytes,
            checksum_sha256=f.checksum_sha256,
            ai_category=f.ai_category,
            ai_confidence=f.ai_confidence,
            ai_tags=f.ai_tags,
            ai_summary=f.ai_summary,
            external_url=f.external_url,
            is_duplicate=f.is_duplicate,
            is_archived=f.is_archived,
            file_created_at=f.file_created_at,
            file_modified_at=f.file_modified_at,
            indexed_at=f.indexed_at,
            created_at=f.created_at,
        )
        for f in files
    ]


@router.post("/categorize")
async def categorize_files(
    request: FileCategorizeRequest,
    user_id: str = Depends(get_current_user_id),
):
    """Trigger AI categorization for specified files."""
    task = categorize_files_task.delay(user_id, request.file_ids)
    return {
        "task_id": task.id,
        "status": "queued",
        "message": f"Categorizing {len(request.file_ids)} files",
    }


@router.post("/deduplicate")
async def run_deduplication(
    user_id: str = Depends(get_current_user_id),
):
    """Trigger deduplication scan across all sources."""
    task = deduplicate_task.delay(user_id)
    return {"task_id": task.id, "status": "queued", "message": "Deduplication scan started"}


@router.get("/duplicates")
async def get_duplicates(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Get list of detected duplicate files."""
    from app.services.deduplication import deduplication_service
    duplicates = await deduplication_service.find_duplicates_by_checksum(db, user_id)
    return {"duplicates": duplicates, "total_groups": len(duplicates)}


@router.get("/conversions")
async def get_supported_conversions():
    """Get list of supported file format conversions."""
    return {"conversions": file_converter.get_supported_conversions()}


@router.get("/{file_id}", response_model=FileResponse)
async def get_file(
    file_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Get details of a specific file."""
    stmt = select(File).where(File.id == file_id, File.user_id == user_id)
    result = await db.execute(stmt)
    f = result.scalar_one_or_none()
    if not f:
        raise HTTPException(status_code=404, detail="File not found")

    return FileResponse(
        id=str(f.id),
        source_id=str(f.source_id),
        category_id=str(f.category_id) if f.category_id else None,
        filename=f.filename,
        file_path=f.file_path,
        file_extension=f.file_extension,
        mime_type=f.mime_type,
        size_bytes=f.size_bytes,
        checksum_sha256=f.checksum_sha256,
        ai_category=f.ai_category,
        ai_confidence=f.ai_confidence,
        ai_tags=f.ai_tags,
        ai_summary=f.ai_summary,
        external_url=f.external_url,
        is_duplicate=f.is_duplicate,
        is_archived=f.is_archived,
        file_created_at=f.file_created_at,
        file_modified_at=f.file_modified_at,
        indexed_at=f.indexed_at,
        created_at=f.created_at,
    )


@router.delete("/{file_id}", status_code=204)
async def delete_file(
    file_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Soft-delete a file."""
    stmt = select(File).where(File.id == file_id, File.user_id == user_id)
    result = await db.execute(stmt)
    f = result.scalar_one_or_none()
    if not f:
        raise HTTPException(status_code=404, detail="File not found")
    f.is_deleted = True
    await db.flush()
