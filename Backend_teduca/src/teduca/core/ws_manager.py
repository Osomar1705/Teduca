"""Manager de conexiones WebSocket por hilo de chat."""

import uuid
from collections import defaultdict

from fastapi import WebSocket


class ConnectionManager:
    def __init__(self) -> None:
        self._connections: dict[uuid.UUID, list[WebSocket]] = defaultdict(list)

    async def connect(self, thread_id: uuid.UUID, ws: WebSocket) -> None:
        await ws.accept()
        self._connections[thread_id].append(ws)

    def disconnect(self, thread_id: uuid.UUID, ws: WebSocket) -> None:
        conns = self._connections[thread_id]
        if ws in conns:
            conns.remove(ws)
        if not conns:
            del self._connections[thread_id]

    async def broadcast(self, thread_id: uuid.UUID, payload: dict) -> None:
        dead: list[WebSocket] = []
        for ws in list(self._connections.get(thread_id, [])):
            try:
                await ws.send_json(payload)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(thread_id, ws)


chat_manager = ConnectionManager()
