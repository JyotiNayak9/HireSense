import io
import re
from pathlib import Path
from typing import Optional

import docx
import PyPDF2
import requests


PDF_CONTENT_TYPES = {"application/pdf"}
DOCX_CONTENT_TYPES = {
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/octet-stream",
}


def normalize_text(text: str) -> str:
    return re.sub(r"\s+", " ", text or "").strip()


def extract_text_from_pdf_bytes(file_bytes: bytes) -> str:
    text_parts = []
    reader = PyPDF2.PdfReader(io.BytesIO(file_bytes))

    for page in reader.pages:
        page_text = page.extract_text() or ""
        if page_text:
            text_parts.append(page_text)

    return normalize_text(" ".join(text_parts))


def extract_text_from_docx_bytes(file_bytes: bytes) -> str:
    document = docx.Document(io.BytesIO(file_bytes))
    text_parts = [paragraph.text for paragraph in document.paragraphs if paragraph.text]
    return normalize_text(" ".join(text_parts))


def extract_text_from_file(file_path: str) -> str:
    path = Path(file_path)
    file_bytes = path.read_bytes()

    if path.suffix.lower() == ".pdf":
        return extract_text_from_pdf_bytes(file_bytes)

    if path.suffix.lower() == ".docx":
        return extract_text_from_docx_bytes(file_bytes)

    return ""


def extract_text_from_url(file_url: str, original_name: Optional[str] = None) -> str:
    response = requests.get(file_url, timeout=25)
    response.raise_for_status()

    content_type = response.headers.get("content-type", "").split(";")[0].strip().lower()
    filename = (original_name or file_url).lower()
    file_bytes = response.content

    if filename.endswith(".pdf") or content_type in PDF_CONTENT_TYPES:
        return extract_text_from_pdf_bytes(file_bytes)

    if filename.endswith(".docx") or content_type in DOCX_CONTENT_TYPES:
        return extract_text_from_docx_bytes(file_bytes)

    return ""
