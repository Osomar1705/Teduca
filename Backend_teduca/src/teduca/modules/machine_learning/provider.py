"""Puerto/Adaptador para modelos de ML.

El backend depende del PROTOCOLO `MLProvider`, no de una implementación
concreta. Hoy existe un `StubProvider` (heurístico); mañana se puede sustituir
por un adaptador que llame a un servicio de inferencia externo (REST/gRPC),
a SageMaker, a un endpoint de Vertex AI, etc., sin tocar el dominio.

Cómo se comunicarán los modelos con el backend:
  1. El dominio publica eventos -> se persisten en `events` (event store).
  2. Un worker/pipeline (fuera de proceso) entrena/infiere leyendo ese store.
  3. El worker escribe resultados en `ml_recommendations`.
  4. La API solo LEE `ml_recommendations` (baja latencia) vía este provider.
"""

from dataclasses import dataclass, field
from typing import Any, Protocol


@dataclass
class Recommendation:
    kind: str
    payload: dict[str, Any]
    score: float = 0.0
    rank: int = 0
    model_name: str = "stub"
    model_version: str = "0.0.1"


@dataclass
class UserFeatures:
    """Features mínimas que el provider necesita para inferir."""

    user_id: str
    total_points: int = 0
    courses_completed: int = 0
    quizzes_passed: int = 0
    days_since_last_activity: int = 0
    enrolled_course_ids: list[str] = field(default_factory=list)


class MLProvider(Protocol):
    """Contrato estable para cualquier motor de ML."""

    async def recommend_content(
        self, features: UserFeatures, candidates: list[dict[str, Any]]
    ) -> list[Recommendation]: ...

    async def predict_dropout(self, features: UserFeatures) -> Recommendation: ...


class StubProvider:
    """Implementación heurística mientras no haya modelos entrenados."""

    model_name = "stub"
    model_version = "0.0.1"

    async def recommend_content(
        self, features: UserFeatures, candidates: list[dict[str, Any]]
    ) -> list[Recommendation]:
        # Heurística: recomienda cursos no cursados, priorizando por popularidad.
        enrolled = set(features.enrolled_course_ids)
        pool = [c for c in candidates if c["id"] not in enrolled]
        pool.sort(key=lambda c: c.get("student_count", 0), reverse=True)
        return [
            Recommendation(
                kind="content",
                payload={"course_id": c["id"], "title": c.get("title")},
                score=round(1.0 - i * 0.1, 3),
                rank=i,
                model_name=self.model_name,
                model_version=self.model_version,
            )
            for i, c in enumerate(pool[:5])
        ]

    async def predict_dropout(self, features: UserFeatures) -> Recommendation:
        # Heurística: mayor riesgo cuantos más días inactivo y menos progreso.
        risk = min(
            1.0,
            0.15 * features.days_since_last_activity
            + (0.3 if features.courses_completed == 0 else 0.0),
        )
        return Recommendation(
            kind="dropout",
            payload={"risk_level": "high" if risk >= 0.6 else "low"},
            score=round(risk, 3),
            model_name=self.model_name,
            model_version=self.model_version,
        )


# Factory: punto único para cambiar de implementación (config/DI en el futuro).
_provider: MLProvider = StubProvider()


def get_ml_provider() -> MLProvider:
    return _provider
