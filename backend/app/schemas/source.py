"""Pydantic schemas for Source operations."""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class SourceCreate(BaseModel):
    source_type: str
    display_name: str
    root_path: Optional[str] = None
    config: Optional[str] = None


class SourceUpdate(BaseModel):
    display_name: Optional[str] = None
    is_active: Optional[bool] = None
    root_path: Optional[str] = None
    config: Optional[str] = None


class SourceResponse(BaseModel):
    id: str
    source_type: str
    display_name: str
    status: str
    root_path: Optional[str] = None
    last_sync_at: Optional[datetime] = None
    total_files: str
    total_size_bytes: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True
