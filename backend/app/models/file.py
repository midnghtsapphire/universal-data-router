"""
File model — represents a file tracked across any connected source.
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, Text, BigInteger, ForeignKey, Float
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base


class File(Base):
    __tablename__ = "files"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    source_id = Column(UUID(as_uuid=True), ForeignKey("sources.id"), nullable=False, index=True)
    category_id = Column(UUID(as_uuid=True), ForeignKey("categories.id"), nullable=True, index=True)

    # File metadata
    filename = Column(String(500), nullable=False)
    file_path = Column(Text, nullable=False)
    file_extension = Column(String(50), nullable=True)
    mime_type = Column(String(255), nullable=True)
    size_bytes = Column(BigInteger, default=0)
    checksum_sha256 = Column(String(64), nullable=True, index=True)  # For deduplication

    # AI categorization
    ai_category = Column(String(255), nullable=True)
    ai_confidence = Column(Float, nullable=True)
    ai_tags = Column(Text, nullable=True)  # JSON array of tags
    ai_summary = Column(Text, nullable=True)

    # Source-specific identifiers
    external_id = Column(String(500), nullable=True)  # ID in the source system
    external_url = Column(Text, nullable=True)

    # Status
    is_duplicate = Column(Boolean, default=False)
    duplicate_of_id = Column(UUID(as_uuid=True), nullable=True)
    is_archived = Column(Boolean, default=False)
    is_deleted = Column(Boolean, default=False)

    # Timestamps
    file_created_at = Column(DateTime(timezone=True), nullable=True)
    file_modified_at = Column(DateTime(timezone=True), nullable=True)
    indexed_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    user = relationship("User", back_populates="files")
    source = relationship("Source", back_populates="files")
    category = relationship("Category", back_populates="files")
