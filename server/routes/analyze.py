from fastapi import APIRouter
from models import DocumentLayout

router = APIRouter(prefix="/analyze", tags=["analyze"])

@router.post("/keyphrases")
async def keyphrases(doc: DocumentLayout):
    # Simple placeholder: treat capitalized words as keyphrases
    phrases = []
    for page in doc.pages:
        for line in page.lines:
            for token in line.text.split():
                if token[:1].isupper() and token[1:].islower():
                    phrases.append(token)
    # Dedup and cap
    phrases = sorted(list({p.strip(',.;:') for p in phrases}))[:25]
    return {"keyphrases": phrases}