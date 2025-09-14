import os
import tempfile
import uuid
from typing import List, Dict, Any, Optional
from gtts import gTTS
from pydub import AudioSegment
from pydub.effects import speedup, normalize
import json
from models import TTSRequest, TTSResponse, TTSWordTiming, VoiceType


class EnhancedTTSService:
    def __init__(self):
        self.audio_cache = {}
        self.character_voices = {
            "narrator": {"lang": "en", "tld": "com", "slow": False},
            "child": {"lang": "en", "tld": "com", "slow": True},
            "adult": {"lang": "en", "tld": "com", "slow": False},
            "character": {"lang": "en", "tld": "com", "slow": False},
        }
        
        # Character-specific voice configurations
        self.character_voice_map = {
            "narrator": "narrator",
            "protagonist": "child",
            "antagonist": "adult",
            "parent": "adult",
            "teacher": "adult",
            "friend": "child",
        }
    
    def get_voice_config(self, character: Optional[str] = None, voice_type: VoiceType = VoiceType.NARRATOR, voice_name: Optional[str] = None) -> Dict[str, Any]:
        """Get voice configuration based on character, voice type, or voice name"""
        # If specific voice name is provided, use it
        if voice_name and voice_name in self.character_voices:
            return self.character_voices[voice_name]
        
        # If character is provided, map to voice type
        if character:
            mapped_voice = self.character_voice_map.get(character.lower(), "narrator")
            return self.character_voices.get(mapped_voice, self.character_voices["narrator"])
        
        # Use voice type directly
        voice_key = voice_type.value
        return self.character_voices.get(voice_key, self.character_voices["narrator"])
    
    def synthesize_with_character_voice(self, text: str, character: Optional[str] = None, 
                                      voice_type: VoiceType = VoiceType.NARRATOR, 
                                      rate: float = 1.0, voice_name: Optional[str] = None) -> tuple[str, List[TTSWordTiming]]:
        """Synthesize speech with character-specific voice and return audio URL and word timings"""
        
        # Get voice configuration
        voice_config = self.get_voice_config(character, voice_type, voice_name)
        
        # Create cache key
        cache_key = f"{text}_{character}_{voice_type.value}_{rate}"
        if cache_key in self.audio_cache:
            return self.audio_cache[cache_key]
        
        try:
            # Generate TTS with optimized settings
            tts = gTTS(
                text=text,
                lang=voice_config["lang"],
                tld=voice_config["tld"],
                slow=False  # Always use normal speed, we'll control rate with audio processing
            )
            
            # Save to temporary file
            with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as tmp_file:
                tts.save(tmp_file.name)
                
                # Load audio and apply rate adjustment
                audio = AudioSegment.from_mp3(tmp_file.name)
                
                # Apply rate adjustment more efficiently
                if rate != 1.0:
                    # Use frame rate manipulation for better quality
                    new_sample_rate = int(audio.frame_rate * rate)
                    audio = audio._spawn(audio.raw_data, overrides={"frame_rate": new_sample_rate})
                    audio = audio.set_frame_rate(audio.frame_rate)
                
                # Save processed audio directly without normalization for speed
                processed_filename = f"tts_{uuid.uuid4().hex}.mp3"
                processed_path = f"static/audio/{processed_filename}"
                
                # Ensure directory exists
                os.makedirs(os.path.dirname(processed_path), exist_ok=True)
                
                # Export with optimized settings
                audio.export(processed_path, format="mp3", bitrate="128k")
                
                # Generate word timings more accurately
                words = text.split()
                word_timings = []
                duration_ms = len(audio)
                word_duration = duration_ms / len(words) if words else 0
                
                for i, word in enumerate(words):
                    start_ms = int(i * word_duration)
                    end_ms = int((i + 1) * word_duration)
                    
                    word_timings.append(TTSWordTiming(
                        word_index=i,
                        start_ms=start_ms,
                        end_ms=end_ms,
                        character=character
                    ))
                
                # Create audio URL
                audio_url = f"/static/audio/{processed_filename}"
                
                result = (audio_url, word_timings)
                self.audio_cache[cache_key] = result
                
                # Clean up temporary file
                os.unlink(tmp_file.name)
                
                return result
                
        except Exception as e:
            print(f"Error in TTS synthesis: {e}")
            # Return fallback
            return ("", [])
    
    def create_character_voice_profile(self, character_name: str, 
                                     voice_characteristics: Dict[str, Any]) -> None:
        """Create a custom voice profile for a character"""
        self.character_voices[character_name.lower()] = {
            "lang": voice_characteristics.get("lang", "en"),
            "tld": voice_characteristics.get("tld", "com"),
            "slow": voice_characteristics.get("slow", False),
            "pitch": voice_characteristics.get("pitch", 1.0),
            "speed": voice_characteristics.get("speed", 1.0)
        }
    
    def get_available_voices(self) -> List[Dict[str, Any]]:
        """Get list of available voices"""
        return [
            {
                "name": "narrator",
                "display_name": "Narrator",
                "type": "narrator",
                "description": "Clear, neutral voice for narration"
            },
            {
                "name": "child",
                "display_name": "Child Voice",
                "type": "child",
                "description": "Friendly, slower voice for young characters"
            },
            {
                "name": "adult",
                "display_name": "Adult Voice",
                "type": "adult",
                "description": "Mature, authoritative voice for adult characters"
            },
            {
                "name": "character",
                "display_name": "Character Voice",
                "type": "character",
                "description": "Dynamic voice that adapts to character personality"
            }
        ]
    
    def create_audiobook_segment(self, lines: List[Dict[str, Any]], 
                               character_assignments: Dict[int, str]) -> str:
        """Create a continuous audiobook segment with character voice switching"""
        try:
            combined_audio = AudioSegment.silent(duration=0)
            
            for i, line in enumerate(lines):
                text = line.get("text", "")
                character = character_assignments.get(i)
                voice_type = VoiceType.CHARACTER if character else VoiceType.NARRATOR
                
                if text.strip():
                    audio_url, _ = self.synthesize_with_character_voice(
                        text, character, voice_type, rate=1.0
                    )
                    
                    if audio_url:
                        # Load the audio file
                        audio_path = f"static/audio/{os.path.basename(audio_url)}"
                        if os.path.exists(audio_path):
                            line_audio = AudioSegment.from_mp3(audio_path)
                            combined_audio += line_audio
                            
                            # Add small pause between lines
                            combined_audio += AudioSegment.silent(duration=200)
            
            # Save combined audio
            combined_filename = f"audiobook_{uuid.uuid4().hex}.mp3"
            combined_path = f"static/audio/{combined_filename}"
            combined_audio.export(combined_path, format="mp3")
            
            return f"/static/audio/{combined_filename}"
            
        except Exception as e:
            print(f"Error creating audiobook segment: {e}")
            return ""


# Global instance
tts_service = None

def get_tts_service() -> EnhancedTTSService:
    global tts_service
    if tts_service is None:
        tts_service = EnhancedTTSService()
    return tts_service
