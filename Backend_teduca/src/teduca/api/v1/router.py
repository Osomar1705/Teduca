"""Router raíz de la API v1. Aquí se agregan los routers de cada módulo."""

from fastapi import APIRouter

from teduca.modules.achievements.router import router as achievements_router
from teduca.modules.analytics.router import router as analytics_router
from teduca.modules.assignments.router import (
    assignments_router,
    course_assignments_router,
)
from teduca.modules.auth.router import router as auth_router
from teduca.modules.courses.router import router as courses_router
from teduca.modules.edtech.router import router as edtech_router
from teduca.modules.enrollments.router import course_enroll_router, enrollments_router
from teduca.modules.gamification.router import router as gamification_router
from teduca.modules.lessons.router import course_lessons_router, lessons_router
from teduca.modules.machine_learning.router import router as ml_router
from teduca.modules.onboarding.router import router as onboarding_router
from teduca.modules.notifications.router import router as notifications_router
from teduca.modules.quizzes.router import course_quizzes_router, quizzes_router
from teduca.modules.submissions.router import (
    assignment_submissions_router,
    submissions_router,
)
from teduca.modules.users.router import router as users_router

api_router = APIRouter()


@api_router.get("/ping", tags=["health"])
async def ping() -> dict[str, str]:
    return {"message": "pong"}


api_router.include_router(auth_router)
api_router.include_router(users_router)
api_router.include_router(courses_router)
api_router.include_router(edtech_router)
api_router.include_router(course_lessons_router)
api_router.include_router(lessons_router)
api_router.include_router(course_enroll_router)
api_router.include_router(enrollments_router)
api_router.include_router(course_assignments_router)
api_router.include_router(assignments_router)
api_router.include_router(assignment_submissions_router)
api_router.include_router(submissions_router)
api_router.include_router(course_quizzes_router)
api_router.include_router(quizzes_router)
api_router.include_router(gamification_router)
api_router.include_router(achievements_router)
api_router.include_router(notifications_router)
api_router.include_router(analytics_router)
api_router.include_router(ml_router)
api_router.include_router(onboarding_router)
