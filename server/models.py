from pydantic import BaseModel, Field
from typing import List, Optional, Tuple, Dict, Any
from enum import Enum


BBox = Tuple[float, float, float, float]


class VoiceType(str, Enum):
    NARRATOR = "narrator"
    CHARACTER = "character"
    CHILD = "child"
    ADULT = "adult"


class VisualizationType(str, Enum):
    IMAGE = "image"
    VIDEO = "video"
    ANIMATION = "animation"


class Word(BaseModel):
    t: str
    bbox: Optional[BBox] = None
    importance_score: float = 0.5
    character: Optional[str] = None
    is_keyword: bool = False


class Line(BaseModel):
    index: int
    text: str
    bbox: Optional[BBox] = None
    words: List[Word] = Field(default_factory=list)
    paragraph_id: Optional[str] = None
    importance_score: float = 0.5
    character: Optional[str] = None
    visualization: Optional[Dict[str, Any]] = None
    key_concepts: List[str] = Field(default_factory=list)
    reading_difficulty: float = 0.5


class Page(BaseModel):
    index: int
    width: Optional[float] = None
    height: Optional[float] = None
    lines: List[Line] = Field(default_factory=list)
    background_image: Optional[str] = None


class DocumentLayout(BaseModel):
    pages: List[Page]
    characters: List[str] = Field(default_factory=list)
    genre: Optional[str] = None
    reading_level: Optional[str] = None


class TTSRequest(BaseModel):
    text: str
    voice: Optional[str] = "narrator"
    rate: float = 1.0
    character: Optional[str] = None
    voice_type: VoiceType = VoiceType.NARRATOR


class TTSWordTiming(BaseModel):
    word_index: int
    start_ms: int
    end_ms: int
    character: Optional[str] = None


class TTSResponse(BaseModel):
    audio_url: str
    timings: List[TTSWordTiming]
    character: Optional[str] = None


class VisualizationRequest(BaseModel):
    text: str
    line_index: int
    visualization_type: VisualizationType = VisualizationType.IMAGE
    context: Optional[str] = None


class VisualizationResponse(BaseModel):
    image_url: Optional[str] = None
    video_url: Optional[str] = None
    description: str
    confidence: float


class ReadingProgress(BaseModel):
    user_id: str
    document_id: str
    current_line: int
    total_lines: int
    reading_speed: float
    comprehension_score: float
    time_spent: int  # in seconds
    characters_encountered: List[str] = Field(default_factory=list)


class SolanaTransaction(BaseModel):
    signature: str
    user_id: str
    document_id: str
    progress_data: ReadingProgress
    timestamp: int


class ADHDReadingSettings(BaseModel):
    blur_non_important: bool = True
    highlight_keywords: bool = True
    show_visualizations: bool = True
    enable_character_voices: bool = True
    reading_speed: float = 1.0
    font_size: int = 16
    line_spacing: float = 1.5
    color_theme: str = "default"
    focus_mode: bool = True