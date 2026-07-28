"""Smoke tests de la Fase 1."""

from httpx import AsyncClient


async def test_health(client: AsyncClient) -> None:
    resp = await client.get("/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"


async def test_ping(client: AsyncClient) -> None:
    resp = await client.get("/api/v1/ping")
    assert resp.status_code == 200
    assert resp.json() == {"message": "pong"}
