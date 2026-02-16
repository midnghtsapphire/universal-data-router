"""
RoutingRule model — defines how files are automatically categorized and routed.
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, Text, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base


class RoutingRule(Base):
    __tablename__ = "routing_rules"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)

    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    priority = Column(Integer, default=0)  # Higher = runs first

    # Conditions (JSON)
    conditions = Column(Text, nullable=False)
    # Example: {"match_type": "all", "rules": [
    #   {"field": "file_extension", "operator": "in", "value": [".pdf", ".doc"]},
    #   {"field": "source_type", "operator": "eq", "value": "google_drive"},
    #   {"field": "filename", "operator": "contains", "value": "invoice"}
    # ]}

    # Actions (JSON)
    actions = Column(Text, nullable=False)
    # Example: {"actions": [
    #   {"type": "categorize", "category_id": "..."},
    #   {"type": "move", "destination_source_id": "...", "destination_path": "/invoices/"},
    #   {"type": "tag", "tags": ["finance", "invoice"]},
    #   {"type": "convert", "target_format": "pdf"}
    # ]}

    # Rule type
    rule_type = Column(String(50), default="manual")  # manual, ai_suggested, ml_learned

    # Stats
    times_triggered = Column(Integer, default=0)
    last_triggered_at = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    user = relationship("User", back_populates="rules")
