"""
Subscription model — Stripe-integrated subscription tiers.
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, Text, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base


class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True, nullable=False)

    # Stripe fields
    stripe_customer_id = Column(String(255), nullable=True, unique=True)
    stripe_subscription_id = Column(String(255), nullable=True, unique=True)
    stripe_price_id = Column(String(255), nullable=True)

    # Tier: free, pro, enterprise
    tier = Column(String(50), default="free", nullable=False)
    status = Column(String(50), default="active")  # active, past_due, canceled, trialing

    # Limits based on tier
    max_sources = Column(Integer, default=2)  # Free: 2, Pro: 10, Enterprise: unlimited
    max_files = Column(Integer, default=500)  # Free: 500, Pro: 50000, Enterprise: unlimited
    max_rules = Column(Integer, default=5)  # Free: 5, Pro: 100, Enterprise: unlimited
    ai_categorizations_remaining = Column(Integer, default=50)  # Monthly AI calls
    crossover_memory_enabled = Column(Boolean, default=False)  # Premium feature

    # Billing
    current_period_start = Column(DateTime(timezone=True), nullable=True)
    current_period_end = Column(DateTime(timezone=True), nullable=True)
    cancel_at_period_end = Column(Boolean, default=False)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    user = relationship("User", back_populates="subscription")
