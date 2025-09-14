from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.websockets import WebSocketState
from models import DocumentLayout
from services.auto_reader_service import get_auto_reader_service
from services.ws_manager import manager
import json
import asyncio

router = APIRouter(prefix="/auto-reader", tags=["auto-reader"])

@router.post("/start")
async def start_auto_reading(document: DocumentLayout, 
                           start_line: int = 0,
                           voice_settings: dict = None,
                           auto_advance: bool = True):
    """Start automatic reading of a document"""
    try:
        auto_reader = get_auto_reader_service()
        
        # Register callback for WebSocket notifications
        async def ws_callback(event_type: str, data: dict):
            # Broadcast to all connected WebSocket clients
            await manager.broadcast_json({
                'type': 'auto_reader_event',
                'event': event_type,
                'data': data
            })
        
        auto_reader.register_line_callback(ws_callback)
        
        # Start reading
        await auto_reader.start_reading(
            document=document,
            start_line=start_line,
            voice_settings=voice_settings or {},
            auto_advance=auto_advance
        )
        
        return {
            "status": "started",
            "current_line": start_line,
            "auto_advance": auto_advance
        }
        
    except Exception as e:
        raise HTTPException(500, f"Failed to start auto-reading: {str(e)}")

@router.post("/pause")
async def pause_auto_reading():
    """Pause the automatic reading"""
    try:
        auto_reader = get_auto_reader_service()
        await auto_reader.pause()
        return {"status": "paused"}
    except Exception as e:
        raise HTTPException(500, f"Failed to pause: {str(e)}")

@router.post("/resume")
async def resume_auto_reading():
    """Resume the automatic reading"""
    try:
        auto_reader = get_auto_reader_service()
        await auto_reader.resume()
        return {"status": "resumed"}
    except Exception as e:
        raise HTTPException(500, f"Failed to resume: {str(e)}")

@router.post("/stop")
async def stop_auto_reading():
    """Stop the automatic reading"""
    try:
        auto_reader = get_auto_reader_service()
        await auto_reader.stop()
        return {"status": "stopped"}
    except Exception as e:
        raise HTTPException(500, f"Failed to stop: {str(e)}")

@router.post("/skip-to/{line_index}")
async def skip_to_line(line_index: int):
    """Skip to a specific line"""
    try:
        auto_reader = get_auto_reader_service()
        await auto_reader.skip_to_line(line_index)
        return {"status": "skipped", "line_index": line_index}
    except Exception as e:
        raise HTTPException(500, f"Failed to skip to line: {str(e)}")

@router.post("/voice-settings")
async def update_voice_settings(voice_settings: dict):
    """Update voice settings for auto-reading"""
    try:
        auto_reader = get_auto_reader_service()
        await auto_reader.set_voice_settings(voice_settings)
        return {"status": "updated", "voice_settings": voice_settings}
    except Exception as e:
        raise HTTPException(500, f"Failed to update voice settings: {str(e)}")

@router.post("/auto-advance")
async def set_auto_advance(auto_advance: bool):
    """Enable/disable auto-advance"""
    try:
        auto_reader = get_auto_reader_service()
        await auto_reader.set_auto_advance(auto_advance)
        return {"status": "updated", "auto_advance": auto_advance}
    except Exception as e:
        raise HTTPException(500, f"Failed to update auto-advance: {str(e)}")

@router.get("/status")
async def get_reading_status():
    """Get current reading status"""
    try:
        auto_reader = get_auto_reader_service()
        status = auto_reader.get_status()
        return status
    except Exception as e:
        raise HTTPException(500, f"Failed to get status: {str(e)}")

@router.websocket("/ws/{session_id}")
async def auto_reader_websocket(websocket: WebSocket, session_id: str):
    """WebSocket endpoint for real-time auto-reader updates"""
    await manager.connect(session_id, websocket)
    
    try:
        # Send initial status
        auto_reader = get_auto_reader_service()
        status = auto_reader.get_status()
        await manager.send_json(session_id, {
            'type': 'initial_status',
            'data': status
        })
        
        # Keep connection alive and handle client messages
        while True:
            try:
                # Wait for messages from client
                data = await websocket.receive_json()
                
                # Handle client commands
                if data.get('type') == 'command':
                    command = data.get('command')
                    params = data.get('params', {})
                    
                    if command == 'pause':
                        await auto_reader.pause()
                    elif command == 'resume':
                        await auto_reader.resume()
                    elif command == 'stop':
                        await auto_reader.stop()
                    elif command == 'skip_to':
                        await auto_reader.skip_to_line(params.get('line_index', 0))
                    elif command == 'update_voice':
                        await auto_reader.set_voice_settings(params.get('voice_settings', {}))
                    elif command == 'set_auto_advance':
                        await auto_reader.set_auto_advance(params.get('auto_advance', True))
                
            except WebSocketDisconnect:
                break
            except Exception as e:
                print(f"WebSocket error: {e}")
                await manager.send_json(session_id, {
                    'type': 'error',
                    'message': str(e)
                })
                
    except WebSocketDisconnect:
        pass
    finally:
        await manager.disconnect(session_id)
