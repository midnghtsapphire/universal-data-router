"""
Test configuration and fixtures for Universal Data Router.
"""
import pytest
import asyncio
from httpx import AsyncClient, ASGITransport
from unittest.mock import patch, MagicMock

# Mock settings before importing app
with patch.dict("os.environ", {
    "DATABASE_URL": "sqlite+aiosqlite:///./test.db",
    "DATABASE_URL_SYNC": "sqlite:///./test.db",
    "REDIS_URL": "redis://localhost:6379/15",
    "CELERY_BROKER_URL": "redis://localhost:6379/14",
    "CELERY_RESULT_BACKEND": "redis://localhost:6379/13",
    "SECRET_KEY": "test-secret-key-do-not-use-in-production",
    "OPENROUTER_API_KEY": "test-key",
    "STRIPE_SECRET_KEY": "sk_test_fake",
    "STRIPE_WEBHOOK_SECRET": "whsec_test_fake",
}):
    pass


@pytest.fixture(scope="session")
def event_loop():
    """Create an event loop for the test session."""
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest.fixture
def mock_db():
    """Mock database session."""
    db = MagicMock()
    db.execute = MagicMock()
    db.flush = MagicMock()
    db.commit = MagicMock()
    db.rollback = MagicMock()
    return db


@pytest.fixture
def sample_user_data():
    """Sample user registration data."""
    return {
        "email": "test@glowstarlabs.com",
        "display_name": "Test User",
        "password": "SecurePassword123!",
    }


@pytest.fixture
def sample_source_data():
    """Sample source creation data."""
    return {
        "source_type": "google_drive",
        "display_name": "My Google Drive",
    }


@pytest.fixture
def sample_rule_data():
    """Sample routing rule data."""
    return {
        "name": "Sort PDFs to Documents",
        "description": "Automatically categorize PDF files as Documents",
        "priority": 10,
        "conditions": '{"match_type": "all", "rules": [{"field": "file_extension", "operator": "eq", "value": ".pdf"}]}',
        "actions": '{"actions": [{"type": "categorize", "category": "Documents"}]}',
        "rule_type": "manual",
        "is_active": True,
    }


@pytest.fixture
def sample_file_data():
    """Sample file metadata."""
    return {
        "filename": "quarterly_report_2026.pdf",
        "file_extension": ".pdf",
        "file_path": "/documents/reports/quarterly_report_2026.pdf",
        "size_bytes": 2048576,
        "source_type": "google_drive",
        "mime_type": "application/pdf",
    }
