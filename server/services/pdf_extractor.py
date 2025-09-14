from __future__ import annotations
import io
from typing import Dict, Any, List


try:
    import fitz # PyMuPDF
except Exception: # pragma: no cover
    fitz = None


from models import DocumentLayout, Page, Line, Word


def extract_layout(file_bytes: bytes) -> DocumentLayout:
    """Return a normalized layout with pages, lines, and optional word boxes.
    Falls back to a naive line split if PyMuPDF is unavailable or for non-PDF files.
    """
    try:
        # Try to detect if it's a PDF by checking the header
        if not file_bytes.startswith(b'%PDF-'):
            # Not a PDF file, treat as text
            text = file_bytes.decode(errors="ignore")
            lines = [Line(index=i, text=t) for i, t in enumerate(text.splitlines()) if t.strip()]
            return DocumentLayout(pages=[Page(index=0, lines=lines)])
        
        if fitz is None:
            # Fallback: naive single-page, split on newlines
            text = file_bytes.decode(errors="ignore")
            lines = [Line(index=i, text=t) for i, t in enumerate(text.splitlines()) if t.strip()]
            return DocumentLayout(pages=[Page(index=0, lines=lines)])

        doc = fitz.open(stream=file_bytes, filetype="pdf")
    except Exception as e:
        # If PDF processing fails, fall back to text processing
        print(f"PDF processing failed, falling back to text: {e}")
        text = file_bytes.decode(errors="ignore")
        lines = [Line(index=i, text=t) for i, t in enumerate(text.splitlines()) if t.strip()]
        return DocumentLayout(pages=[Page(index=0, lines=lines)])
    pages: List[Page] = []

    for pno, page in enumerate(doc):
        width, height = page.rect.width, page.rect.height
        line_items: List[Line] = []

        # Extract words with boxes and then cluster into lines by y coordinate
        words = page.get_text("words") # [x0,y0,x1,y1, word, block_no, line_no, word_no]
        if not words:
            # blocks fallback
            for b in page.get_text("blocks"):
                x0, y0, x1, y1, txt, *_ = b
                for li, raw in enumerate(txt.splitlines()):
                    if raw.strip():
                        line_items.append(Line(index=len(line_items), text=raw, bbox=(x0,y0,x1,y1)))
        else:
            # group by (approx) y line buckets
            words_sorted = sorted(words, key=lambda w: (round(w[1] / 2) * 2, w[0]))
            current_y = None
            current_line_words: List[Word] = []
            current_bbox = [1e9,1e9,-1e9,-1e9]

            def flush():
                nonlocal current_line_words, current_bbox
                if not current_line_words:
                    return
                text = " ".join(w.t for w in current_line_words)
                bbox = tuple(current_bbox) if current_bbox[0] < 1e9 else None
                line_items.append(Line(index=len(line_items), text=text, bbox=bbox, words=current_line_words))
                current_line_words = []
                current_bbox[:] = [1e9,1e9,-1e9,-1e9]

            for x0,y0,x1,y1,w, *_ in words_sorted:
                y_bucket = round(y0 / 2) * 2
                if current_y is None:
                    current_y = y_bucket
                if abs(y_bucket - current_y) > 1.5: # new line
                    flush()
                    current_y = y_bucket
                current_line_words.append(Word(t=w, bbox=(x0,y0,x1,y1)))
                current_bbox[0] = min(current_bbox[0], x0)
                current_bbox[1] = min(current_bbox[1], y0)
                current_bbox[2] = max(current_bbox[2], x1)
                current_bbox[3] = max(current_bbox[3], y1)
            flush()
        pages.append(Page(index=pno, width=width, height=height, lines=line_items))

    return DocumentLayout(pages=pages)