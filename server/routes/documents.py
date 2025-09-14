from fastapi import APIRouter, UploadFile, File, HTTPException
from models import DocumentLayout, ADHDReadingSettings
from services.pdf_extractor import extract_layout
from services.gemini_service import get_gemini_service
from services.enhanced_tts import get_tts_service
from services.solana_service import get_solana_service
from services.mongodb_service import get_mongodb_service
import uuid

router = APIRouter(prefix="/documents", tags=["documents"])

@router.post("", response_model=DocumentLayout)
async def upload(file: UploadFile = File(...), user_id: str = "demo_user"):
    content = await file.read()
    if not content:
        raise HTTPException(400, "Empty file")
    
    # Extract basic layout
    layout = extract_layout(content)
    
    # Enhance with Gemini AI analysis
    try:
        gemini = get_gemini_service()
        
        # Analyze all lines for ADHD-friendly features
        all_lines = []
        for page in layout.pages:
            all_lines.extend(page.lines)
        
        enhanced_lines = await gemini.analyze_document_content(all_lines)
        
        # Identify characters and genre
        characters = await gemini.identify_characters(enhanced_lines)
        genre_info = await gemini.determine_genre_and_reading_level(enhanced_lines)
        
        # Update layout with enhanced data
        layout.characters = characters
        layout.genre = genre_info.get("genre")
        layout.reading_level = genre_info.get("reading_level")
        
        # Update pages with enhanced lines
        line_index = 0
        for page in layout.pages:
            page_lines = []
            for _ in page.lines:
                if line_index < len(enhanced_lines):
                    page_lines.append(enhanced_lines[line_index])
                    line_index += 1
            page.lines = page_lines
        
        # Generate visualizations for important lines
        for page in layout.pages:
            for line in page.lines:
                if line.importance_score > 0.7:  # High importance lines
                    visualization = await gemini.generate_visualization(
                        line.text, line.index
                    )
                    line.visualization = visualization
        
        # Save to MongoDB
        try:
            mongodb = await get_mongodb_service()
            document_id = await mongodb.save_document(
                user_id=user_id,
                document=layout,
                file_name=file.filename,
                file_size=len(content)
            )
            print(f"Document saved to MongoDB with ID: {document_id}")
        except Exception as db_error:
            print(f"Error saving to MongoDB: {db_error}")
            # Continue without failing the upload
        
    except Exception as e:
        print(f"Error enhancing document with AI: {e}")
        # Return basic layout if AI enhancement fails
    
    return layout

@router.post("/{document_id}/settings")
async def update_reading_settings(document_id: str, settings: ADHDReadingSettings):
    """Update ADHD reading settings for a document"""
    # In production, store these settings in a database
    return {"document_id": document_id, "settings": settings, "status": "updated"}

@router.get("/{document_id}/progress")
async def get_reading_progress(document_id: str, user_id: str):
    """Get reading progress for a user and document"""
    try:
        mongodb = await get_mongodb_service()
        progress = await mongodb.get_reading_progress(user_id, document_id)
        
        if progress:
            return {"document_id": document_id, "user_id": user_id, "progress": progress}
        else:
            return {"document_id": document_id, "user_id": user_id, "progress": None}
    except Exception as e:
        print(f"Error getting reading progress: {e}")
        # Fallback to Solana service
        solana = get_solana_service()
        stats = solana.get_user_reading_stats(user_id)
        return {"document_id": document_id, "user_id": user_id, "stats": stats}

@router.get("/user/{user_id}")
async def list_user_documents(user_id: str, limit: int = 50):
    """List documents for a user"""
    try:
        mongodb = await get_mongodb_service()
        documents = await mongodb.list_user_documents(user_id, limit)
        return {"user_id": user_id, "documents": documents}
    except Exception as e:
        print(f"Error listing user documents: {e}")
        return {"user_id": user_id, "documents": []}

@router.get("/{document_id}")
async def get_document(document_id: str, user_id: str):
    """Get a specific document"""
    try:
        mongodb = await get_mongodb_service()
        document = await mongodb.get_document(document_id, user_id)
        return {"document_id": document_id, "document": document}
    except Exception as e:
        print(f"Error getting document: {e}")
        return {"document_id": document_id, "document": None}

@router.get("/user/{user_id}/stats")
async def get_user_stats(user_id: str):
    """Get user statistics"""
    try:
        mongodb = await get_mongodb_service()
        stats = await mongodb.get_user_stats(user_id)
        return {"user_id": user_id, "stats": stats}
    except Exception as e:
        print(f"Error getting user stats: {e}")
        return {"user_id": user_id, "stats": {}}