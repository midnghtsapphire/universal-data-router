"""
Test suite for Universal Data Router API.
"""
import pytest
from unittest.mock import patch, MagicMock, AsyncMock
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
)
from app.core.carbon import CarbonMetrics
from app.services.ai_categorizer import AICategorizer
from app.services.converter import FileConverter
from app.services.deduplication import _normalize_filename


# ── Security Tests ───────────────────────────────────────────────


class TestSecurity:
    """Test authentication and authorization utilities."""

    def test_password_hashing(self):
        password = "TestPassword123!"
        hashed = hash_password(password)
        assert hashed != password
        assert verify_password(password, hashed)
        assert not verify_password("wrong_password", hashed)

    def test_access_token_creation(self):
        token = create_access_token({"sub": "user-123"})
        assert token is not None
        payload = decode_token(token)
        assert payload["sub"] == "user-123"
        assert payload["type"] == "access"

    def test_refresh_token_creation(self):
        token = create_refresh_token({"sub": "user-456"})
        assert token is not None
        payload = decode_token(token)
        assert payload["sub"] == "user-456"
        assert payload["type"] == "refresh"

    def test_invalid_token_raises(self):
        from fastapi import HTTPException
        with pytest.raises(HTTPException):
            decode_token("invalid.token.here")


# ── Carbon Tracking Tests ────────────────────────────────────────


class TestCarbonTracking:
    """Test carbon footprint tracking."""

    def test_initial_metrics(self):
        metrics = CarbonMetrics()
        summary = metrics.get_summary()
        assert summary["total_api_calls"] == 0
        assert summary["estimated_co2_grams"] == 0

    def test_record_api_call(self):
        metrics = CarbonMetrics()
        metrics.record_api_call(0.5, 1024)
        summary = metrics.get_summary()
        assert summary["total_api_calls"] == 1
        assert summary["total_processing_seconds"] == 0.5
        assert summary["estimated_co2_grams"] > 0

    def test_reset_metrics(self):
        metrics = CarbonMetrics()
        metrics.record_api_call(1.0, 2048)
        metrics.reset()
        summary = metrics.get_summary()
        assert summary["total_api_calls"] == 0

    def test_trees_equivalent(self):
        metrics = CarbonMetrics()
        metrics.record_api_call(3600, 1073741824)  # 1 hour, 1 GB
        summary = metrics.get_summary()
        assert summary["trees_equivalent_offset"] > 0


# ── AI Categorizer Tests ─────────────────────────────────────────


class TestAICategorizer:
    """Test AI-powered file categorization."""

    def test_fallback_categorize_pdf(self):
        categorizer = AICategorizer()
        result = categorizer._fallback_categorize("report.pdf", ".pdf")
        assert result["category"] == "Documents"
        assert result["confidence"] == 0.85

    def test_fallback_categorize_image(self):
        categorizer = AICategorizer()
        result = categorizer._fallback_categorize("photo.jpg", ".jpg")
        assert result["category"] == "Images"

    def test_fallback_categorize_code(self):
        categorizer = AICategorizer()
        result = categorizer._fallback_categorize("main.py", ".py")
        assert result["category"] == "Code"

    def test_fallback_categorize_spreadsheet(self):
        categorizer = AICategorizer()
        result = categorizer._fallback_categorize("data.xlsx", ".xlsx")
        assert result["category"] == "Spreadsheets"

    def test_fallback_categorize_unknown(self):
        categorizer = AICategorizer()
        result = categorizer._fallback_categorize("mystery.xyz", ".xyz")
        assert result["category"] == "Other"
        assert result["confidence"] == 0.3

    def test_fallback_categorize_archive(self):
        categorizer = AICategorizer()
        result = categorizer._fallback_categorize("backup.zip", ".zip")
        assert result["category"] == "Archives"

    def test_fallback_categorize_video(self):
        categorizer = AICategorizer()
        result = categorizer._fallback_categorize("meeting.mp4", ".mp4")
        assert result["category"] == "Videos"

    def test_fallback_categorize_audio(self):
        categorizer = AICategorizer()
        result = categorizer._fallback_categorize("song.mp3", ".mp3")
        assert result["category"] == "Audio"


# ── File Converter Tests ─────────────────────────────────────────


class TestFileConverter:
    """Test file format conversion."""

    def test_supported_conversions(self):
        conversions = FileConverter.get_supported_conversions()
        assert "csv" in conversions
        assert "xlsx" in conversions["csv"]
        assert "png" in conversions
        assert "jpg" in conversions["png"]

    @pytest.mark.asyncio
    async def test_csv_to_xlsx(self):
        csv_data = b"Name,Age,City\nAlice,30,Denver\nBob,25,Boulder"
        result, filename = await FileConverter.convert(csv_data, "csv", "xlsx", "data.csv")
        assert result is not None
        assert filename == "data.xlsx"
        assert len(result) > 0

    @pytest.mark.asyncio
    async def test_md_to_html(self):
        md_data = b"# Hello World\n\nThis is a test."
        result, filename = await FileConverter.convert(md_data, "md", "html", "readme.md")
        assert b"Hello World" in result
        assert filename == "readme.html"

    @pytest.mark.asyncio
    async def test_unsupported_conversion_raises(self):
        with pytest.raises(ValueError):
            await FileConverter.convert(b"data", "xyz", "abc", "file.xyz")


# ── Deduplication Tests ──────────────────────────────────────────


class TestDeduplication:
    """Test deduplication utilities."""

    def test_normalize_filename_basic(self):
        assert _normalize_filename("report.pdf") == "report"

    def test_normalize_filename_with_copy(self):
        assert _normalize_filename("report copy.pdf") == "report"
        assert _normalize_filename("report_copy.pdf") == "report"

    def test_normalize_filename_with_number(self):
        assert _normalize_filename("report (1).pdf") == "report"
        assert _normalize_filename("report (2).pdf") == "report"

    def test_normalize_filename_with_version(self):
        assert _normalize_filename("report_v2.pdf") == "report"
        assert _normalize_filename("report-v3.pdf") == "report"

    def test_normalize_filename_with_draft(self):
        assert _normalize_filename("report_draft.pdf") == "report"
        assert _normalize_filename("report_final.pdf") == "report"

    def test_normalize_filename_case_insensitive(self):
        assert _normalize_filename("Report.PDF") == "report"


# ── Schema Validation Tests ──────────────────────────────────────


class TestSchemas:
    """Test Pydantic schema validation."""

    def test_user_create(self):
        from app.schemas.user import UserCreate
        user = UserCreate(email="test@example.com", password="pass123")
        assert user.email == "test@example.com"

    def test_source_create(self):
        from app.schemas.source import SourceCreate
        source = SourceCreate(source_type="google_drive", display_name="My Drive")
        assert source.source_type == "google_drive"

    def test_rule_create(self, sample_rule_data):
        from app.schemas.rule import RuleCreate
        rule = RuleCreate(**sample_rule_data)
        assert rule.name == "Sort PDFs to Documents"
        assert rule.priority == 10

    def test_file_search_query(self):
        from app.schemas.file import FileSearchQuery
        query = FileSearchQuery(query="invoice", page=1, per_page=20)
        assert query.query == "invoice"
        assert query.include_duplicates is False

    def test_subscription_response(self):
        from app.schemas.subscription import SubscriptionResponse
        from datetime import datetime, timezone
        sub = SubscriptionResponse(
            id="test-id",
            tier="pro",
            status="active",
            max_sources=10,
            max_files=50000,
            max_rules=100,
            ai_categorizations_remaining=500,
            crossover_memory_enabled=False,
            cancel_at_period_end=False,
            created_at=datetime.now(timezone.utc),
        )
        assert sub.tier == "pro"


# ── Billing Service Tests ────────────────────────────────────────


class TestBillingService:
    """Test billing tier limits."""

    def test_free_tier_limits(self):
        from app.services.billing import billing_service
        limits = billing_service.get_tier_limits("free")
        assert limits["max_sources"] == 2
        assert limits["max_files"] == 500
        assert limits["crossover_memory"] is False

    def test_pro_tier_limits(self):
        from app.services.billing import billing_service
        limits = billing_service.get_tier_limits("pro")
        assert limits["max_sources"] == 10
        assert limits["max_files"] == 50000

    def test_enterprise_tier_limits(self):
        from app.services.billing import billing_service
        limits = billing_service.get_tier_limits("enterprise")
        assert limits["crossover_memory"] is True
        assert limits["ai_categorizations_monthly"] == 5000

    def test_unknown_tier_defaults_to_free(self):
        from app.services.billing import billing_service
        limits = billing_service.get_tier_limits("unknown")
        assert limits["max_sources"] == 2
