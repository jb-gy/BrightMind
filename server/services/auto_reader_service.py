import asyncio
from typing import List, Dict, Any, Optional, Callable
from models import DocumentLayout, Line, TTSWordTiming
from services.enhanced_tts import get_tts_service
from services.gemini_service import get_gemini_service
import time


class AutoReaderService:
    def __init__(self):
        self.tts_service = get_tts_service()
        self.gemini_service = get_gemini_service()
        self.current_session = None
        self.is_playing = False
        self.is_paused = False
        self.current_line_index = 0
        self.current_word_index = 0
        self.audio_queue = []
        self.line_callbacks = []
        
    def register_line_callback(self, callback: Callable):
        """Register callback for line events"""
        self.line_callbacks.append(callback)
    
    async def start_reading(self, document: DocumentLayout, 
                          start_line: int = 0, 
                          voice_settings: Dict[str, Any] = None,
                          auto_advance: bool = True):
        """Start automatic reading of the document"""
        
        self.current_session = {
            'document': document,
            'start_line': start_line,
            'voice_settings': voice_settings or {},
            'auto_advance': auto_advance,
            'start_time': time.time()
        }
        
        self.current_line_index = start_line
        self.is_playing = True
        self.is_paused = False
        
        # Start reading from the first line
        await self._read_current_line()
    
    async def _read_current_line(self):
        """Read the current line with TTS"""
        if not self.current_session or not self.is_playing:
            return
        
        document = self.current_session['document']
        if self.current_line_index >= len(document.pages[0].lines):
            # End of document
            await self._notify_callbacks('document_complete', {})
            return
        
        current_page = document.pages[0]  # For now, focus on first page
        current_line = current_page.lines[self.current_line_index]
        
        # Notify callbacks about line change
        await self._notify_callbacks('line_change', {
            'line_index': self.current_line_index,
            'line': {
                'text': current_line.text,
                'index': self.current_line_index,
                'character': current_line.character,
                'importance_score': getattr(current_line, 'importance_score', 0.5),
                'key_concepts': getattr(current_line, 'key_concepts', []),
                'reading_difficulty': getattr(current_line, 'reading_difficulty', 0.5)
            },
            'total_lines': len(current_page.lines)
        })
        
        # Generate TTS for current line
        try:
            voice_settings = self.current_session['voice_settings']
            from models import VoiceType
            
            # Convert string voice_type to enum
            voice_type_str = voice_settings.get('voice_type', 'narrator')
            try:
                voice_type = VoiceType(voice_type_str)
            except ValueError:
                voice_type = VoiceType.NARRATOR
            
            audio_url, word_timings = self.tts_service.synthesize_with_character_voice(
                text=current_line.text,
                character=current_line.character,
                voice_type=voice_type,
                rate=voice_settings.get('rate', 1.0),
                voice_name=voice_settings.get('voice_name')
            )
            
            # Notify callbacks about audio ready
            await self._notify_callbacks('audio_ready', {
                'line_index': self.current_line_index,
                'audio_url': audio_url,
                'word_timings': word_timings,
                'line': {
                    'text': current_line.text,
                    'index': self.current_line_index,
                    'character': current_line.character,
                    'importance_score': getattr(current_line, 'importance_score', 0.5),
                    'key_concepts': getattr(current_line, 'key_concepts', []),
                    'reading_difficulty': getattr(current_line, 'reading_difficulty', 0.5)
                }
            })
            
            # Calculate total duration for this line
            total_duration = max([timing.end_ms for timing in word_timings], default=2000) / 1000
            
            # Wait for audio to finish (or until paused)
            await self._wait_for_audio_completion(total_duration)
            
            # Auto-advance to next line if enabled
            if self.current_session['auto_advance'] and self.is_playing and not self.is_paused:
                self.current_line_index += 1
                # Small delay between lines
                await asyncio.sleep(0.5)
                await self._read_current_line()
                
        except Exception as e:
            print(f"Error reading line {self.current_line_index}: {e}")
            # Continue to next line on error
            self.current_line_index += 1
            await asyncio.sleep(1)
            await self._read_current_line()
    
    async def _wait_for_audio_completion(self, duration: float):
        """Wait for audio to complete, respecting pause/resume"""
        start_time = time.time()
        
        while time.time() - start_time < duration:
            if not self.is_playing:
                return
            
            if self.is_paused:
                # Wait while paused
                await asyncio.sleep(0.1)
                continue
            
            await asyncio.sleep(0.1)
    
    async def pause(self):
        """Pause the reading"""
        self.is_paused = True
        await self._notify_callbacks('paused', {})
    
    async def resume(self):
        """Resume the reading"""
        self.is_paused = False
        await self._notify_callbacks('resumed', {})
        # Continue reading from current line
        await self._read_current_line()
    
    async def stop(self):
        """Stop the reading"""
        self.is_playing = False
        self.is_paused = False
        await self._notify_callbacks('stopped', {})
    
    async def skip_to_line(self, line_index: int):
        """Skip to a specific line"""
        if self.current_session:
            self.current_line_index = line_index
            await self._notify_callbacks('line_skip', {'line_index': line_index})
            if self.is_playing and not self.is_paused:
                await self._read_current_line()
    
    async def set_voice_settings(self, voice_settings: Dict[str, Any]):
        """Update voice settings"""
        if self.current_session:
            self.current_session['voice_settings'].update(voice_settings)
            await self._notify_callbacks('voice_settings_changed', voice_settings)
    
    async def set_auto_advance(self, auto_advance: bool):
        """Enable/disable auto-advance"""
        if self.current_session:
            self.current_session['auto_advance'] = auto_advance
            await self._notify_callbacks('auto_advance_changed', {'auto_advance': auto_advance})
    
    async def _notify_callbacks(self, event_type: str, data: Dict[str, Any]):
        """Notify all registered callbacks"""
        for callback in self.line_callbacks:
            try:
                await callback(event_type, data)
            except Exception as e:
                print(f"Error in callback: {e}")
    
    def get_status(self) -> Dict[str, Any]:
        """Get current reading status"""
        if not self.current_session:
            return {'status': 'stopped'}
        
        return {
            'status': 'paused' if self.is_paused else 'playing' if self.is_playing else 'stopped',
            'current_line': self.current_line_index,
            'voice_settings': self.current_session['voice_settings'],
            'auto_advance': self.current_session['auto_advance'],
            'total_lines': len(self.current_session['document'].pages[0].lines)
        }


# Global instance
auto_reader_service = None

def get_auto_reader_service() -> AutoReaderService:
    global auto_reader_service
    if auto_reader_service is None:
        auto_reader_service = AutoReaderService()
    return auto_reader_service
