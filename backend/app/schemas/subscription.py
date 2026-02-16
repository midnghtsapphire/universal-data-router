"""Pydantic schemas for Subscription operations."""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class SubscriptionCreate(BaseModel):
    tier: str = "free"
    stripe_price_id: Optional[str] = None


class SubscriptionResponse(BaseModel):
    id: str
    tier: str
    status: str
    max_sources: int
    max_files: int
    max_rules: int
    ai_categorizations_remaining: int
    crossover_memory_enabled: bool
    current_period_start: Optional[datetime] = None
    current_period_end: Optional[datetime] = None
    cancel_at_period_end: bool
    created_at: datetime

    class Config:
        from_attributes = True
