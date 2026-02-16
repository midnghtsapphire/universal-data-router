"""
Source model — represents a connected data source (Gmail, Drive, GitHub, Dropbox, Local).
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, Text, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum
from app.core.database import Base


class SourceType(str, enum.Enum):
    GMAIL = "gmail"
    GOOGLE_DRIVE = "google_drive"
    GITHUB = "github"
    DROPBOX = "dropbox"
    LOCAL = "local"


class SourceStatus(str, enum.Enum):
    CONNECTED = "connected"
    DISCONNECTED = "disconnected"
    SYNCING = "syncing"
    ERROR = "error"


class Source(Base):
    __tablename__ = "sources"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    source_type = Column(String(50), nullable=False)
    display_name = Column(String(255), nullable=False)
    status = Column(String(50), default=SourceStatus.DISCONNECTED)
    access_token = Column(Text, nullable=True)  # Encrypted in production
    refresh_token = Column(Text, nullable=True)
    token_expires_at = Column(DateTime(timezone=True), nullable=True)
    root_path = Column(Text, nullable=True)  # For local filesystem
    last_sync_at = Column(DateTime(timezone=True), nullable=True)
    total_files = Column(String(20), default="0")
    total_size_bytes = Column(String(20), default="0")
    config = Column(Text, nullable=True)  # JSON config for source-specific settings
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    user = relationship("User", back_populates="sources")
    files = relationship("File", back_populates="source", cascade="all, delete-orphan")
    sync_logs = relationship("SyncLog", back_populates="source", cascade="all, delete-orphan")
