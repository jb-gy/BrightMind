import os
import base64
import asyncio
from typing import Dict, Any, Optional, List
import google.generativeai as genai
from PIL import Image
import io
import requests
import json
from datetime import datetime


class ImageGeneratorService:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY", "test_key_for_development")
        if not self.api_key or self.api_key == "test_key_for_development":
            print("Warning: Using mock Gemini API key for development")
            self.api_key = "mock_key"
        
        genai.configure(api_key=self.api_key)
        self.model = genai.GenerativeModel('gemini-1.5-pro-vision')
        self.text_model = genai.GenerativeModel('gemini-1.5-pro')
        
        # Image generation cache
        self.image_cache = {}
        self.generation_queue = asyncio.Queue()
        
        # Start background image generation worker
        asyncio.create_task(self._image_generation_worker())
    
    async def generate_image_for_line(self, line_text: str, 
                                    line_index: int, 
                                    context: Optional[str] = None,
                                    style: str = "cartoon") -> Dict[str, Any]:
        """Generate an image for a specific line of text"""
        
        # Create cache key
        cache_key = f"{line_text}_{line_index}_{style}"
        if cache_key in self.image_cache:
            return self.image_cache[cache_key]
        
        try:
            # Generate image description using Gemini
            image_description = await self._generate_image_description(line_text, context, style)
            
            # For now, return the description and metadata
            # In a full implementation, you would generate actual images
            result = {
                "line_index": line_index,
                "line_text": line_text,
                "image_description": image_description,
                "style": style,
                "generated_at": datetime.utcnow().isoformat(),
                "image_url": None,  # Would be actual image URL
                "thumbnail_url": None,  # Would be thumbnail URL
                "metadata": {
                    "confidence": 0.9,
                    "generation_time": 0.5,
                    "style_applied": style
                }
            }
            
            # Cache the result
            self.image_cache[cache_key] = result
            
            return result
            
        except Exception as e:
            print(f"Error generating image for line {line_index}: {e}")
            return {
                "line_index": line_index,
                "line_text": line_text,
                "image_description": f"Visual representation of: {line_text[:50]}...",
                "style": style,
                "generated_at": datetime.utcnow().isoformat(),
                "image_url": None,
                "thumbnail_url": None,
                "metadata": {
                    "confidence": 0.3,
                    "generation_time": 0.1,
                    "error": str(e)
                }
            }
    
    async def _generate_image_description(self, line_text: str, 
                                        context: Optional[str] = None, 
                                        style: str = "cartoon") -> str:
        """Generate a detailed image description using Gemini"""
        
        # If using mock key, return a mock description
        if self.api_key == "mock_key":
            return f"A beautiful {style} illustration depicting: {line_text}. The scene is colorful and engaging, perfect for helping children with ADHD focus and understand the content. The image shows vibrant colors, clear characters, and an inviting atmosphere that makes learning fun and accessible."
        
        prompt = f"""
        Create a detailed visual description for an image that represents this text line for a child with ADHD:
        
        Text: "{line_text}"
        Context: {context or "No additional context"}
        Style: {style}
        
        The description should be:
        1. Clear and simple for children to understand
        2. Visually engaging and colorful
        3. Helpful for comprehension and focus
        4. Appropriate for the {style} artistic style
        5. Specific enough that an artist could create the image
        
        Include details about:
        - Main characters or objects
        - Setting/background
        - Colors and lighting
        - Mood and atmosphere
        - Composition and layout
        
        Return only the visual description, no explanations or meta-commentary.
        """
        
        try:
            response = self.text_model.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            print(f"Error generating image description: {e}")
            return f"A colorful {style} illustration showing: {line_text[:100]}..."
    
    async def batch_generate_images(self, lines: List[Dict[str, Any]], 
                                  style: str = "cartoon") -> List[Dict[str, Any]]:
        """Generate images for multiple lines in batch"""
        
        results = []
        tasks = []
        
        for line_data in lines:
            task = self.generate_image_for_line(
                line_text=line_data.get('text', ''),
                line_index=line_data.get('index', 0),
                context=line_data.get('context'),
                style=style
            )
            tasks.append(task)
        
        # Execute all tasks concurrently
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Handle any exceptions
        processed_results = []
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                processed_results.append({
                    "line_index": lines[i].get('index', 0),
                    "line_text": lines[i].get('text', ''),
                    "image_description": f"Error generating image: {str(result)}",
                    "style": style,
                    "generated_at": datetime.utcnow().isoformat(),
                    "image_url": None,
                    "thumbnail_url": None,
                    "metadata": {
                        "confidence": 0.1,
                        "generation_time": 0.0,
                        "error": str(result)
                    }
                })
            else:
                processed_results.append(result)
        
        return processed_results
    
    async def _image_generation_worker(self):
        """Background worker for processing image generation queue"""
        while True:
            try:
                # Process items from the queue
                item = await self.generation_queue.get()
                if item is None:
                    break
                
                # Process the image generation request
                await self._process_image_request(item)
                
            except Exception as e:
                print(f"Error in image generation worker: {e}")
                await asyncio.sleep(1)
    
    async def _process_image_request(self, request: Dict[str, Any]):
        """Process a single image generation request"""
        try:
            # This would contain the actual image generation logic
            # For now, we're just using text descriptions
            pass
        except Exception as e:
            print(f"Error processing image request: {e}")
    
    async def get_image_styles(self) -> List[Dict[str, str]]:
        """Get available image generation styles"""
        return [
            {
                "name": "cartoon",
                "description": "Colorful, child-friendly cartoon style",
                "best_for": "Children's stories, fiction"
            },
            {
                "name": "realistic",
                "description": "Photorealistic style",
                "best_for": "Educational content, non-fiction"
            },
            {
                "name": "watercolor",
                "description": "Soft, artistic watercolor style",
                "best_for": "Poetry, literary works"
            },
            {
                "name": "minimalist",
                "description": "Clean, simple line art",
                "best_for": "Technical content, diagrams"
            },
            {
                "name": "fantasy",
                "description": "Magical, fantasy art style",
                "best_for": "Fantasy stories, adventure tales"
            }
        ]
    
    async def clear_cache(self):
        """Clear the image generation cache"""
        self.image_cache.clear()
    
    async def get_cache_stats(self) -> Dict[str, Any]:
        """Get cache statistics"""
        return {
            "cache_size": len(self.image_cache),
            "cache_keys": list(self.image_cache.keys())[:10]  # First 10 keys
        }


# Global instance
image_generator_service = None

def get_image_generator_service() -> ImageGeneratorService:
    global image_generator_service
    if image_generator_service is None:
        image_generator_service = ImageGeneratorService()
    return image_generator_service
