"""Tests de gamificación, logros y notificaciones (Fase 5)."""

from httpx import AsyncClient


async def _auth(client: AsyncClient, email: str, role: str) -> dict:
    reg = await client.post(
        "/api/v1/auth/register",
        json={"email": email, "name": "User", "password": "supersecret1", "role": role},
    )
    return {"Authorization": f"Bearer {reg.json()['tokens']['access_token']}"}


async def _published_course(client: AsyncClient, teacher: dict) -> str:
    cid = (
        await client.post("/api/v1/courses", headers=teacher, json={"title": "Curso Gam"})
    ).json()["id"]
    await client.patch(f"/api/v1/courses/{cid}", headers=teacher, json={"status": "published"})
    return cid


async def test_completing_course_awards_points_and_achievement(client: AsyncClient) -> None:
    teacher = await _auth(client, "tg1@teduca.io", "teacher")
    student = await _auth(client, "sg1@teduca.io", "student")
    cid = await _published_course(client, teacher)

    eid = (await client.post(f"/api/v1/courses/{cid}/enroll", headers=student)).json()["id"]
    await client.patch(
        f"/api/v1/enrollments/{eid}/progress", headers=student, json={"progress": 100}
    )

    summary = await client.get("/api/v1/gamification/me", headers=student)
    assert summary.status_code == 200
    assert summary.json()["total_points"] == 50
    assert summary.json()["current_streak"] == 1

    # Logro "primer curso completado" desbloqueado
    achievements = await client.get("/api/v1/achievements/me", headers=student)
    codes = [a["code"] for a in achievements.json()]
    assert "first_course_completed" in codes

    # Notificación del logro generada
    notifs = await client.get("/api/v1/notifications", headers=student)
    assert notifs.json()["pagination"]["total"] >= 1
    assert any(n["type"] == "achievement" for n in notifs.json()["data"])


async def test_reward_redeem_flow(client: AsyncClient) -> None:
    teacher = await _auth(client, "tg2@teduca.io", "teacher")
    student = await _auth(client, "sg2@teduca.io", "student")
    cid = await _published_course(client, teacher)
    eid = (await client.post(f"/api/v1/courses/{cid}/enroll", headers=student)).json()["id"]
    await client.patch(
        f"/api/v1/enrollments/{eid}/progress", headers=student, json={"progress": 100}
    )  # +50 pts

    rewards = await client.get("/api/v1/gamification/rewards", headers=student)
    bronze = next(r for r in rewards.json() if r["code"] == "badge_bronze")  # 100 pts

    # No alcanza (50 < 100)
    fail = await client.post(f"/api/v1/gamification/rewards/{bronze['id']}/redeem", headers=student)
    assert fail.status_code == 409


async def test_notifications_mark_read(client: AsyncClient) -> None:
    teacher = await _auth(client, "tg3@teduca.io", "teacher")
    student = await _auth(client, "sg3@teduca.io", "student")
    cid = await _published_course(client, teacher)
    eid = (await client.post(f"/api/v1/courses/{cid}/enroll", headers=student)).json()["id"]
    await client.patch(
        f"/api/v1/enrollments/{eid}/progress", headers=student, json={"progress": 100}
    )

    notifs = (await client.get("/api/v1/notifications", headers=student)).json()["data"]
    nid = notifs[0]["id"]
    read = await client.patch(f"/api/v1/notifications/{nid}/read", headers=student)
    assert read.status_code == 200
    assert read.json()["read_at"] is not None

    unread = await client.get("/api/v1/notifications?unread_only=true", headers=student)
    assert all(n["id"] != nid for n in unread.json()["data"])
