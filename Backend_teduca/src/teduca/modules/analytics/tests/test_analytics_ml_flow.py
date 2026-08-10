"""Tests de analytics, event store y ML scaffold (Fase 6)."""

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


async def _published_course(client: AsyncClient, teacher: dict, title="Curso ML") -> str:
    cid = (await client.post("/api/v1/courses", headers=teacher, json={"title": title})).json()[
        "id"
    ]
    await client.patch(f"/api/v1/courses/{cid}", headers=teacher, json={"status": "published"})
    return cid


async def test_events_persisted_and_activity(
    client: AsyncClient, promote_admin, promote_teacher
) -> None:
    admin = await _auth(client, "adm@teduca.io")
    await promote_admin("adm@teduca.io")
    # Re-login para obtener token con rol admin
    admin_login = await client.post(
        "/api/v1/auth/login", json={"email": "adm@teduca.io", "password": "supersecret1"}
    )
    admin = {"Authorization": f"Bearer {admin_login.json()['tokens']['access_token']}"}

    teacher = await _auth_teacher(client, "tm@teduca.io", promote_teacher)
    student = await _auth(client, "sm@teduca.io")
    cid = await _published_course(client, teacher)

    await client.post(f"/api/v1/courses/{cid}/enroll", headers=student)

    overview = await client.get("/api/v1/analytics/overview", headers=admin)
    assert overview.status_code == 200
    assert overview.json()["events_by_name"].get("enrollment.created", 0) >= 1

    activity = await client.get("/api/v1/analytics/me/activity", headers=student)
    assert activity.json()["pagination"]["total"] >= 1


async def test_analytics_overview_admin_only(client: AsyncClient) -> None:
    student = await _auth(client, "s2@teduca.io")
    resp = await client.get("/api/v1/analytics/overview", headers=student)
    assert resp.status_code == 403


async def test_ml_recommendations_refresh_and_read(
    client: AsyncClient, promote_teacher
) -> None:
    teacher = await _auth_teacher(client, "tml@teduca.io", promote_teacher)
    student = await _auth(client, "sml@teduca.io")
    for i in range(3):
        await _published_course(client, teacher, title=f"Curso {i}")

    refreshed = await client.post("/api/v1/ml/recommendations/me/refresh", headers=student)
    assert refreshed.status_code == 201
    kinds = {r["kind"] for r in refreshed.json()}
    assert "content" in kinds
    assert "dropout" in kinds

    content = await client.get("/api/v1/ml/recommendations/me?kind=content", headers=student)
    assert content.status_code == 200
    assert all(r["kind"] == "content" for r in content.json())
    assert content.json()[0]["model_name"] == "stub"
