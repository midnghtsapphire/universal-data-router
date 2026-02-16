"""
AI-powered file categorization service using OpenRouter API.
Provides automatic file classification, tagging, and summarization.
"""
import json
import structlog
from typing import Dict, List, Optional, Tuple
from openai import AsyncOpenAI
from app.core.config import settings

logger = structlog.get_logger()

# System prompt for file categorization
CATEGORIZATION_PROMPT = """You are an AI file categorization assistant for Universal Data Router by GlowStarLabs.
Your job is to analyze file metadata and classify files into categories.

Given file information (name, extension, path, size, source), return a JSON object with:
- "category": One of the predefined categories below
- "confidence": Float 0.0-1.0 indicating confidence
- "tags": Array of relevant tags (max 5)
- "summary": Brief one-line description of what this file likely contains

Predefined categories:
- Documents: Reports, articles, papers, text files
- Spreadsheets: Data files, CSVs, Excel files
- Presentations: Slides, pitch decks
- Images: Photos, graphics, screenshots, icons
- Videos: Video files, recordings
- Audio: Music, podcasts, voice memos
- Code: Source code, scripts, config files
- Archives: ZIP, TAR, compressed files
- Finance: Invoices, receipts, tax documents, bank statements
- Legal: Contracts, agreements, legal documents
- Medical: Health records, prescriptions
- Education: Course materials, certificates, transcripts
- Design: UI mockups, wireframes, design files
- Communication: Emails, chat logs, letters
- Personal: Personal documents, IDs, photos
- Project: Project plans, requirements, specs
- Marketing: Ads, campaigns, social media content
- Other: Uncategorizable files

Respond ONLY with valid JSON. No markdown, no explanation."""


class AICategorizer:
    """Handles AI-powered file categorization via OpenRouter."""

    def __init__(self):
        self.client = AsyncOpenAI(
            api_key=settings.OPENROUTER_API_KEY,
            base_url=settings.OPENROUTER_BASE_URL,
        )
        self.model = settings.AI_MODEL

    async def categorize_file(
        self,
        filename: str,
        file_extension: str,
        file_path: str,
        size_bytes: int,
        source_type: str,
        mime_type: Optional[str] = None,
    ) -> Dict:
        """Categorize a single file using AI."""
        try:
            file_info = (
                f"Filename: {filename}\n"
                f"Extension: {file_extension}\n"
                f"Path: {file_path}\n"
                f"Size: {size_bytes} bytes\n"
                f"Source: {source_type}\n"
                f"MIME Type: {mime_type or 'unknown'}"
            )

            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": CATEGORIZATION_PROMPT},
                    {"role": "user", "content": f"Categorize this file:\n{file_info}"},
                ],
                temperature=0.1,
                max_tokens=200,
            )

            result_text = response.choices[0].message.content.strip()
            # Parse JSON response
            result = json.loads(result_text)
            return {
                "category": result.get("category", "Other"),
                "confidence": min(max(float(result.get("confidence", 0.5)), 0.0), 1.0),
                "tags": result.get("tags", [])[:5],
                "summary": result.get("summary", ""),
            }

        except json.JSONDecodeError:
            logger.warning("AI returned non-JSON response", response=result_text)
            return self._fallback_categorize(filename, file_extension)
        except Exception as e:
            logger.error("AI categorization failed", error=str(e))
            return self._fallback_categorize(filename, file_extension)

    async def categorize_batch(
        self, files: List[Dict]
    ) -> List[Dict]:
        """Categorize multiple files."""
        results = []
        for file_info in files:
            result = await self.categorize_file(**file_info)
            results.append(result)
        return results

    def _fallback_categorize(self, filename: str, extension: str) -> Dict:
        """Rule-based fallback when AI is unavailable."""
        ext = (extension or "").lower().lstrip(".")
        category_map = {
            "Documents": ["pdf", "doc", "docx", "txt", "rtf", "odt", "md", "tex"],
            "Spreadsheets": ["xls", "xlsx", "csv", "tsv", "ods", "numbers"],
            "Presentations": ["ppt", "pptx", "key", "odp"],
            "Images": ["jpg", "jpeg", "png", "gif", "bmp", "svg", "webp", "ico", "tiff"],
            "Videos": ["mp4", "avi", "mov", "mkv", "wmv", "flv", "webm"],
            "Audio": ["mp3", "wav", "flac", "aac", "ogg", "wma", "m4a"],
            "Code": ["py", "js", "ts", "jsx", "tsx", "java", "cpp", "c", "h", "go", "rs",
                      "rb", "php", "html", "css", "scss", "json", "yaml", "yml", "xml",
                      "sql", "sh", "bash", "ps1", "dockerfile"],
            "Archives": ["zip", "tar", "gz", "rar", "7z", "bz2", "xz"],
            "Design": ["psd", "ai", "sketch", "fig", "xd", "indd"],
        }

        for category, extensions in category_map.items():
            if ext in extensions:
                return {
                    "category": category,
                    "confidence": 0.85,
                    "tags": [ext, category.lower()],
                    "summary": f"{category} file: {filename}",
                }

        return {
            "category": "Other",
            "confidence": 0.3,
            "tags": [ext] if ext else [],
            "summary": f"Uncategorized file: {filename}",
        }

    async def suggest_rules(self, file_patterns: List[Dict]) -> List[Dict]:
        """Use AI to suggest routing rules based on file patterns."""
        try:
            patterns_text = json.dumps(file_patterns[:20], indent=2)
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "You are a file organization expert. Given file patterns, "
                            "suggest routing rules. Return a JSON array of rule objects with: "
                            "name, description, conditions (match criteria), actions (what to do). "
                            "Respond ONLY with valid JSON."
                        ),
                    },
                    {
                        "role": "user",
                        "content": f"Suggest routing rules for these file patterns:\n{patterns_text}",
                    },
                ],
                temperature=0.3,
                max_tokens=500,
            )
            return json.loads(response.choices[0].message.content.strip())
        except Exception as e:
            logger.error("AI rule suggestion failed", error=str(e))
            return []


# Singleton
ai_categorizer = AICategorizer()
