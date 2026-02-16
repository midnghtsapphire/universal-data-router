"""Pydantic schemas for Dashboard data."""
from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime


class StorageBreakdown(BaseModel):
    source_type: str
    source_name: str
    total_files: int
    total_size_bytes: int
    percentage: float


class CategoryBreakdown(BaseModel):
    category_name: str
    category_color: str
    file_count: int
    percentage: float


class ActivityItem(BaseModel):
    id: str
    operation: str
    status: str
    message: Optional[str] = None
    files_processed: int
    created_at: datetime


class DashboardStats(BaseModel):
    total_files: int
    total_sources: int
    total_size_bytes: int
    total_duplicates: int
    total_categories: int
    active_rules: int
    storage_breakdown: List[StorageBreakdown]
    category_breakdown: List[CategoryBreakdown]
    recent_activity: List[ActivityItem]
    carbon_metrics: Dict
    subscription_tier: str
    ai_calls_remaining: int
