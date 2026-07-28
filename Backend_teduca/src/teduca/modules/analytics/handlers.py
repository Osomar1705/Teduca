"""Suscriptor global que vuelca cada evento de dominio al event store.

Esto desacopla la analítica y el ML del dominio: los servicios solo publican
eventos; aquí se persisten de forma uniforme. En producción, un worker
(Celery / Redis Streams) leería esta tabla para alimentar los modelos.
"""

import uuid

from teduca.core.events import DomainEvent, event_bus
from teduca.modules.analytics.service import AnalyticsService


async def persist_event(event: DomainEvent) -> None:
    if event.session is None:
        return
    raw_user = event.payload.get("student_id") or event.payload.get("user_id")
    user_id = uuid.UUID(raw_user) if raw_user else None
    await AnalyticsService(event.session).record_event(event.name, event.payload, user_id)


def register_analytics_handlers() -> None:
    event_bus.subscribe_all(persist_event)
