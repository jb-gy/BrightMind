import asyncio
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException
from models import TTSRequest, TTSResponse, ReadingProgress
from services.enhanced_tts import get_tts_service
from services.solana_service import get_solana_service
from services.mongodb_service import get_mongodb_service
from services.ws_manager import manager
import time

router = APIRouter(prefix="", tags=["tts"])

@router.post("/tts", response_model=TTSResponse)
async def tts(req: TTSRequest):
    """Enhanced TTS with character voice support"""
    try:
        tts_service = get_tts_service()
        audio_url, timings = tts_service.synthesize_with_character_voice(
            req.text, req.character, req.voice_type, req.rate, req.voice
        )
        return TTSResponse(
            audio_url=audio_url, 
            timings=timings,
            character=req.character
        )
    except Exception as e:
        raise HTTPException(500, f"TTS synthesis failed: {str(e)}")

@router.get("/voices")
async def get_available_voices():
    """Get list of available voices"""
    tts_service = get_tts_service()
    return {"voices": tts_service.get_available_voices()}

@router.post("/audiobook")
async def create_audiobook_segment(lines: list, character_assignments: dict):
    """Create a continuous audiobook segment with character voice switching"""
    try:
        tts_service = get_tts_service()
        audio_url = tts_service.create_audiobook_segment(lines, character_assignments)
        return {"audio_url": audio_url}
    except Exception as e:
        raise HTTPException(500, f"Audiobook creation failed: {str(e)}")

@router.websocket("/ws/{session_id}")
async def ws_stream(websocket: WebSocket, session_id: str):
    """WebSocket for real-time word highlighting with character support"""
    await manager.connect(session_id, websocket)
    try:
        # Wait for client to send a text payload to start streaming timings
        payload = await websocket.receive_json()
        text = payload.get("text", "Hello world this is a demo stream")
        rate = float(payload.get("rate", 1.0))
        character = payload.get("character")
        voice_type = payload.get("voice_type", "narrator")
        
        # Get enhanced TTS
        tts_service = get_tts_service()
        _, timings = tts_service.synthesize_with_character_voice(
            text, character, voice_type, rate
        )
        
        # Stream word timings
        for t in timings:
            await manager.send_json(session_id, {
                "type": "word", 
                "word_index": t.word_index,
                "start_ms": t.start_ms,
                "end_ms": t.end_ms,
                "character": t.character
            })
            await asyncio.sleep((t.end_ms - t.start_ms)/1000)
            
    except WebSocketDisconnect:
        pass
    finally:
        await manager.disconnect(session_id)

@router.post("/progress")
async def record_reading_progress(progress: ReadingProgress):
    """Record reading progress and create blockchain milestone"""
    try:
        # Save to MongoDB first
        mongodb = await get_mongodb_service()
        progress_id = await mongodb.save_reading_progress(progress)
        
        solana = get_solana_service()
        
        # Determine milestone type based on progress
        progress_percentage = (progress.current_line / progress.total_lines) * 100
        
        milestone_type = "start"
        if progress_percentage >= 25:
            milestone_type = "quarter"
        if progress_percentage >= 50:
            milestone_type = "half"
        if progress_percentage >= 75:
            milestone_type = "three_quarters"
        if progress_percentage >= 100:
            milestone_type = "complete"
        
        # Record milestone on Solana
        signature = solana.record_reading_milestone(progress, milestone_type)
        
        # Save Solana transaction to MongoDB
        from models import SolanaTransaction
        from datetime import datetime
        
        solana_tx = SolanaTransaction(
            signature=signature,
            user_id=progress.user_id,
            document_id=progress.document_id,
            progress_data=progress,
            timestamp=int(datetime.utcnow().timestamp())
        )
        
        await mongodb.save_solana_transaction(solana_tx)
        
        return {
            "status": "recorded",
            "milestone": milestone_type,
            "signature": signature,
            "progress_percentage": progress_percentage,
            "progress_id": progress_id
        }
        
    except Exception as e:
        raise HTTPException(500, f"Failed to record progress: {str(e)}")

@router.get("/user/{user_id}/transactions")
async def get_user_transactions(user_id: str, limit: int = 100):
    """Get Solana transactions for a user"""
    try:
        mongodb = await get_mongodb_service()
        transactions = await mongodb.get_user_transactions(user_id, limit)
        return {"user_id": user_id, "transactions": transactions}
    except Exception as e:
        raise HTTPException(500, f"Failed to get transactions: {str(e)}")

@router.get("/user/{user_id}/settings")
async def get_user_settings(user_id: str):
    """Get user reading settings"""
    try:
        mongodb = await get_mongodb_service()
        settings = await mongodb.get_user_settings(user_id)
        return {"user_id": user_id, "settings": settings}
    except Exception as e:
        raise HTTPException(500, f"Failed to get user settings: {str(e)}")

@router.post("/user/{user_id}/settings")
async def update_user_settings(user_id: str, settings: dict):
    """Update user reading settings"""
    try:
        from models import ADHDReadingSettings
        settings_obj = ADHDReadingSettings(**settings)
        
        mongodb = await get_mongodb_service()
        success = await mongodb.update_user_settings(user_id, settings_obj)
        
        if success:
            return {"user_id": user_id, "status": "updated"}
        else:
            raise HTTPException(500, "Failed to update settings")
    except Exception as e:
        raise HTTPException(500, f"Failed to update user settings: {str(e)}")