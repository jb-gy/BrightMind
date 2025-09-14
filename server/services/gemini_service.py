import os
import base64
import json
from typing import List, Dict, Any, Optional
import google.generativeai as genai
from PIL import Image
import io
import requests
from models import Line, Word, VisualizationType, VoiceType


class GeminiService:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY", "test_key_for_development")
        if not self.api_key or self.api_key == "test_key_for_development":
            print("Warning: Using mock Gemini API key for development")
            self.api_key = "mock_key"
            self.model = None
            self.vision_model = None
        else:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel('gemini-1.5-pro')
            self.vision_model = genai.GenerativeModel('gemini-1.5-pro-vision')
    
    async def analyze_document_content(self, lines: List[Line]) -> List[Line]:
        """Analyze document content for ADHD-friendly features"""
        # If using mock key, return lines with mock enhancements
        if self.api_key == "mock_key":
            enhanced_lines = []
            for i, line in enumerate(lines):
                enhanced_line = Line(
                    index=line.index,
                    text=line.text,
                    words=line.words,
                    character="narrator" if i % 3 == 0 else None,
                    importance_score=0.7 + (i % 3) * 0.1,
                    key_concepts=[f"concept{i}" for i in range(min(3, len(line.text.split())//3))],
                    reading_difficulty=0.5 + (i % 3) * 0.2,
                    visualization=None
                )
                enhanced_lines.append(enhanced_line)
            return enhanced_lines
        
        enhanced_lines = []
        
        for line in lines:
            # Analyze line for importance, characters, and key concepts
            analysis_prompt = f"""
            Analyze this text line for an ADHD-friendly reading platform:
            Text: "{line.text}"
            
            Return a JSON object with:
            - importance_score: float (0-1, how important this line is for comprehension)
            - character: string or null (if this line is spoken by a character)
            - key_concepts: array of strings (important concepts in this line)
            - reading_difficulty: float (0-1, how difficult this line is to read)
            - keywords: array of strings (key words that should be highlighted)
            
            Focus on making this accessible for children with ADHD.
            """
            
            try:
                response = self.model.generate_content(analysis_prompt)
                
                # Try to parse JSON response, with fallback
                try:
                    analysis = json.loads(response.text.strip())
                except json.JSONDecodeError:
                    # Fallback: create basic analysis if JSON parsing fails
                    analysis = {
                        'importance_score': 0.5,
                        'character': None,
                        'key_concepts': [],
                        'reading_difficulty': 0.5,
                        'keywords': line.text.split()[:3]  # Use first 3 words as keywords
                    }
                
                # Update line with analysis
                enhanced_line = line.model_copy()
                enhanced_line.importance_score = analysis.get('importance_score', 0.5)
                enhanced_line.character = analysis.get('character')
                enhanced_line.key_concepts = analysis.get('key_concepts', [])
                enhanced_line.reading_difficulty = analysis.get('reading_difficulty', 0.5)
                
                # Update words with keyword information
                keywords = analysis.get('keywords', [])
                for word in enhanced_line.words:
                    word.is_keyword = word.t.lower() in [kw.lower() for kw in keywords]
                    word.importance_score = enhanced_line.importance_score
                    word.character = enhanced_line.character
                
                enhanced_lines.append(enhanced_line)
                
            except Exception as e:
                print(f"Error analyzing line: {e}")
                enhanced_lines.append(line)
        
        return enhanced_lines
    
    async def generate_visualization(self, text: str, line_index: int, 
                                  visualization_type: VisualizationType = VisualizationType.IMAGE,
                                  context: Optional[str] = None) -> Dict[str, Any]:
        """Generate visual content to help with comprehension"""
        
        prompt = f"""
        Create a {visualization_type.value} description for this text to help a child with ADHD understand and visualize what they're reading:
        
        Text: "{text}"
        Context: {context or "No additional context"}
        
        The visualization should:
        1. Be simple and clear
        2. Help with focus and comprehension
        3. Be appropriate for children
        4. Relate directly to the text content
        
        Return a JSON object with:
        - description: string (detailed description of what to create)
        - style: string (artistic style, e.g., "cartoon", "realistic", "watercolor")
        - colors: array of strings (main colors to use)
        - objects: array of strings (main objects/characters to include)
        - mood: string (the mood/feeling to convey)
        """
        
        try:
            response = self.model.generate_content(prompt)
            
            # Try to parse JSON response, with fallback
            try:
                visualization_data = json.loads(response.text.strip())
            except json.JSONDecodeError:
                # Fallback: create basic visualization data if JSON parsing fails
                visualization_data = {
                    "description": f"Visual representation of: {text[:100]}...",
                    "style": "cartoon",
                    "colors": ["blue", "green", "yellow"],
                    "objects": ["character", "scene"],
                    "mood": "neutral"
                }
            
            # For now, return the description and metadata
            # In a full implementation, you'd generate actual images/videos
            return {
                "type": visualization_type.value,
                "description": visualization_data.get("description", ""),
                "style": visualization_data.get("style", "cartoon"),
                "colors": visualization_data.get("colors", []),
                "objects": visualization_data.get("objects", []),
                "mood": visualization_data.get("mood", "neutral"),
                "confidence": 0.8
            }
            
        except Exception as e:
            print(f"Error generating visualization: {e}")
            return {
                "type": visualization_type.value,
                "description": f"Visual representation of: {text[:50]}...",
                "style": "cartoon",
                "colors": ["blue", "green"],
                "objects": [],
                "mood": "neutral",
                "confidence": 0.3
            }
    
    async def identify_characters(self, lines: List[Line]) -> List[str]:
        """Identify characters in the text for voice switching"""
        # If using mock key, return mock characters
        if self.api_key == "mock_key":
            return ["narrator", "protagonist", "friend"]
        
        text_sample = " ".join([line.text for line in lines[:10]])  # First 10 lines
        
        prompt = f"""
        Identify all characters mentioned in this text sample:
        "{text_sample}"
        
        Return a JSON array of character names. Include:
        - Main characters
        - Supporting characters
        - Any narrator or speaker roles
        
        Focus on characters that would have distinct voices in an audiobook.
        """
        
        try:
            response = self.model.generate_content(prompt)
            
            # Try to parse JSON response, with fallback
            try:
                characters = json.loads(response.text.strip())
                return characters if isinstance(characters, list) else ["Narrator"]
            except json.JSONDecodeError:
                # Fallback: extract potential character names from text
                words = text_sample.split()
                potential_chars = [word for word in words if word.istitle() and len(word) > 2][:5]
                return potential_chars if potential_chars else ["Narrator"]
        except Exception as e:
            print(f"Error identifying characters: {e}")
            return ["Narrator"]
    
    async def determine_genre_and_reading_level(self, lines: List[Line]) -> Dict[str, str]:
        """Determine the genre and reading level of the document"""
        # If using mock key, return mock genre info
        if self.api_key == "mock_key":
            return {
                "genre": "fiction",
                "reading_level": "elementary",
                "target_age": "8-12 years"
            }
        
        text_sample = " ".join([line.text for line in lines[:20]])  # First 20 lines
        
        prompt = f"""
        Analyze this text sample to determine:
        1. Genre (fiction, non-fiction, poetry, etc.)
        2. Reading level (elementary, middle school, high school, etc.)
        
        Text: "{text_sample}"
        
        Return a JSON object with:
        - genre: string
        - reading_level: string
        - target_age: string (e.g., "8-12 years")
        """
        
        try:
            response = self.model.generate_content(prompt)
            
            # Try to parse JSON response, with fallback
            try:
                analysis = json.loads(response.text.strip())
            except json.JSONDecodeError:
                # Fallback: basic analysis based on text characteristics
                word_count = len(text_sample.split())
                analysis = {
                    "genre": "fiction" if any(word in text_sample.lower() for word in ["he", "she", "said", "went"]) else "non-fiction",
                    "reading_level": "elementary" if word_count < 100 else "middle school",
                    "target_age": "8-12 years"
                }
            
            return {
                "genre": analysis.get("genre", "unknown"),
                "reading_level": analysis.get("reading_level", "elementary"),
                "target_age": analysis.get("target_age", "8-12 years")
            }
        except Exception as e:
            print(f"Error analyzing genre/level: {e}")
            return {
                "genre": "unknown",
                "reading_level": "elementary",
                "target_age": "8-12 years"
            }
    
    async def generate_reading_connections(self, current_line: Line, previous_lines: List[Line]) -> List[Dict[str, Any]]:
        """Generate connections between current line and previous content"""
        if not previous_lines:
            return []
        
        context = " ".join([line.text for line in previous_lines[-3:]])  # Last 3 lines
        current_text = current_line.text
        
        prompt = f"""
        Find connections between this current line and the previous context to help a child with ADHD understand relationships:
        
        Previous context: "{context}"
        Current line: "{current_text}"
        
        Return a JSON array of connection objects with:
        - type: string (e.g., "cause_effect", "character_development", "plot_progression")
        - description: string (explanation of the connection)
        - importance: float (0-1, how important this connection is)
        - visual_cue: string (suggestion for visual representation)
        """
        
        try:
            response = self.model.generate_content(prompt)
            connections = json.loads(response.text.strip())
            return connections if isinstance(connections, list) else []
        except Exception as e:
            print(f"Error generating connections: {e}")
            return []


# Global instance
gemini_service = None

def get_gemini_service() -> GeminiService:
    global gemini_service
    if gemini_service is None:
        gemini_service = GeminiService()
    return gemini_service
