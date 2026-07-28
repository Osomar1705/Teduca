"""Suscriptores del event_bus que materializan la gamificación.

Se ejecutan dentro de la misma transacción del evento (usan event.session),
de modo que puntos, rachas, logros y notificaciones se confirman de forma
atómica con la acción que los originó.
"""

import uuid

from teduca.core.events import DomainEvent, event_bus
from teduca.modules.achievements.service import AchievementService
from teduca.modules.gamification.service import GamificationService
from teduca.modules.notifications.service import NotificationService

# Puntos otorgados por tipo de evento
POINTS = {
    "enrollment.completed": 50,
    "quiz.completed": 30,  # solo si passed
    "submission.graded": 0,  # se usa la nota como puntos
}


async def _process(event: DomainEvent, points: int, reason: str) -> None:
    session = event.session
    if session is None:
        return
    user_id = uuid.UUID(event.payload["student_id"])

    gamification = GamificationService(session)
    if points:
        await gamification.award_points(user_id, points, reason, event.name)
    await gamification.touch_streak(user_id)

    # Logros desbloqueados -> notificación
    newly = await AchievementService(session).evaluate(user_id, event.name)
    notifications = NotificationService(session)
    for achievement in newly:
        await notifications.create(
            user_id,
            title=f"¡Logro desbloqueado: {achievement.name}!",
            message=achievement.description,
            type="achievement",
        )


async def on_enrollment_completed(event: DomainEvent) -> None:
    await _process(event, POINTS["enrollment.completed"], "Curso completado")


async def on_quiz_completed(event: DomainEvent) -> None:
    points = POINTS["quiz.completed"] if event.payload.get("passed") else 0
    await _process(event, points, "Quiz aprobado")


async def on_submission_graded(event: DomainEvent) -> None:
    score = int(event.payload.get("score", 0))
    await _process(event, score, "Tarea calificada")
    # Notifica la calificación al estudiante
    if event.session is not None:
        await NotificationService(event.session).create(
            uuid.UUID(event.payload["student_id"]),
            title="Tu tarea fue calificada",
            message=f"Obtuviste {score} puntos.",
            type="grade",
        )


def register_gamification_handlers() -> None:
    event_bus.subscribe("enrollment.completed", on_enrollment_completed)
    event_bus.subscribe("quiz.completed", on_quiz_completed)
    event_bus.subscribe("submission.graded", on_submission_graded)
