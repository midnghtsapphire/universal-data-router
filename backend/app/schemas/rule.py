"""Pydantic schemas for RoutingRule operations."""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class RuleCreate(BaseModel):
    name: str
    description: Optional[str] = None
    priority: int = 0
    conditions: str  # JSON string
    actions: str  # JSON string
    rule_type: str = "manual"
    is_active: bool = True


class RuleUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[int] = None
    conditions: Optional[str] = None
    actions: Optional[str] = None
    is_active: Optional[bool] = None


class RuleResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    is_active: bool
    priority: int
    conditions: str
    actions: str
    rule_type: str
    times_triggered: int
    last_triggered_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True
