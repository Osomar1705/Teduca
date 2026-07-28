"""Tests de analytics, event store y ML scaffold (Fase 6)."""

from httpx import AsyncClient


async def _auth(client: AsyncClient, email: str, role: str) -> dict:
    reg = await client.post(
        "/api/v1/auth/register",
        json={"email": email, "name": "User", "password": "supersecret1", "role": role},
    )
    return {"Authorization": f"Bearer {reg.json()['tokens']['access_token']}"}


async def _published_course(client: AsyncClient, teacher: dict, title="Curso ML") -> str:
    cid = (await client.post("/api/v1/courses", headers=teacher, json={"title": title})).json()[
        "id"
    ]
    await client.patch(f"/api/v1/courses/{cid}", headers=teacher, json={"status": "published"})
    return cid


async def test_events_persisted_and_activity(client: AsyncClient, promote_admin) -> None:
    admin = await _auth(client, "adm@teduca.io", "teacher")
    await promote_admin("adm@teduca.io")
    teacher = await _auth(client, "tm@teduca.io", "teacher")
    student = await _auth(client, "sm@teduca.io", "student")
    cid = await _published_course(client, teacher)

    await client.post(f"/api/v1/courses/{cid}/enroll", headers=student)

    # El event store registró enrollment.created
    overview = await client.get("/api/v1/analytics/overview", headers=admin)
    assert overview.status_code == 200
    assert overview.json()["events_by_name"].get("enrollment.created", 0) >= 1

    # La actividad del estudiante quedó bitacorada
    activity = await client.get("/api/v1/analytics/me/activity", headers=student)
    assert activity.json()["pagination"]["total"] >= 1


async def test_analytics_overview_admin_only(client: AsyncClient) -> None:
    student = await _auth(client, "s2@teduca.io", "student")
    resp = await client.get("/api/v1/analytics/overview", headers=student)
    assert resp.status_code == 403


async def test_ml_recommendations_refresh_and_read(client: AsyncClient) -> None:
    teacher = await _auth(client, "tml@teduca.io", "teacher")
    student = await _auth(client, "sml@teduca.io", "student")
    # Varios cursos publicados como candidatos
    for i in range(3):
        await _published_course(client, teacher, title=f"Curso {i}")

    refreshed = await client.post("/api/v1/ml/recommendations/me/refresh", headers=student)
    assert refreshed.status_code == 201
    kinds = {r["kind"] for r in refreshed.json()}
    assert "content" in kinds  # recomienda cursos no cursados
    assert "dropout" in kinds  # predicción de abandono

    # Lectura filtrada por tipo
    content = await client.get("/api/v1/ml/recommendations/me?kind=content", headers=student)
    assert content.status_code == 200
    assert all(r["kind"] == "content" for r in content.json())
    assert content.json()[0]["model_name"] == "stub"
