from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from models import Line
from services.image_generator import get_image_generator_service
from services.ws_manager import manager
import json
import asyncio

router = APIRouter(prefix="/images", tags=["image-generation"])

class ImageGenerationRequest(BaseModel):
    line_text: str
    line_index: int
    context: str = None
    style: str = "cartoon"

@router.post("/generate")
async def generate_image_for_line(request: ImageGenerationRequest):
    """Generate an image for a specific line of text"""
    try:
        image_service = get_image_generator_service()
        result = await image_service.generate_image_for_line(
            line_text=request.line_text,
            line_index=request.line_index,
            context=request.context,
            style=request.style
        )
        return result
        
    except Exception as e:
        raise HTTPException(500, f"Image generation failed: {str(e)}")

@router.post("/batch-generate")
async def batch_generate_images(lines: list, style: str = "cartoon"):
    """Generate images for multiple lines"""
    try:
        image_service = get_image_generator_service()
        results = await image_service.batch_generate_images(lines, style)
        return {"results": results}
        
    except Exception as e:
        raise HTTPException(500, f"Batch image generation failed: {str(e)}")

@router.get("/styles")
async def get_image_styles():
    """Get available image generation styles"""
    try:
        image_service = get_image_generator_service()
        styles = await image_service.get_image_styles()
        return {"styles": styles}
        
    except Exception as e:
        raise HTTPException(500, f"Failed to get styles: {str(e)}")

@router.delete("/cache")
async def clear_image_cache():
    """Clear the image generation cache"""
    try:
        image_service = get_image_generator_service()
        await image_service.clear_cache()
        return {"status": "cache_cleared"}
        
    except Exception as e:
        raise HTTPException(500, f"Failed to clear cache: {str(e)}")

@router.get("/cache/stats")
async def get_cache_stats():
    """Get cache statistics"""
    try:
        image_service = get_image_generator_service()
        stats = await image_service.get_cache_stats()
        return stats
        
    except Exception as e:
        raise HTTPException(500, f"Failed to get cache stats: {str(e)}")

@router.websocket("/ws/{session_id}")
async def image_generation_websocket(websocket: WebSocket, session_id: str):
    """WebSocket endpoint for real-time image generation"""
    await manager.connect(session_id, websocket)
    
    try:
        while True:
            try:
                data = await websocket.receive_json()
                
                if data.get('type') == 'generate_image':
                    line_text = data.get('line_text', '')
                    line_index = data.get('line_index', 0)
                    context = data.get('context')
                    style = data.get('style', 'cartoon')
                    
                    # Generate image
                    image_service = get_image_generator_service()
                    result = await image_service.generate_image_for_line(
                        line_text=line_text,
                        line_index=line_index,
                        context=context,
                        style=style
                    )
                    
                    # Send result back to client
                    await manager.send_json(session_id, {
                        'type': 'image_generated',
                        'data': result
                    })
                
                elif data.get('type') == 'batch_generate':
                    lines = data.get('lines', [])
                    style = data.get('style', 'cartoon')
                    
                    # Generate images in batch
                    image_service = get_image_generator_service()
                    results = await image_service.batch_generate_images(lines, style)
                    
                    # Send results back to client
                    await manager.send_json(session_id, {
                        'type': 'batch_images_generated',
                        'data': results
                    })
                
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
