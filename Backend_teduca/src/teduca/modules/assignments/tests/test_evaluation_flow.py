"""Tests de integración del subsistema de evaluación (Fase 4)."""

from collections.abc import Callable, Coroutine
from typing import Any

from httpx import AsyncClient


async def _auth(client: AsyncClient, email: str) -> dict:
    reg = await client.post(
        "/api/v1/auth/register",
        json={"email": email, "name": "User", "password": "supersecret1"},
    )
    return {"Authorization": f"Bearer {reg.json()['tokens']['access_token']}"}


async def _auth_teacher(
    client: AsyncClient,
    email: str,
    promote_teacher: Callable[[str], Coroutine[Any, Any, None]],
) -> dict:
    await client.post(
        "/api/v1/auth/register",
        json={"email": email, "name": "User", "password": "supersecret1"},
    )
    await promote_teacher(email)
    login = await client.post(
        "/api/v1/auth/login", json={"email": email, "password": "supersecret1"}
    )
    return {"Authorization": f"Bearer {login.json()['tokens']['access_token']}"}


async def _course(client: AsyncClient, teacher: dict) -> str:
    resp = await client.post("/api/v1/courses", headers=teacher, json={"title": "Curso Eval"})
    return resp.json()["id"]


async def test_assignment_submission_and_grading(client: AsyncClient, promote_teacher) -> None:
    teacher = await _auth_teacher(client, "te@teduca.io", promote_teacher)
    student = await _auth(client, "se@teduca.io")
    cid = await _course(client, teacher)

    created = await client.post(
        f"/api/v1/courses/{cid}/assignments",
        headers=teacher,
        json={"title": "Ensayo", "max_score": 50},
    )
    assert created.status_code == 201
    aid = created.json()["id"]

    sub = await client.post(
        f"/api/v1/assignments/{aid}/submit",
        headers=student,
        json={"content": "Mi respuesta"},
    )
    assert sub.status_code == 201
    assert sub.json()["status"] == "submitted"
    sid = sub.json()["id"]

    # Entrega duplicada -> 409
    dup = await client.post(
        f"/api/v1/assignments/{aid}/submit", headers=student, json={"content": "x"}
    )
    assert dup.status_code == 409

    # Nota por encima del máximo -> 409
    over = await client.post(
        f"/api/v1/submissions/{sid}/grade", headers=teacher, json={"score": 999}
    )
    assert over.status_code == 409

    graded = await client.post(
        f"/api/v1/submissions/{sid}/grade",
        headers=teacher,
        json={"score": 45, "feedback": "Buen trabajo"},
    )
    assert graded.status_code == 200
    assert graded.json()["status"] == "graded"
    assert graded.json()["score"] == 45

    listed = await client.get(f"/api/v1/assignments/{aid}/submissions", headers=teacher)
    assert len(listed.json()) == 1


async def test_student_cannot_grade(client: AsyncClient, promote_teacher) -> None:
    teacher = await _auth_teacher(client, "tg@teduca.io", promote_teacher)
    student = await _auth(client, "sg@teduca.io")
    cid = await _course(client, teacher)
    aid = (
        await client.post(
            f"/api/v1/courses/{cid}/assignments", headers=teacher, json={"title": "Tarea 1"}
        )
    ).json()["id"]
    sid = (
        await client.post(
            f"/api/v1/assignments/{aid}/submit", headers=student, json={"content": "c"}
        )
    ).json()["id"]

    resp = await client.post(
        f"/api/v1/submissions/{sid}/grade", headers=student, json={"score": 10}
    )
    assert resp.status_code == 403


async def _quiz_payload() -> dict:
    return {
        "title": "Quiz básico",
        "pass_score": 60,
        "questions": [
            {
                "text": "2 + 2?",
                "points": 1,
                "options": [
                    {"text": "3", "is_correct": False},
                    {"text": "4", "is_correct": True},
                ],
            },
            {
                "text": "Capital de Francia?",
                "points": 1,
                "options": [
                    {"text": "París", "is_correct": True},
                    {"text": "Madrid", "is_correct": False},
                ],
            },
        ],
    }


async def test_quiz_creation_and_autograde(client: AsyncClient, promote_teacher) -> None:
    teacher = await _auth_teacher(client, "tq@teduca.io", promote_teacher)
    student = await _auth(client, "sq@teduca.io")
    cid = await _course(client, teacher)

    created = await client.post(
        f"/api/v1/courses/{cid}/quizzes", headers=teacher, json=await _quiz_payload()
    )
    assert created.status_code == 201
    quiz = created.json()
    assert "is_correct" not in quiz["questions"][0]["options"][0]

    q0, q1 = quiz["questions"]
    correct0 = q0["options"][1]["id"]  # "4"
    wrong1 = q1["options"][1]["id"]   # "Madrid"

    attempt = await client.post(
        f"/api/v1/quizzes/{quiz['id']}/attempts",
        headers=student,
        json={
            "answers": [
                {"question_id": q0["id"], "selected_option_id": correct0},
                {"question_id": q1["id"], "selected_option_id": wrong1},
            ]
        },
    )
    assert attempt.status_code == 201
    body = attempt.json()
    assert body["score"] == 50  # 1 de 2 correctas
    assert body["passed"] is False


async def test_quiz_requires_one_correct_option(client: AsyncClient, promote_teacher) -> None:
    teacher = await _auth_teacher(client, "tv@teduca.io", promote_teacher)
    cid = await _course(client, teacher)
    bad = {
        "title": "Malo",
        "questions": [
            {
                "text": "?",
                "options": [
                    {"text": "a", "is_correct": True},
                    {"text": "b", "is_correct": True},
                ],
            }
        ],
    }
    resp = await client.post(f"/api/v1/courses/{cid}/quizzes", headers=teacher, json=bad)
    assert resp.status_code == 422
