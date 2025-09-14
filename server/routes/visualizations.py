from fastapi import APIRouter, HTTPException
from models import VisualizationRequest, VisualizationResponse
from services.gemini_service import get_gemini_service

router = APIRouter(prefix="/visualizations", tags=["visualizations"])

@router.post("", response_model=VisualizationResponse)
async def generate_visualization(req: VisualizationRequest):
    """Generate visual content to help with comprehension"""
    try:
        gemini = get_gemini_service()
        visualization_data = await gemini.generate_visualization(
            req.text, req.line_index, req.visualization_type, req.context
        )
        
        return VisualizationResponse(
            image_url=visualization_data.get("image_url"),
            video_url=visualization_data.get("video_url"),
            description=visualization_data.get("description", ""),
            confidence=visualization_data.get("confidence", 0.5)
        )
        
    except Exception as e:
        raise HTTPException(500, f"Visualization generation failed: {str(e)}")

@router.post("/batch")
async def generate_batch_visualizations(requests: list[VisualizationRequest]):
    """Generate multiple visualizations in batch"""
    try:
        gemini = get_gemini_service()
        results = []
        
        for req in requests:
            visualization_data = await gemini.generate_visualization(
                req.text, req.line_index, req.visualization_type, req.context
            )
            
            results.append(VisualizationResponse(
                image_url=visualization_data.get("image_url"),
                video_url=visualization_data.get("video_url"),
                description=visualization_data.get("description", ""),
                confidence=visualization_data.get("confidence", 0.5)
            ))
        
        return {"visualizations": results}
        
    except Exception as e:
        raise HTTPException(500, f"Batch visualization generation failed: {str(e)}")

@router.get("/styles")
async def get_visualization_styles():
    """Get available visualization styles"""
    return {
        "styles": [
            {
                "name": "cartoon",
                "description": "Colorful, child-friendly cartoon style",
                "best_for": "fiction, children's stories"
            },
            {
                "name": "realistic",
                "description": "Photorealistic style for educational content",
                "best_for": "non-fiction, educational material"
            },
            {
                "name": "watercolor",
                "description": "Soft, artistic watercolor style",
                "best_for": "poetry, literary works"
            },
            {
                "name": "minimalist",
                "description": "Clean, simple line art",
                "best_for": "technical content, diagrams"
            }
        ]
    }
