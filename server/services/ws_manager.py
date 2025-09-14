from __future__ import annotations
from typing import Dict
from fastapi import WebSocket

class WSManager:
    def __init__(self):
        self.active: Dict[str, WebSocket] = {}

    async def connect(self, session_id: str, websocket: WebSocket):
        await websocket.accept()
        self.active[session_id] = websocket

    async def disconnect(self, session_id: str):
        ws = self.active.pop(session_id, None)
        if ws:
            try:
                await ws.close()
            except Exception:
                pass

    async def send_json(self, session_id: str, data):
        ws = self.active.get(session_id)
        if ws:
            await ws.send_json(data)

manager = WSManager()