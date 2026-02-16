"""
Deduplication service — detects duplicate files across all connected sources.
Uses SHA-256 checksums and filename similarity for detection.
"""
import hashlib
import structlog
from typing import List, Dict, Tuple, Optional
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.file import File

logger = structlog.get_logger()


class DeduplicationService:
    """Detects and manages duplicate files across sources."""

    @staticmethod
    async def find_duplicates_by_checksum(
        db: AsyncSession, user_id: str
    ) -> List[Dict]:
        """Find files with identical checksums (exact duplicates)."""
        # Find checksums that appear more than once
        stmt = (
            select(File.checksum_sha256, func.count(File.id).label("count"))
            .where(
                File.user_id == user_id,
                File.checksum_sha256.isnot(None),
                File.is_deleted == False,
            )
            .group_by(File.checksum_sha256)
            .having(func.count(File.id) > 1)
        )
        result = await db.execute(stmt)
        duplicate_checksums = result.all()

        duplicates = []
        for checksum, count in duplicate_checksums:
            files_stmt = (
                select(File)
                .where(
                    File.user_id == user_id,
                    File.checksum_sha256 == checksum,
                    File.is_deleted == False,
                )
                .order_by(File.indexed_at.asc())
            )
            files_result = await db.execute(files_stmt)
            files = files_result.scalars().all()

            duplicates.append({
                "checksum": checksum,
                "count": count,
                "files": [
                    {
                        "id": str(f.id),
                        "filename": f.filename,
                        "file_path": f.file_path,
                        "source_id": str(f.source_id),
                        "size_bytes": f.size_bytes,
                        "indexed_at": f.indexed_at.isoformat() if f.indexed_at else None,
                    }
                    for f in files
                ],
                "total_wasted_bytes": sum(f.size_bytes for f in files[1:]),
            })

        return duplicates

    @staticmethod
    async def find_similar_filenames(
        db: AsyncSession, user_id: str, threshold: float = 0.8
    ) -> List[Dict]:
        """Find files with similar names (potential duplicates)."""
        stmt = (
            select(File)
            .where(File.user_id == user_id, File.is_deleted == False)
            .order_by(File.filename)
        )
        result = await db.execute(stmt)
        files = result.scalars().all()

        # Group by base filename (without extension and common suffixes)
        similar_groups = {}
        for f in files:
            base = _normalize_filename(f.filename)
            if base not in similar_groups:
                similar_groups[base] = []
            similar_groups[base].append(f)

        return [
            {
                "base_name": base,
                "count": len(group),
                "files": [
                    {
                        "id": str(f.id),
                        "filename": f.filename,
                        "source_id": str(f.source_id),
                        "size_bytes": f.size_bytes,
                    }
                    for f in group
                ],
            }
            for base, group in similar_groups.items()
            if len(group) > 1
        ]

    @staticmethod
    async def mark_duplicates(
        db: AsyncSession, file_ids: List[str], original_id: str
    ) -> int:
        """Mark files as duplicates of an original."""
        count = 0
        for fid in file_ids:
            if fid == original_id:
                continue
            stmt = select(File).where(File.id == fid)
            result = await db.execute(stmt)
            file = result.scalar_one_or_none()
            if file:
                file.is_duplicate = True
                file.duplicate_of_id = original_id
                count += 1
        await db.flush()
        return count

    @staticmethod
    def compute_checksum(data: bytes) -> str:
        """Compute SHA-256 checksum of file data."""
        return hashlib.sha256(data).hexdigest()


def _normalize_filename(filename: str) -> str:
    """Normalize filename for similarity comparison."""
    import re
    # Remove extension
    name = filename.rsplit(".", 1)[0] if "." in filename else filename
    # Remove common suffixes like (1), _copy, -v2, etc.
    name = re.sub(r"[\s_-]*(copy|\(\d+\)|v\d+|final|draft|new|old|backup)[\s_-]*", "", name, flags=re.IGNORECASE)
    # Lowercase and strip
    return name.lower().strip()


deduplication_service = DeduplicationService()
