"""Initial schema — all core tables

Revision ID: 001
Revises:
Create Date: 2026-02-15
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

revision = "001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Users
    op.create_table(
        "users",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("email", sa.String(255), unique=True, nullable=False),
        sa.Column("display_name", sa.String(255)),
        sa.Column("avatar_url", sa.Text),
        sa.Column("hashed_password", sa.String(255)),
        sa.Column("google_id", sa.String(255), unique=True),
        sa.Column("github_id", sa.String(255), unique=True),
        sa.Column("is_active", sa.Boolean, default=True),
        sa.Column("is_admin", sa.Boolean, default=False),
        sa.Column("preferences", sa.Text),
        sa.Column("created_at", sa.DateTime(timezone=True)),
        sa.Column("updated_at", sa.DateTime(timezone=True)),
    )
    op.create_index("ix_users_email", "users", ["email"])
    op.create_index("ix_users_google_id", "users", ["google_id"])
    op.create_index("ix_users_github_id", "users", ["github_id"])

    # Sources
    op.create_table(
        "sources",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("source_type", sa.String(50), nullable=False),
        sa.Column("display_name", sa.String(255), nullable=False),
        sa.Column("status", sa.String(50), default="disconnected"),
        sa.Column("access_token", sa.Text),
        sa.Column("refresh_token", sa.Text),
        sa.Column("token_expires_at", sa.DateTime(timezone=True)),
        sa.Column("root_path", sa.Text),
        sa.Column("last_sync_at", sa.DateTime(timezone=True)),
        sa.Column("total_files", sa.String(20), default="0"),
        sa.Column("total_size_bytes", sa.String(20), default="0"),
        sa.Column("config", sa.Text),
        sa.Column("is_active", sa.Boolean, default=True),
        sa.Column("created_at", sa.DateTime(timezone=True)),
        sa.Column("updated_at", sa.DateTime(timezone=True)),
    )
    op.create_index("ix_sources_user_id", "sources", ["user_id"])

    # Categories
    op.create_table(
        "categories",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", UUID(as_uuid=True), sa.ForeignKey("users.id")),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("slug", sa.String(255), nullable=False),
        sa.Column("description", sa.Text),
        sa.Column("color", sa.String(7)),
        sa.Column("icon", sa.String(50)),
        sa.Column("parent_id", UUID(as_uuid=True), sa.ForeignKey("categories.id")),
        sa.Column("sort_order", sa.Integer, default=0),
        sa.Column("is_system", sa.Boolean, default=False),
        sa.Column("is_active", sa.Boolean, default=True),
        sa.Column("file_count", sa.Integer, default=0),
        sa.Column("created_at", sa.DateTime(timezone=True)),
        sa.Column("updated_at", sa.DateTime(timezone=True)),
    )
    op.create_index("ix_categories_slug", "categories", ["slug"])

    # Files
    op.create_table(
        "files",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("source_id", UUID(as_uuid=True), sa.ForeignKey("sources.id"), nullable=False),
        sa.Column("category_id", UUID(as_uuid=True), sa.ForeignKey("categories.id")),
        sa.Column("filename", sa.String(500), nullable=False),
        sa.Column("file_path", sa.Text, nullable=False),
        sa.Column("file_extension", sa.String(50)),
        sa.Column("mime_type", sa.String(255)),
        sa.Column("size_bytes", sa.BigInteger, default=0),
        sa.Column("checksum_sha256", sa.String(64)),
        sa.Column("ai_category", sa.String(255)),
        sa.Column("ai_confidence", sa.Float),
        sa.Column("ai_tags", sa.Text),
        sa.Column("ai_summary", sa.Text),
        sa.Column("external_id", sa.String(500)),
        sa.Column("external_url", sa.Text),
        sa.Column("is_duplicate", sa.Boolean, default=False),
        sa.Column("duplicate_of_id", UUID(as_uuid=True)),
        sa.Column("is_archived", sa.Boolean, default=False),
        sa.Column("is_deleted", sa.Boolean, default=False),
        sa.Column("file_created_at", sa.DateTime(timezone=True)),
        sa.Column("file_modified_at", sa.DateTime(timezone=True)),
        sa.Column("indexed_at", sa.DateTime(timezone=True)),
        sa.Column("created_at", sa.DateTime(timezone=True)),
        sa.Column("updated_at", sa.DateTime(timezone=True)),
    )
    op.create_index("ix_files_user_id", "files", ["user_id"])
    op.create_index("ix_files_source_id", "files", ["source_id"])
    op.create_index("ix_files_category_id", "files", ["category_id"])
    op.create_index("ix_files_checksum", "files", ["checksum_sha256"])

    # Routing Rules
    op.create_table(
        "routing_rules",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("description", sa.Text),
        sa.Column("is_active", sa.Boolean, default=True),
        sa.Column("priority", sa.Integer, default=0),
        sa.Column("conditions", sa.Text, nullable=False),
        sa.Column("actions", sa.Text, nullable=False),
        sa.Column("rule_type", sa.String(50), default="manual"),
        sa.Column("times_triggered", sa.Integer, default=0),
        sa.Column("last_triggered_at", sa.DateTime(timezone=True)),
        sa.Column("created_at", sa.DateTime(timezone=True)),
        sa.Column("updated_at", sa.DateTime(timezone=True)),
    )
    op.create_index("ix_routing_rules_user_id", "routing_rules", ["user_id"])

    # Sync Logs
    op.create_table(
        "sync_logs",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("source_id", UUID(as_uuid=True), sa.ForeignKey("sources.id")),
        sa.Column("operation", sa.String(50), nullable=False),
        sa.Column("status", sa.String(50), default="pending"),
        sa.Column("message", sa.Text),
        sa.Column("details", sa.Text),
        sa.Column("files_processed", sa.Integer, default=0),
        sa.Column("files_added", sa.Integer, default=0),
        sa.Column("files_updated", sa.Integer, default=0),
        sa.Column("files_removed", sa.Integer, default=0),
        sa.Column("bytes_processed", sa.BigInteger, default=0),
        sa.Column("duplicates_found", sa.Integer, default=0),
        sa.Column("started_at", sa.DateTime(timezone=True)),
        sa.Column("completed_at", sa.DateTime(timezone=True)),
        sa.Column("created_at", sa.DateTime(timezone=True)),
    )
    op.create_index("ix_sync_logs_user_id", "sync_logs", ["user_id"])

    # Subscriptions
    op.create_table(
        "subscriptions",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", UUID(as_uuid=True), sa.ForeignKey("users.id"), unique=True, nullable=False),
        sa.Column("stripe_customer_id", sa.String(255), unique=True),
        sa.Column("stripe_subscription_id", sa.String(255), unique=True),
        sa.Column("stripe_price_id", sa.String(255)),
        sa.Column("tier", sa.String(50), default="free"),
        sa.Column("status", sa.String(50), default="active"),
        sa.Column("max_sources", sa.Integer, default=2),
        sa.Column("max_files", sa.Integer, default=500),
        sa.Column("max_rules", sa.Integer, default=5),
        sa.Column("ai_categorizations_remaining", sa.Integer, default=50),
        sa.Column("crossover_memory_enabled", sa.Boolean, default=False),
        sa.Column("current_period_start", sa.DateTime(timezone=True)),
        sa.Column("current_period_end", sa.DateTime(timezone=True)),
        sa.Column("cancel_at_period_end", sa.Boolean, default=False),
        sa.Column("created_at", sa.DateTime(timezone=True)),
        sa.Column("updated_at", sa.DateTime(timezone=True)),
    )


def downgrade() -> None:
    op.drop_table("subscriptions")
    op.drop_table("sync_logs")
    op.drop_table("routing_rules")
    op.drop_table("files")
    op.drop_table("categories")
    op.drop_table("sources")
    op.drop_table("users")
