# TEDUCA Backend

Backend EdTech escalable — **FastAPI + Clean Architecture** (monolito modular por dominios).

## Stack
Python 3.13 · FastAPI · SQLAlchemy 2.0 (async) · Alembic · PostgreSQL · Redis ·
Pydantic v2 · JWT + Argon2 · Docker · Pytest · Ruff · uv · GitHub Actions.

## Arranque rápido (Docker)

```bash
cp .env.example .env          # ajusta SECRET_KEY
docker compose up --build     # api + postgres + redis
# API:   http://localhost:8000
# Docs:  http://localhost:8000/docs
```

## Desarrollo local (uv)

```bash
uv sync                       # instala deps + dev
uv run uvicorn teduca.main:app --reload
uv run pytest -q              # tests
uv run ruff check . && uv run ruff format .
```

## Migraciones

```bash
uv run alembic revision --autogenerate -m "mensaje"
uv run alembic upgrade head
```

## Estructura

```
src/teduca/
├── core/        # config, database, redis, security, exceptions, pagination, events, dependencies
├── api/v1/      # router raíz que agrega los módulos
└── modules/     # auth, users, courses, ... (models/schemas/repository/service/router/tests)
```

## Roadmap
1. **Fundaciones** ✅ (scaffold, core, Docker, CI)
2. Auth + Users + Roles
3. Courses + Lessons + Enrollments
4. Assignments + Submissions + Quizzes
5. Gamification + Achievements + Notifications
6. Analytics + Events + ML (scaffold)
7. Migración del frontend Next.js
