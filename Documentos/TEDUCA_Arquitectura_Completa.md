# TEDUCA — Documentación Técnica Completa

**Fecha:** Agosto 2026  
**Repositorio:** https://github.com/Osomar1705/Teduca  
**Frontend:** https://teduca.vercel.app  
**Backend:** https://teduca-backend.vercel.app  

---

## 1. VISIÓN DEL PRODUCTO

TEDUCA es una plataforma EdTech que funciona como una **comunidad académica** donde estudiantes aprenden, reciben mentoría, participan, consiguen oportunidades y son recompensados por su esfuerzo.

No es un marketplace de cursos tradicional. Es un ecosistema donde:
- Los estudiantes descubren profesores via swipe/match
- La gamificación (rachas, XP, niveles, logros) motiva el regreso diario
- Un sistema de recompensas flexible puede conectarse con beneficios reales (cafeterías, transporte, universidades)
- Un mentor IA acompaña el aprendizaje (arquitectura lista para conectar modelos de IA)

---

## 2. ESTRUCTURA DEL MONOREPO

```
Teduca/
├── Front_teduca/          # Next.js 16 — frontend
├── Backend_teduca/        # FastAPI — backend
├── Logos_Teduca/          # Assets de marca
└── Documentos/            # Este directorio
```

**Repositorio:** monorepo en GitHub (`Osomar1705/Teduca`)  
**Deploy frontend:** Vercel (Root Directory = `Front_teduca`, Framework = Next.js)  
**Deploy backend:** Render + Vercel (`teduca-backend.vercel.app`)  
**Base de datos:** Neon Postgres (pooled, region us-east-2)  
**Redis:** opcional — deshabilitado en serverless, se degrada sin romper el login  

---

## 3. FRONTEND — `Front_teduca/`

### 3.1 Stack

| Tecnología | Versión | Rol |
|---|---|---|
| Next.js | 16.2.6 | Framework React (App Router) |
| React | 19 | UI library |
| TypeScript | strict | Tipado |
| Tailwind CSS | v4 | Estilos |
| Framer Motion | 12 | Animaciones |
| Zustand | 5 | Estado global |
| TanStack Query | 5 | Data fetching |
| Lucide React | 1 | Iconos (solo geométricos) |
| next-themes | 0.4 | Tema claro/oscuro |
| react-hook-form + zod | latest | Formularios |

### 3.2 Estructura de archivos

```
Front_teduca/
├── app/
│   ├── (auth)/                    # Rutas públicas (sin sidebar)
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (authenticated)/           # Rutas protegidas (con sidebar)
│   │   ├── layout.tsx             # DashboardShell wrapper
│   │   ├── dashboard/page.tsx     # Panel principal
│   │   ├── for-you/page.tsx       # Mentor IA
│   │   ├── discover/              # Descubrir profesores
│   │   │   ├── page.tsx           # Grid + tabs
│   │   │   ├── swipe/page.tsx     # Modo swipe
│   │   │   └── [id]/page.tsx      # Perfil de profesor
│   │   ├── courses/page.tsx       # Centro académico de cursos
│   │   ├── favorites/page.tsx     # Favoritos
│   │   ├── reservations/page.tsx  # Mis reservas
│   │   ├── messages/page.tsx      # Chat con profesores
│   │   ├── participate/page.tsx   # Participación académica
│   │   ├── achievements/page.tsx  # Logros y gamificación
│   │   ├── rewards/
│   │   │   ├── page.tsx           # Hub de recompensas (3 tabs)
│   │   │   └── history/page.tsx   # Historial de transacciones
│   │   ├── profile/page.tsx       # Identidad académica
│   │   ├── notifications/page.tsx # Centro de notificaciones
│   │   └── settings/page.tsx      # Configuración + planes
│   ├── onboarding/page.tsx        # Onboarding (3 pasos, fuera del layout)
│   ├── page.tsx                   # Landing pública
│   ├── layout.tsx                 # Root layout (fuentes, providers)
│   └── globals.css                # Design system (tokens OKLCH)
├── components/
│   ├── ui/                        # Primitivas base
│   │   ├── button.tsx             # Base UI button con asChild
│   │   ├── card.tsx               # Card + Header + Content + Footer
│   │   ├── badge.tsx              # Variants: default/solid/secondary/success/warning/info/destructive
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── select.tsx
│   │   ├── checkbox.tsx
│   │   ├── avatar.tsx             # Avatar con fallback de iniciales
│   │   ├── progress.tsx           # Barra de progreso
│   │   └── skeleton.tsx           # Skeleton loader
│   ├── common/
│   │   ├── Logo.tsx               # Logo + LogoMark
│   │   ├── Motion.tsx             # FadeIn, Stagger, StaggerItem (Framer)
│   │   ├── PageHeader.tsx         # Header reutilizable de página
│   │   ├── EmptyState.tsx         # Estado vacío con ícono + CTA
│   │   └── ThemeToggle.tsx        # Toggle claro/oscuro
│   ├── layout/
│   │   ├── DashboardShell.tsx     # Layout autenticado: sidebar + topbar
│   │   ├── Sidebar.tsx            # Navegación lateral (w-56, 4 grupos)
│   │   └── Navbar.tsx             # Navbar de la landing
│   ├── auth/
│   │   ├── AuthForm.tsx           # Formulario login/registro unificado
│   │   └── GoogleSignInButton.tsx # Botón Google (condicional por config)
│   ├── dashboard/
│   │   ├── StatsCard.tsx          # Card de métrica
│   │   ├── StreakCard.tsx         # Widget de racha de estudio
│   │   ├── LevelCard.tsx          # Widget nivel + XP + barra
│   │   ├── WeeklyGoals.tsx        # Objetivos semanales del usuario
│   │   └── RewardSummaryWidget.tsx # Chip de balance de puntos
│   ├── edtech/
│   │   ├── TeacherCard.tsx        # Card horizontal de profesor
│   │   ├── CourseCard.tsx         # Card horizontal de curso
│   │   ├── SwipeDeck.tsx          # Deck de swipe (modo match)
│   │   └── TagInput.tsx           # Input de tags/chips
│   ├── gamification/
│   │   ├── AchievementCard.tsx    # Card de logro (bloqueado/desbloqueado)
│   │   └── RewardCard.tsx         # Card de recompensa del marketplace
│   ├── rewards/
│   │   ├── TransactionRow.tsx     # Fila del historial de transacciones
│   │   ├── RankingTable.tsx       # Tabla de ranking con medallas
│   │   └── rewardIcons.ts         # Mapeo event → ícono Lucide
│   ├── notifications/
│   │   └── NotificationItem.tsx   # Item de notificación
│   ├── ai-mentor/
│   │   └── MentorChat.tsx         # Interfaz de chat con el mentor IA
│   ├── profile/
│   │   └── ProfileEditor.tsx      # Editor de perfil de profesor
│   └── onboarding/
│       └── OnboardingFlow.tsx     # Flujo de 3 pasos de onboarding
├── lib/
│   ├── api-client.ts              # Cliente HTTP base (fetch + Bearer + refresh)
│   ├── auth-client.ts             # signIn / signOut / getSession
│   ├── auth-tokens.ts             # Manejo de cookies JWT
│   ├── constants.ts               # APP_ROUTES + API_ENDPOINTS + enums
│   ├── utils.ts                   # cn() + helpers
│   ├── format.ts                  # formatPrice, formatRelativeTime, MODALITY_LABEL
│   ├── types.ts                   # Tipos globales
│   ├── edtech/
│   │   ├── service.ts             # CRUD de profesores, cursos, favoritos, reservas, chat
│   │   └── types.ts               # TeacherProfile, Course, Reservation, ChatThread...
│   ├── gamification/
│   │   ├── types.ts               # UserLevel, Streak, Achievement, GamificationState
│   │   ├── service.ts             # localStorage: streak, XP, niveles, recordDailyActivity
│   │   └── achievements.ts        # 8 logros predefinidos
│   ├── rewards/
│   │   ├── types.ts               # RewardItem, RewardTransaction, RewardBalance, RankingData...
│   │   ├── service.ts             # localStorage: balance, transacciones, marketplace, ranking
│   │   └── hooks.ts               # useRewardBalance, useMarketplace
│   ├── notifications/
│   │   ├── types.ts               # Notification, NotificationCategory
│   │   └── service.ts             # getNotifications, markAsRead, markAllAsRead
│   ├── participation/
│   │   ├── types.ts               # ParticipationStats
│   │   └── service.ts             # Stub → null (backend pendiente)
│   ├── ai-mentor/
│   │   ├── types.ts               # MentorMessage, MentorContext
│   │   └── service.ts             # Respuestas por keywords (stub para /api/v1/ai/mentor/chat)
│   └── onboarding/
│       └── service.ts             # getOnboardingStatus, getOnboarding, saveStep1/2/3, complete
├── store/
│   └── uiStore.ts                 # Zustand: isMobileMenuOpen
└── proxy.ts                       # Middleware de Next.js (protección de rutas + headers HTTP)
```

### 3.3 Rutas de la aplicación (21 en total)

| Ruta | Tipo | Descripción |
|---|---|---|
| `/` | Pública | Landing page |
| `/login` | Pública | Inicio de sesión |
| `/register` | Pública | Registro |
| `/onboarding` | Semi-privada | Onboarding 3 pasos (post-registro) |
| `/dashboard` | Privada | Panel principal |
| `/for-you` | Privada | Mentor IA — "Para Ti" |
| `/discover` | Privada | Descubrir profesores (grid + tabs) |
| `/discover/swipe` | Privada | Modo swipe / match |
| `/discover/[id]` | Privada | Perfil público de un profesor |
| `/courses` | Privada | Centro académico de cursos |
| `/favorites` | Privada | Profesores favoritos |
| `/reservations` | Privada | Mis reservas de mentoría |
| `/messages` | Privada | Chat con profesores (post-match) |
| `/participate` | Privada | Participación académica |
| `/achievements` | Privada | Logros, XP y nivel |
| `/rewards` | Privada | Hub de recompensas (balance/marketplace/ranking) |
| `/rewards/history` | Privada | Historial de transacciones |
| `/profile` | Privada | Identidad académica + editor de perfil |
| `/notifications` | Privada | Centro de notificaciones |
| `/settings` | Privada | Configuración + planes |

### 3.4 Design System

El sistema visual está definido en `globals.css` usando tokens OKLCH (perceptualmente uniformes):

**Colores base:**
- Primary: `oklch(0.47 0.19 264)` — cobalto del isotipo (tardígrado)
- Background: casi blanco con tinte azul sutil
- Superficie: sidebar ligeramente más claro que el fondo

**Escalas:**
- `brand-50` → `brand-950`: 11 pasos de la escala de marca cobalto
- Semánticos: success (verde esmeralda), warning (ámbar), destructive (rojo), info (azul cian)

**Sombras:** con tinte cobalto (no negro puro), 5 niveles + `shadow-glow`

**Utilidades CSS:**
- `.glass` — glassmorphism (backdrop-blur + saturación)
- `.bg-gradient-brand` — gradiente cobalto → cian
- `.bg-grid` / `.bg-grid-light` — patrón de grid tipo Linear/Vercel
- `.aura` — radial gradient para fondos de hero
- `.animate-fade-up` — animación de entrada

**Tipografía (escala fija):**
```
Display:  text-3xl  font-bold   tracking-tight  → héroes de sección
H1:       text-2xl  font-semibold tracking-tight → encabezados de página
H2:       text-lg   font-semibold               → secciones
H3:       text-base font-medium                 → subtítulos de card
Body:     text-sm   font-normal                 → contenido
Caption:  text-xs   text-muted-foreground       → meta, fechas
```

### 3.5 Sistema de autenticación (frontend)

- **JWT propio** — no Auth.js. El backend emite `access_token` (15min) + `refresh_token` (7 días).
- `access_token` en localStorage (`teduca_access_token`)
- `refresh_token` en cookie `teduca_auth` (HttpOnly simulado, con flag `Secure` en HTTPS)
- `proxy.ts` (middleware Next.js): intercepta rutas privadas, verifica cookie, redirige a `/login?from=<url>` si no autenticado
- Refresh automático: el `api-client.ts` reintenta con el refresh token si recibe 401
- Google OAuth: condicional, el front consulta `GET /api/v1/auth/config` y solo muestra el botón si `google_enabled: true`

### 3.6 Seguridad aplicada (proxy.ts + next.config)

Headers HTTP configurados en producción:
- `Content-Security-Policy` — scripts solo desde `'self'` + Google
- `X-Frame-Options: DENY` — previene clickjacking
- `X-Content-Type-Options: nosniff`
- `Strict-Transport-Security` — fuerza HTTPS 1 año
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` — bloquea cámara, micrófono, geolocalización, pagos
- URLs de redes sociales de profesores sanitizadas (solo `https://` permitido)

### 3.7 Sistema de gamificación (client-side)

Persistido en `localStorage` hasta que el backend tenga endpoints propios:

| Key | Contenido |
|---|---|
| `teduca_xp` | XP total acumulado |
| `teduca_last_active` | Fecha ISO del último día activo |
| `teduca_reward_balance` | Balance de puntos + stats |
| `teduca_reward_transactions` | Historial de transacciones |
| `teduca_notifications_read` | IDs de notificaciones leídas |

**10 Niveles:** Explorador → Estudiante → Aprendiz → Practicante → Competente → Avanzado → Experto → Maestro → Sabio → Leyenda

**8 Logros predefinidos:** Primer Paso, Primera Mentoría, Centurión (100 XP), Constancia (7 días), Builder, Top 10, Destacado, Match Maestro.

### 3.8 Sistema de recompensas

Completamente desacoplado del nombre. La UI muestra "Puntos académicos" pero el código usa tipos genéricos (`RewardType`, `EarnEventType`). En el futuro se puede cambiar a "Orbits", vales de comida, descuentos, etc. sin modificar la arquitectura.

**17 reglas de ganancia** (9 activas, 8 "Próximamente"):
- Login diario: 5 pts (idempotente por día)
- Mentoría asistida: 50 pts
- Curso completado: 100 pts
- Módulo completado: 20 pts
- Racha 7 días: 30 pts
- Hackathon: 75 pts
- Investigación publicada: 80 pts
- ...y más

**12 items en el marketplace:** vales de comida, descuentos en cafetería, libros, cursos premium, certificados, eventos exclusivos, gift cards.

### 3.9 Mentor IA (arquitectura)

El servicio en `lib/ai-mentor/service.ts` responde a keywords localmente y está preparado para conectar a `POST /api/v1/ai/mentor/chat`. La interfaz (`MentorChat.tsx`) es completa — solo hay que cambiar el service para que haga la llamada real al backend cuando exista el endpoint.

---

## 4. BACKEND — `Backend_teduca/`

### 4.1 Stack

| Tecnología | Versión | Rol |
|---|---|---|
| Python | 3.13 | Lenguaje |
| FastAPI | latest | Framework web |
| SQLAlchemy | 2.0 async | ORM |
| Alembic | latest | Migraciones |
| Pydantic v2 | latest | Schemas + validación |
| Argon2 | latest | Hashing de contraseñas |
| PyJWT | latest | Tokens JWT |
| aiosqlite | latest | SQLite para tests |
| fakeredis | latest | Redis mock para tests |
| uv | latest | Gestor de paquetes |
| ruff | latest | Linter + formatter |
| pytest-asyncio | latest | Tests async |

### 4.2 Arquitectura: Clean Architecture / Monolito Modular

Cada módulo tiene su propia carpeta con capas bien separadas:

```
Backend_teduca/
├── src/teduca/
│   ├── core/
│   │   ├── config.py          # Pydantic Settings (env vars)
│   │   ├── database.py        # Engine async, Base, UUIDMixin, TimestampMixin
│   │   ├── dependencies.py    # DbSession, CurrentUser, get_token_payload
│   │   ├── redis.py           # Cliente Redis singleton (opcional)
│   │   ├── security.py        # JWT create/verify, password hash/verify
│   │   └── seed.py            # Seed de datos iniciales (roles, admin)
│   ├── api/
│   │   └── v1/
│   │       └── router.py      # Agrega todos los routers de módulos
│   ├── main.py                # App FastAPI, CORS, lifespan, Swagger
│   └── modules/
│       ├── auth/              # Registro, login, refresh, logout, Google OAuth
│       ├── users/             # CRUD de usuarios, roles, RBAC
│       ├── courses/           # Cursos (CRUD, publicar, archivar)
│       ├── lessons/           # Lecciones por curso
│       ├── enrollments/       # Inscripciones a cursos
│       ├── assignments/       # Tareas por curso
│       ├── submissions/       # Entregas de tareas
│       ├── quizzes/           # Quizzes con autograde
│       ├── gamification/      # Puntos, logros (modelo DB)
│       ├── achievements/      # Achievements del sistema (CRUD)
│       ├── notifications/     # Notificaciones de usuario
│       ├── analytics/         # Eventos de analytics + scaffold ML
│       ├── machine_learning/  # Provider port/adapter (StubProvider)
│       ├── edtech/            # Marketplace: perfiles, swipe, favoritos, reservas, chat
│       └── onboarding/        # Flujo de onboarding de 3 pasos
├── migrations/
│   └── versions/              # 8 migraciones Alembic aplicadas
│       ├── 15c15ecc2938       # Tablas base: users, roles, refresh_tokens
│       ├── 9c1c256e7d17       # Courses, lessons, enrollments
│       ├── 517d99a443af       # Assignments, submissions, quizzes
│       ├── 3bbfd4ffbeec       # Gamification, achievements, notifications
│       ├── f4fdabf5be04       # Analytics, ML scaffold
│       ├── a1b2c3d4e5f6       # Google OAuth fields en users
│       ├── b2c3d4e5f6a7       # EdTech marketplace tables
│       └── c3d4e5f6a7b8       # Onboarding table
├── conftest.py                # Fixtures: SQLite + fakeredis para tests
└── pyproject.toml             # Config: uv, ruff, pytest-asyncio
```

### 4.3 Módulos y endpoints

#### Auth (`/api/v1/auth`)
| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/config` | ¿Google OAuth habilitado? |
| POST | `/register` | Registro con email + password |
| POST | `/login` | Login → access + refresh tokens |
| POST | `/refresh` | Rotar refresh token |
| POST | `/logout` | Blacklist del access token |
| POST | `/google` | Login con Google (si habilitado) |

#### Users (`/api/v1/users`)
| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/me` | Usuario en sesión |
| GET | `/{id}` | Ver usuario (solo admin) |
| GET | `/` | Listar usuarios (solo admin) |
| DELETE | `/{id}` | Eliminar usuario (solo admin) |

#### Courses (`/api/v1/courses`)
| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/` | Listar cursos (paginado) |
| POST | `/` | Crear curso (teacher/admin) |
| GET | `/{id}` | Ver curso |
| PUT | `/{id}` | Editar curso |
| DELETE | `/{id}` | Eliminar curso |
| GET | `/{id}/lessons` | Lecciones del curso |
| POST | `/{id}/enroll` | Inscribirse al curso |
| POST | `/{id}/assignments` | Crear tarea |
| POST | `/{id}/quizzes` | Crear quiz |

#### EdTech Marketplace (`/api/v1/edtech`)
| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/teachers` | Listar perfiles de docentes |
| GET | `/teachers/{id}` | Ver perfil de un docente |
| GET | `/me/profile` | Mi perfil de docente |
| PUT | `/me/profile` | Actualizar mi perfil |
| GET | `/courses` | Cursos del marketplace |
| GET | `/discover` | Perfiles para descubrir (swipe) |
| POST | `/swipe` | Registrar swipe (left/right) |
| GET | `/favorites` | Mis favoritos |
| POST | `/favorites/{teacher_id}` | Agregar favorito |
| DELETE | `/favorites/{teacher_id}` | Quitar favorito |
| GET | `/reservations` | Mis reservas |
| POST | `/reservations` | Crear reserva |
| GET | `/reservations/{id}` | Ver reserva |
| PUT | `/reservations/{id}/status` | Cambiar estado de reserva |
| GET | `/chat/threads` | Mis hilos de chat |
| GET | `/chat/threads/{id}/messages` | Mensajes de un hilo |
| POST | `/chat/threads/{id}/messages` | Enviar mensaje |

#### Onboarding (`/api/v1/onboarding`)
| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/status` | ¿Onboarding completado? |
| GET | `/me` | Datos del onboarding |
| POST | `/check-username` | ¿Username disponible? |
| PUT | `/step/1` | Guardar paso 1 (nombre, username, fecha nac.) |
| PUT | `/step/2` | Guardar paso 2 (institución, carrera, objetivos) |
| PUT | `/step/3` | Guardar paso 3 (intereses, proyectos, estilos) |
| POST | `/complete` | Marcar onboarding como completado |

#### Gamification (`/api/v1/gamification`)
Puntos, logros y nivel de usuario (modelos en DB, endpoints en desarrollo).

#### Notifications (`/api/v1/notifications`)
Notificaciones del sistema por usuario.

#### Analytics (`/api/v1/analytics`)
Eventos de comportamiento para análisis y ML scaffold.

### 4.4 Modelo de datos (tablas principales)

```
users                  → id, email, name, avatar, is_active, auth_provider, google_sub
roles                  → id, name, description
user_roles             → user_id, role_id  (M2M, CASCADE)
refresh_tokens         → id, user_id, token_hash, expires_at
courses                → id, title, description, status, teacher_id
lessons                → id, course_id, title, content, order
enrollments            → id, user_id, course_id, progress, completed_at
assignments            → id, course_id, title, description, due_date
submissions            → id, assignment_id, user_id, content, grade
quizzes                → id, course_id, title
quiz_options           → id, quiz_id, text, is_correct
gamification_points    → id, user_id, points, event_type, description
achievements           → id, name, description, icon, xp_reward
user_achievements      → user_id, achievement_id, unlocked_at
notifications          → id, user_id, title, body, is_read, category
analytics_events       → id, user_id, event_type, payload, created_at

# EdTech marketplace
teacher_profiles       → id, user_id, name, specialty, bio, hourly_price, ...
marketplace_courses    → id, teacher_profile_id, title, description, price, ...
swipes                 → id, user_id, teacher_profile_id, direction, created_at
favorites              → id, user_id, teacher_profile_id (M2M)
reservations           → id, user_id, teacher_profile_id, date, time, status
chat_threads           → id, user_id, teacher_profile_id (1 por match)
chat_messages          → id, thread_id, sender_id, body, created_at

# Onboarding
user_onboarding        → id, user_id, full_name, username, institution, career,
                         academic_year, goals[], subject_tags[], project_interests[],
                         learning_styles[], current_step, completed
```

### 4.5 Seguridad del backend

- **Contraseñas:** Argon2 (no bcrypt) — resistente a GPU cracking
- **JWT:** HS256, access 15min, refresh 7 días
- **Blacklist de tokens:** Redis (logout invalida el access token inmediatamente). Sin Redis: degradación silenciosa (logout funciona pero el token sigue válido hasta expirar)
- **RBAC:** roles `student`, `teacher`, `admin` — decoradores `@require_roles`
- **CASCADE:** `user_roles` y `refresh_tokens` tienen ON DELETE CASCADE sobre `users`
- **CORS:** configurable via `CORS_ORIGINS` en `.env`
- **Rate limiting:** middleware configurable (default 100/minuto)
- **Google OAuth:** condicional, controlado por `ENABLE_GOOGLE_AUTH` env var

### 4.6 Variables de entorno (Backend)

```env
DATABASE_URL=postgresql+asyncpg://user:pass@host/db
SECRET_KEY=<clave_secreta_fuerte>
REDIS_URL=                          # vacío = Redis deshabilitado
ENVIRONMENT=production
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7
CORS_ORIGINS=https://teduca.vercel.app
ENABLE_GOOGLE_AUTH=false            # true para activar Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

### 4.7 Tests

**26 tests** — todos verdes. Se ejecutan con:
```bash
cd Backend_teduca && uv run pytest
```

- Base de datos: SQLite en memoria (async) — no requiere Postgres para tests
- Redis: fakeredis — no requiere Redis real
- Cobertura: auth flow, cursos, enrollments, assignments, quizzes, gamification

---

## 5. DEPLOY Y INFRAESTRUCTURA

### 5.1 Frontend en Vercel

- **Proyecto:** `teduca` en Vercel
- **Root Directory:** `Front_teduca` (configurado en Settings → Build)
- **Framework Preset:** Next.js (no "Other")
- **Package manager:** npm (único lockfile: `package-lock.json`)
- **Env var crítica:** `NEXT_PUBLIC_API_URL=https://teduca-backend.vercel.app`
- **Auto-deploy:** activado desde `main`
- **Middleware:** `proxy.ts` (no `middleware.ts` — convención Next 16)

### 5.2 Backend en Render / Vercel

- **URL:** `https://teduca-backend.vercel.app`
- **Base de datos:** Neon Postgres (pooled) — `ep-rough-bird-...-pooler.us-east-2.aws.neon.tech`
- **Migraciones:** 8 migraciones aplicadas en Neon desde local:
  ```bash
  DATABASE_URL=postgresql+asyncpg://... uv run alembic upgrade head
  ```
- **Seed inicial:** corre automáticamente en startup (roles + usuario admin)
- **Usuario de prueba:** `admin@teduca.com` / `Teduca2026!` (rol student)

### 5.3 Flujo de deploy

```
git push origin main
    ↓
Vercel auto-deploy frontend (teduca.vercel.app)
    ↓
Render/Vercel auto-deploy backend (teduca-backend.vercel.app)
```

---

## 6. ONBOARDING DE USUARIO

El flujo obligatorio para usuarios nuevos tiene 3 pasos:

**Paso 1 — Datos básicos:**
- Nombre completo
- Nombre de usuario (único, verificado en tiempo real)
- Fecha de nacimiento
- Email institucional → detecta y activa `is_edu_verified`

**Paso 2 — Perfil académico:**
- Institución educativa
- Carrera
- Año académico
- Objetivos (`goals[]`): aprender, mentoría, enseñar, equipo, investigación, contenido

**Paso 3 — Intereses:**
- Tags de materias (`subject_tags[]`)
- Intereses de proyecto (`project_interests[]`)
- Estilos de aprendizaje (`learning_styles[]`)

El `DashboardShell` verifica `GET /api/v1/onboarding/status` al montar y redirige a `/onboarding` si no está completado.

---

## 7. SISTEMA DE MATCH

El sistema de descubrimiento funciona en 3 modos:

### 7.1 Grid / Exploración
- `GET /api/v1/edtech/teachers` — lista todos los profesores
- Filtros por categoría en el frontend
- Cards horizontales con info compacta

### 7.2 Swipe Mode
- `GET /api/v1/edtech/discover` — perfiles no vistos aún
- `POST /api/v1/edtech/swipe` con `{teacher_profile_id, direction}`
- Swipe derecho (like) → crea favorito + hilo de chat automáticamente
- Swipe izquierdo (pass) → registra para no mostrar de nuevo

### 7.3 Match Académico (arquitectura lista)
Categorías preparadas para conectar a backend futuro:
- Mentores, Compañeros, Investigadores, Equipos, Startups, Hackathons, Clubs, Laboratorios, Comunidades, Eventos

---

## 8. CHAT

- Solo disponible después de un match (swipe derecho)
- `GET /api/v1/edtech/chat/threads` — mis conversaciones
- `GET /api/v1/edtech/chat/threads/{id}/messages` — mensajes de un hilo
- `POST /api/v1/edtech/chat/threads/{id}/messages` — enviar mensaje
- Frontend hace polling cada 4 segundos para nuevos mensajes
- Sidebar muestra los hilos con nombre + avatar del profesor

---

## 9. ROADMAP TÉCNICO (PENDIENTE)

### Inmediato
- [ ] Endpoint de Ranking real (`/api/v1/ranking`)
- [ ] Gamificación en backend (sincronizar XP/streak desde API, no solo localStorage)
- [ ] Endpoint de Participación Académica (`/api/v1/participation`)
- [ ] Endpoint de AI Mentor (`/api/v1/ai/mentor/chat`) — conectar a modelo de IA

### Mediano plazo
- [ ] WebSockets para chat en tiempo real (reemplazar polling)
- [ ] Notificaciones push (PWA o FCM)
- [ ] Sistema de reviews y calificaciones de profesores
- [ ] Upload de imágenes (avatar, cursos) con S3/R2
- [ ] Pagos — integrar Stripe o MercadoPago para reservas pagas
- [ ] Certificados digitales de cursos completados

### Largo plazo
- [ ] App móvil (React Native o Flutter)
- [ ] Asociaciones con universidades y empresas para el marketplace de recompensas
- [ ] Modo Multi-tenant por institución educativa
- [ ] Analytics avanzado para instituciones (engagement, deserción, progreso)

---

## 10. GUÍA DE DESARROLLO LOCAL

### Frontend
```bash
cd Front_teduca
npm install
# Crear .env.local:
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
npm run dev
# → http://localhost:3000
```

### Backend
```bash
cd Backend_teduca
uv sync
# Crear .env con DATABASE_URL apuntando a Postgres local o Neon
cp .env.example .env
# Correr migraciones
uv run alembic upgrade head
# Iniciar servidor
uv run fastapi dev src/teduca/main.py
# → http://localhost:8000
# Docs: http://localhost:8000/docs
```

### Tests
```bash
cd Backend_teduca
uv run pytest           # 26 tests, sin necesidad de Postgres ni Redis
uv run pytest -v        # verbose
```

---

## 11. COMMITS PRINCIPALES

| Commit | Descripción |
|---|---|
| `969fb7f` | Corrección de flujo auth: links, redirect, logo |
| `10cd579` | Merge PR #1: marketplace edtech completo |
| `2282761` | Sistema de onboarding 3 pasos |
| `fa87d74` | Guard de onboarding en DashboardShell |
| `719dcb7` | Fix tests: tipo híbrido ARRAY/JSON, redis fake |
| `2f29158` | Evolución UX completa: dashboard, AI mentor, gamificación, logros, notificaciones |
| `289583e` | Fix bugs: hydration, recordDailyActivity, notificaciones localStorage |
| `8f47b03` | Sistema de recompensas: marketplace, historial, ranking, earn rules |
| `4232bf0` | Security: headers HTTP, rutas protegidas, cookie Secure, sanitización URLs |
| `b8fc871` | Rediseño visual completo: tipografía, layouts, componentes premium |

---

*Documentación generada el 3 de agosto de 2026.*
