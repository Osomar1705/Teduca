"""Tests de integración del dominio educativo (Fase 3)."""

from httpx import AsyncClient


async def _auth(client: AsyncClient, email: str, role: str) -> dict:
    reg = await client.post(
        "/api/v1/auth/register",
        json={"email": email, "name": "User", "password": "supersecret1", "role": role},
    )
    token = reg.json()["tokens"]["access_token"]
    return {"Authorization": f"Bearer {token}"}


async def _create_course(client: AsyncClient, headers: dict, title="Python 101") -> dict:
    resp = await client.post("/api/v1/courses", headers=headers, json={"title": title})
    return resp


async def test_teacher_creates_course(client: AsyncClient) -> None:
    headers = await _auth(client, "t@teduca.io", "teacher")
    resp = await _create_course(client, headers)
    assert resp.status_code == 201
    body = resp.json()
    assert body["status"] == "draft"
    assert body["slug"].startswith("python-101-")


async def test_student_cannot_create_course(client: AsyncClient) -> None:
    headers = await _auth(client, "s@teduca.io", "student")
    resp = await _create_course(client, headers)
    assert resp.status_code == 403


async def test_non_owner_cannot_update(client: AsyncClient) -> None:
    owner = await _auth(client, "owner@teduca.io", "teacher")
    other = await _auth(client, "other@teduca.io", "teacher")
    course = (await _create_course(client, owner)).json()

    resp = await client.patch(
        f"/api/v1/courses/{course['id']}", headers=other, json={"title": "Hackeado!"}
    )
    assert resp.status_code == 403


async def test_lessons_crud_and_listing(client: AsyncClient) -> None:
    headers = await _auth(client, "t2@teduca.io", "teacher")
    course = (await _create_course(client, headers)).json()
    cid = course["id"]

    created = await client.post(
        f"/api/v1/courses/{cid}/lessons",
        headers=headers,
        json={"title": "Intro", "order": 1, "duration": 10},
    )
    assert created.status_code == 201
    lid = created.json()["id"]

    listed = await client.get(f"/api/v1/courses/{cid}/lessons")
    assert listed.status_code == 200
    assert len(listed.json()) == 1

    upd = await client.patch(f"/api/v1/lessons/{lid}", headers=headers, json={"duration": 20})
    assert upd.json()["duration"] == 20


async def test_enroll_only_in_published_and_progress(client: AsyncClient) -> None:
    teacher = await _auth(client, "t3@teduca.io", "teacher")
    student = await _auth(client, "st@teduca.io", "student")
    course = (await _create_course(client, teacher)).json()
    cid = course["id"]

    # Curso en draft -> no permite inscripción
    draft_try = await client.post(f"/api/v1/courses/{cid}/enroll", headers=student)
    assert draft_try.status_code == 409

    # Publicar
    await client.patch(f"/api/v1/courses/{cid}", headers=teacher, json={"status": "published"})

    enroll = await client.post(f"/api/v1/courses/{cid}/enroll", headers=student)
    assert enroll.status_code == 201
    eid = enroll.json()["id"]

    # Doble inscripción -> conflicto
    dup = await client.post(f"/api/v1/courses/{cid}/enroll", headers=student)
    assert dup.status_code == 409

    # Progreso al 100 -> completa
    prog = await client.patch(
        f"/api/v1/enrollments/{eid}/progress", headers=student, json={"progress": 100}
    )
    assert prog.status_code == 200
    assert prog.json()["status"] == "completed"
    assert prog.json()["completed_at"] is not None

    mine = await client.get("/api/v1/enrollments/me", headers=student)
    assert mine.json()["pagination"]["total"] == 1


async def test_list_courses_paginated(client: AsyncClient) -> None:
    teacher = await _auth(client, "t4@teduca.io", "teacher")
    for i in range(3):
        await _create_course(client, teacher, title=f"Curso {i}")
    resp = await client.get("/api/v1/courses?limit=2")
    assert resp.status_code == 200
    body = resp.json()
    assert len(body["data"]) == 2
    assert body["pagination"]["total"] == 3
    assert body["pagination"]["pages"] == 2
