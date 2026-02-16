"""
File format conversion service — converts files between formats on-the-fly.
"""
import io
import structlog
from typing import Optional, Tuple

logger = structlog.get_logger()

# Supported conversion paths
CONVERSION_MAP = {
    # Document conversions
    ("docx", "pdf"): "docx_to_pdf",
    ("md", "pdf"): "md_to_pdf",
    ("md", "html"): "md_to_html",
    ("txt", "pdf"): "txt_to_pdf",
    ("csv", "xlsx"): "csv_to_xlsx",
    ("xlsx", "csv"): "xlsx_to_csv",
    # Image conversions
    ("png", "jpg"): "image_convert",
    ("jpg", "png"): "image_convert",
    ("webp", "png"): "image_convert",
    ("bmp", "png"): "image_convert",
    ("svg", "png"): "svg_to_png",
}


class FileConverter:
    """Handles file format conversions."""

    @staticmethod
    def get_supported_conversions() -> dict:
        """Return map of supported source -> target format conversions."""
        result = {}
        for (src, tgt), method in CONVERSION_MAP.items():
            if src not in result:
                result[src] = []
            result[src].append(tgt)
        return result

    @staticmethod
    async def convert(
        data: bytes,
        source_format: str,
        target_format: str,
        filename: str = "file",
    ) -> Tuple[bytes, str]:
        """
        Convert file data from source to target format.
        Returns (converted_data, new_filename).
        """
        key = (source_format.lower().lstrip("."), target_format.lower().lstrip("."))
        method_name = CONVERSION_MAP.get(key)

        if not method_name:
            raise ValueError(
                f"Conversion from {source_format} to {target_format} is not supported"
            )

        converter_fn = getattr(FileConverter, f"_convert_{method_name}", None)
        if not converter_fn:
            raise NotImplementedError(f"Converter {method_name} not implemented")

        new_data = await converter_fn(data, filename)
        new_filename = filename.rsplit(".", 1)[0] + f".{target_format.lstrip('.')}"
        return new_data, new_filename

    @staticmethod
    async def _convert_image_convert(data: bytes, filename: str) -> bytes:
        """Convert between image formats using Pillow."""
        from PIL import Image
        img = Image.open(io.BytesIO(data))
        output = io.BytesIO()
        # Determine target format from context
        fmt = "PNG"  # Default
        if filename.lower().endswith((".jpg", ".jpeg")):
            fmt = "JPEG"
            if img.mode == "RGBA":
                img = img.convert("RGB")
        img.save(output, format=fmt)
        return output.getvalue()

    @staticmethod
    async def _convert_csv_to_xlsx(data: bytes, filename: str) -> bytes:
        """Convert CSV to XLSX."""
        import csv
        from openpyxl import Workbook

        reader = csv.reader(io.StringIO(data.decode("utf-8")))
        wb = Workbook()
        ws = wb.active
        for row in reader:
            ws.append(row)
        output = io.BytesIO()
        wb.save(output)
        return output.getvalue()

    @staticmethod
    async def _convert_xlsx_to_csv(data: bytes, filename: str) -> bytes:
        """Convert XLSX to CSV."""
        import csv
        from openpyxl import load_workbook

        wb = load_workbook(io.BytesIO(data))
        ws = wb.active
        output = io.StringIO()
        writer = csv.writer(output)
        for row in ws.iter_rows(values_only=True):
            writer.writerow(row)
        return output.getvalue().encode("utf-8")

    @staticmethod
    async def _convert_md_to_html(data: bytes, filename: str) -> bytes:
        """Convert Markdown to HTML."""
        import markdown
        html = markdown.markdown(data.decode("utf-8"), extensions=["tables", "fenced_code"])
        full_html = f"""<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>{filename}</title></head>
<body>{html}</body>
</html>"""
        return full_html.encode("utf-8")

    @staticmethod
    async def _convert_txt_to_pdf(data: bytes, filename: str) -> bytes:
        """Convert plain text to PDF."""
        from fpdf import FPDF
        pdf = FPDF()
        pdf.add_page()
        pdf.set_font("Helvetica", size=11)
        text = data.decode("utf-8", errors="replace")
        for line in text.split("\n"):
            pdf.cell(0, 6, line, new_x="LMARGIN", new_y="NEXT")
        output = io.BytesIO()
        pdf.output(output)
        return output.getvalue()


file_converter = FileConverter()
