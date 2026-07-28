"""Catálogo de logros (fuente de verdad en código, sembrado a la tabla).

Cada logro define una `metric` calculable desde la BD y un `threshold`.
Añadir un logro nuevo = añadir una entrada aquí + una función de métrica.
"""

from dataclasses import dataclass


@dataclass(frozen=True)
class AchievementDef:
    code: str
    name: str
    description: str
    metric: str
    threshold: int


ACHIEVEMENTS: list[AchievementDef] = [
    AchievementDef(
        "first_course_completed",
        "Primer curso completado",
        "Completaste tu primer curso.",
        "courses_completed",
        1,
    ),
    AchievementDef(
        "quiz_master",
        "Maestro de quizzes",
        "Aprobaste 3 quizzes.",
        "quizzes_passed",
        3,
    ),
    AchievementDef(
        "centurion",
        "Centurión",
        "Alcanzaste 100 puntos.",
        "total_points",
        100,
    ),
]

# Qué métricas conviene reevaluar ante cada evento (optimización).
METRICS_BY_EVENT: dict[str, set[str]] = {
    "enrollment.completed": {"courses_completed", "total_points"},
    "quiz.completed": {"quizzes_passed", "total_points"},
    "submission.graded": {"total_points"},
}
