import fitz  # PyMuPDF
import logging

logger = logging.getLogger(__name__)

def parse_pdf_from_bytes(file_bytes: bytes) -> str:
    """
    Extracts plain text from a PDF file byte stream.
    """
    try:
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        text = ""
        for page in doc:
            text += page.get_text("text") + "\n"
        doc.close()
        return text.strip()
    except Exception as e:
        logger.error(f"Error parsing PDF: {e}")
        raise ValueError("Failed to parse PDF document. It might be corrupted or encrypted.")
