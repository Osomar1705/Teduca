"""Bus de eventos de dominio (in-process).

Punto de desacople para analytics y machine_learning: los servicios emiten
eventos sin conocer a los consumidores. En Fase 6 se conectará a un worker
(Redis Streams / Celery) para procesamiento asíncrono.
"""

from collections import defaultdict
from collections.abc import Awaitable, Callable
from dataclasses import dataclass, field
from datetime import UTC, datetime
from typing import Any

Handler = Callable[["DomainEvent"], Awaitable[None]]


@dataclass(slots=True)
class DomainEvent:
    name: str
    payload: dict[str, Any] = field(default_factory=dict)
    occurred_at: datetime = field(default_factory=lambda: datetime.now(UTC))
    # Sesión de la transacción en curso; permite a los handlers (gamificación,
    # logros, notificaciones) escribir dentro de la misma unidad de trabajo.
    session: Any = None


class EventBus:
    def __init__(self) -> None:
        self._handlers: dict[str, list[Handler]] = defaultdict(list)
        self._global_handlers: list[Handler] = []

    def subscribe(self, event_name: str, handler: Handler) -> None:
        self._handlers[event_name].append(handler)

    def subscribe_all(self, handler: Handler) -> None:
        """Suscribe un handler a TODOS los eventos (p. ej. event store / analytics)."""
        self._global_handlers.append(handler)

    async def publish(self, event: DomainEvent) -> None:
        for handler in self._global_handlers:
            await handler(event)
        for handler in self._handlers.get(event.name, []):
            await handler(event)


event_bus = EventBus()
