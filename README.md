<div align="center">

# 🎓 TEDUCA

**An EdTech marketplace that connects students with the right teacher.**
*Un marketplace EdTech que conecta estudiantes con el profesor correcto.*

![Next.js](https://img.shields.io/badge/Next.js%2016-000000?style=flat-square&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React%2019-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind%20v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)
![Python](https://img.shields.io/badge/Python%203.13-3776AB?style=flat-square&logo=python&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-FF4438?style=flat-square&logo=redis&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white)

</div>

---

## 🌟 What is this?

TEDUCA is a **two-sided EdTech platform**. Students discover teachers through a swipe-style feed, book sessions, enroll in courses and track their progress with gamified achievements. Teachers get a full workspace: profile, calendar, course builder, student roster and stats.

It is built as a **monorepo** with two independent, deployable halves:

```
Teduca/
├── Backend_teduca/   # FastAPI · Clean Architecture · modular monolith
└── Front_teduca/     # Next.js 16 App Router · React 19 · Tailwind v4
```

---

## ✨ Features

| Area | What it does |
| --- | --- |
| 🔐 **Identity** | Email/password + Google OAuth, email verification, password reset, JWT sessions with Argon2 hashing |
| 🧭 **Discovery** | Teacher feed, swipe matching, "For You" recommendations, favorites, public profiles at `/u/[username]` |
| 📚 **Learning** | Courses, lessons, enrollments, materials, assignments, submissions and quizzes |
| 📅 **Booking** | Availability calendar, reservations, session history ("orbits") |
| 🏆 **Gamification** | Achievements, progress tracking and notifications |
| 💬 **Community** | Community wall, posts, direct messages, announcements |
| 🧑‍🏫 **Teacher suite** | Onboarding flow, teacher profile, calendar, course management, student list and stats dashboard |
| 🛍️ **Extras** | Merch store, course reviews, analytics events for ML |
| 🛡️ **Admin** | Admin panel for users and content moderation |

---

## 🏗️ Architecture

### Backend — modular monolith, Clean Architecture

```
src/teduca/
├── core/        # config · database · redis · security · exceptions · pagination · events
├── api/v1/      # root router that composes every module
└── modules/     # auth · users · courses · bookings · community · ...
                 # each: models · schemas · repository · service · router · tests
```

Every module owns its slice vertically, so the monolith can be split into services later without a rewrite. Persistence is **async SQLAlchemy 2.0** with **Alembic** migrations, Redis handles caching, and domain events decouple side effects such as transactional email.

### Front-end — App Router with route groups

```
app/
├── (auth)/            # login · register · verify-email · forgot/reset password
├── (authenticated)/   # dashboard · discover · courses · reservations · teacher/* · admin
└── onboarding/        # first-run flow
```

State is split by concern: **TanStack Query** for server state, **Zustand** for client state, **react-hook-form + Zod** for forms. UI is **shadcn/ui** on Tailwind v4, animated with Framer Motion and themed with `next-themes`.

---

## 🚀 Quick start

### Backend (Docker — recommended)

```bash
cd Backend_teduca
cp .env.example .env          # set SECRET_KEY
docker compose up --build     # api + postgres + redis
```

- API → <http://localhost:8000>
- Interactive docs → <http://localhost:8000/docs>

### Backend (local, with `uv`)

```bash
cd Backend_teduca
uv sync
uv run uvicorn teduca.main:app --reload
uv run pytest -q
uv run ruff check . && uv run ruff format .
```

### Front-end

```bash
cd Front_teduca
npm install
cp .env.example .env.local             # set NEXT_PUBLIC_API_URL
npm run dev                            # http://localhost:3000
```

### Migrations

```bash
cd Backend_teduca
uv run alembic revision --autogenerate -m "message"
uv run alembic upgrade head
```

---

## 🧪 Quality

- **Pytest** suite per module, with `conftest.py` fixtures and a disposable test database
- **Ruff** for linting and formatting
- **GitHub Actions** CI on every push (`.github/workflows/ci.yml`)
- Typed end to end: Pydantic v2 on the server, TypeScript + Zod on the client

---

## 🇪🇸 En español

TEDUCA es un **marketplace EdTech de dos caras**. Los estudiantes descubren profesores con un feed tipo swipe, reservan sesiones, se matriculan en cursos y avanzan con logros gamificados. Los profesores tienen su propio espacio: perfil, calendario, creador de cursos, lista de alumnos y estadísticas.

El repo es un **monorepo** con dos mitades desplegables por separado:

- **`Backend_teduca/`** — FastAPI con Clean Architecture (monolito modular por dominios). Python 3.13, SQLAlchemy 2.0 async, Alembic, PostgreSQL, Redis, JWT + Argon2, Docker y CI en GitHub Actions.
- **`Front_teduca/`** — Next.js 16 con App Router, React 19, Tailwind v4, shadcn/ui, TanStack Query y Zustand.

Para levantarlo sigue los comandos de **Quick start**: el backend con `docker compose up --build` y el front con `npm run dev`.

---

<div align="center">

Built by [**Osmar Vilchez Aguirre**](https://github.com/Osomar1705) · UTEC 🇵🇪

</div>
