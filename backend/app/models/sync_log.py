"""
SyncLog model — tracks sync operations between sources.
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Text, ForeignKey, Integer, BigInteger
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base


class SyncLog(Base):
    __tablename__ = "sync_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    source_id = Column(UUID(as_uuid=True), ForeignKey("sources.id"), nullable=True)

    operation = Column(String(50), nullable=False)  # scan, sync, categorize, deduplicate, backup
    status = Column(String(50), default="pending")  # pending, running, completed, failed
    message = Column(Text, nullable=True)
    details = Column(Text, nullable=True)  # JSON details

    files_processed = Column(Integer, default=0)
    files_added = Column(Integer, default=0)
    files_updated = Column(Integer, default=0)
    files_removed = Column(Integer, default=0)
    bytes_processed = Column(BigInteger, default=0)
    duplicates_found = Column(Integer, default=0)

    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relationships
    user = relationship("User", back_populates="sync_logs")
    source = relationship("Source", back_populates="sync_logs")
