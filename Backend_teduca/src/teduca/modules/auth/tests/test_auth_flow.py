"""Tests de integración del flujo de autenticación (Fase 2)."""

from httpx import AsyncClient

REGISTER = "/api/v1/auth/register"
LOGIN = "/api/v1/auth/login"
REFRESH = "/api/v1/auth/refresh"
LOGOUT = "/api/v1/auth/logout"
ME = "/api/v1/users/me"


async def _register(client: AsyncClient, email="a@teduca.io", role="student"):
    return await client.post(
        REGISTER,
        json={"email": email, "name": "Ana", "password": "supersecret1", "role": role},
    )


async def test_register_returns_user_and_tokens(client: AsyncClient) -> None:
    resp = await _register(client)
    assert resp.status_code == 201
    body = resp.json()
    assert body["user"]["email"] == "a@teduca.io"
    assert body["user"]["roles"][0]["name"] == "student"
    assert body["tokens"]["access_token"]
    assert body["tokens"]["refresh_token"]


async def test_duplicate_email_conflicts(client: AsyncClient) -> None:
    await _register(client)
    resp = await _register(client)
    assert resp.status_code == 409


async def test_login_and_me(client: AsyncClient) -> None:
    await _register(client)
    login = await client.post(LOGIN, json={"email": "a@teduca.io", "password": "supersecret1"})
    assert login.status_code == 200
    token = login.json()["tokens"]["access_token"]

    me = await client.get(ME, headers={"Authorization": f"Bearer {token}"})
    assert me.status_code == 200
    assert me.json()["email"] == "a@teduca.io"


async def test_login_wrong_password(client: AsyncClient) -> None:
    await _register(client)
    resp = await client.post(LOGIN, json={"email": "a@teduca.io", "password": "wrongpass1"})
    assert resp.status_code == 401


async def test_me_requires_auth(client: AsyncClient) -> None:
    resp = await client.get(ME)
    assert resp.status_code == 401


async def test_refresh_rotates_token(client: AsyncClient) -> None:
    reg = await _register(client)
    refresh_token = reg.json()["tokens"]["refresh_token"]

    resp = await client.post(REFRESH, json={"refresh_token": refresh_token})
    assert resp.status_code == 200
    new_access = resp.json()["access_token"]
    assert new_access

    # El refresh usado queda revocado (rotación).
    reuse = await client.post(REFRESH, json={"refresh_token": refresh_token})
    assert reuse.status_code == 401


async def test_logout_blacklists_access(client: AsyncClient) -> None:
    reg = await _register(client)
    tokens = reg.json()["tokens"]
    headers = {"Authorization": f"Bearer {tokens['access_token']}"}

    out = await client.post(
        LOGOUT, headers=headers, json={"refresh_token": tokens["refresh_token"]}
    )
    assert out.status_code == 204

    me = await client.get(ME, headers=headers)
    assert me.status_code == 401


async def test_rbac_admin_only(client: AsyncClient) -> None:
    reg = await _register(client)  # student
    token = reg.json()["tokens"]["access_token"]
    some_id = reg.json()["user"]["id"]
    resp = await client.get(
        f"/api/v1/users/{some_id}", headers={"Authorization": f"Bearer {token}"}
    )
    assert resp.status_code == 403
