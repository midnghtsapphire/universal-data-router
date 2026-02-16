"""Pydantic schemas for File operations."""
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class FileResponse(BaseModel):
    id: str
    source_id: str
    category_id: Optional[str] = None
    filename: str
    file_path: str
    file_extension: Optional[str] = None
    mime_type: Optional[str] = None
    size_bytes: int
    checksum_sha256: Optional[str] = None
    ai_category: Optional[str] = None
    ai_confidence: Optional[float] = None
    ai_tags: Optional[str] = None
    ai_summary: Optional[str] = None
    external_url: Optional[str] = None
    is_duplicate: bool
    is_archived: bool
    file_created_at: Optional[datetime] = None
    file_modified_at: Optional[datetime] = None
    indexed_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


class FileSearchQuery(BaseModel):
    query: str
    source_ids: Optional[List[str]] = None
    category_ids: Optional[List[str]] = None
    file_types: Optional[List[str]] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None
    min_size: Optional[int] = None
    max_size: Optional[int] = None
    include_duplicates: bool = False
    page: int = 1
    per_page: int = 20


class FileCategorizeRequest(BaseModel):
    file_ids: List[str]
    force_recategorize: bool = False
