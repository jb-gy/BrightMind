from __future__ import annotations
from typing import List
from models import TTSWordTiming


def synthesize_with_timings(text: str, rate: float = 1.0) -> (str, List[TTSWordTiming]):
    """Mock TTS: returns a placeholder audio URL and synthetic word timings.
    Word duration is ~220ms at rate=1.0.
    """
    words = text.strip().split()
    base = int(220 / max(rate, 0.25))
    t = 0
    timings: List[TTSWordTiming] = []
    for i, _ in enumerate(words):
        start, end = t, t + base
        timings.append(TTSWordTiming(word_index=i, start_ms=start, end_ms=end))
        t = end
    # Public placeholder served by frontend; real impl should stream from object storage
    return "/placeholder.mp3", timings