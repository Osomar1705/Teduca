# Arquitectura Visual de TEDUCA

## Flujo de Usuarios

```
┌─────────────────────────────────────────────────────────────┐
│                      LANDING PAGE (/)                        │
│               Hero + Features + CTA Buttons                  │
└──────┬──────────────────────────────────────────────────────┘
       │
       ├─→ [Registrarse] ──→ /register
       │                         │
       │                         ├─→ CreateUserForm (Zod validated)
       │                         ├─→ Better Auth signUp
       │                         └─→ Redirect to /dashboard
       │
       └─→ [Ingresar] ──→ /login
                             │
                             ├─→ LoginForm (Zod validated)
                             ├─→ Better Auth signIn
                             └─→ Redirect to /dashboard

┌─────────────────────────────────────────────────────────────┐
│                  AUTHENTICATED ROUTES                        │
│              (Protected by middleware.ts)                    │
└─────────────────────────────────────────────────────────────┘

DASHBOARD (/dashboard)
├─ Si rol = STUDENT
│  └─ StudentDashboard
│     ├─ Stats: cursos inscritos, tareas, promedio, progreso
│     ├─ Mis cursos activos (CourseCard list)
│     └─ Quick actions: Buscar, perfil, settings
│
└─ Si rol = TEACHER
   └─ TeacherDashboard
      ├─ Stats: cursos, estudiantes, a calificar, finalización
      ├─ Mis cursos (CourseCard list con editar)
      └─ Quick actions: Crear, gestionar, perfil

COURSES (/courses)
├─ SearchBar + Filters
├─ Grid de CourseCards
│  ├─ title, description, image
│  ├─ instructor, students count, rating
│  ├─ level badge, category
│  └─ CTA button (View/Enroll/Manage)
└─ Si no hay cursos: EmptyState

COURSE DETAIL (/courses/[id])
├─ Hero image
├─ Title, instructor, rating
├─ Tabs:
│  ├─ Overview (descripción)
│  ├─ Lessons (LessonSidebar)
│  │  └─ Lesson 1, 2, 3... (clickables)
│  ├─ Assignments (AssignmentCard list)
│  └─ Reviews (comments)
└─ Sidebar:
   ├─ Stats (students, lessons, duration)
   ├─ Si es STUDENT: [Inscribirse] → Enrollment API
   └─ Si es TEACHER: [Editar] → /courses/[id]/edit

CREATE COURSE (/courses/create) [TEACHERS ONLY]
├─ CreateCourseForm
│  ├─ Title (required)
│  ├─ Description (required)
│  ├─ Category select
│  ├─ Level select
│  └─ [Submit] → POST /api/courses
└─ Redirect to /courses/[newId]

ASSIGNMENTS (/assignments)
├─ Filter tabs: All, Pending, Submitted, Graded
├─ AssignmentCard list:
│  ├─ Title, description, dueDate
│  ├─ Status badge (Pending/Submitted/Graded)
│  └─ CTA button:
│     ├─ Si pending: [Submit]
│     ├─ Si submitted: [View Submission]
│     └─ Si graded: [View Grade]
└─ Si no hay: EmptyState

ASSIGNMENT SUBMIT (modal/page)
├─ SubmitAssignmentForm
│  ├─ File upload (optional)
│  ├─ Text content textarea (optional)
│  └─ [Submit] → POST /api/assignments/submit
└─ Success message + GradeCard

PROFILE (/profile)
├─ Profile avatar + user info
├─ Email, name, joinDate
├─ Role badge
└─ [Edit Profile] button

SETTINGS (/settings)
├─ Notifications (Card + [Configure])
├─ Privacy & Security (Card + [Configure])
├─ Appearance (Card + [Configure])
└─ Danger Zone:
   └─ [Sign Out] → authClient.signOut()
      └─ Redirect to /
```

## Component Tree

```
RootLayout
├─ ThemeProvider (next-themes)
├─ QueryProvider (TanStack Query)
├─ Navbar
│  ├─ Logo
│  ├─ Navigation menu
│  ├─ ThemeToggle
│  └─ UserMenu
│
└─ AuthLayout (/auth routes)
   ├─ AuthForm
   │  ├─ Email input + validation (Zod)
   │  ├─ Password input + validation
   │  └─ Submit button
   │
   └─ AuthenticatedLayout (/authenticated routes)
      ├─ Navbar (sticky)
      ├─ Sidebar (mobile collapse)
      │  ├─ Logo
      │  ├─ Nav items
      │  └─ User menu
      │
      └─ Main content area
         ├─ Page component
         │  ├─ Header
         │  ├─ Content
         │  └─ Components:
         │     ├─ StatsCard (dashboard)
         │     ├─ CourseCard (courses)
         │     ├─ GradeCard (grades)
         │     └─ Forms (CreateCourse, SubmitAssignment)
         │
         └─ Footer (if needed)
```

## Data Flow

```
USER ACTION (e.g., "Submit assignment")
    ↓
CLIENT COMPONENT (SubmitAssignmentForm)
    ├─ useState + useForm (React Hook Form)
    ├─ Form validation (Zod schema)
    │  ├─ Optional file
    │  └─ Optional text
    ├─ On submit: fetch to API
    │
    ↓ (POST /api/assignments/submit)
    │
SERVER ACTION / ROUTE HANDLER
    ├─ Extract body
    ├─ Validate input (Zod)
    ├─ Get userId from session
    │  └─ auth.api.getSession({ headers })
    ├─ Scope query by userId
    │  └─ where(and(eq(assignment.id, id), eq(assignment.userId, userId)))
    ├─ Insert submission to DB
    │  └─ db.insert(submission).values(...)
    ├─ Revalidate cache
    │  └─ revalidatePath('/assignments')
    └─ Return success/error
    
    ↓
CLIENT (callback)
    ├─ Handle response
    ├─ Show success/error toast
    ├─ Redirect or refresh
    └─ Update local state (SWR/TQ)
```

## Authentication Flow

```
┌─────────────────────────────────────────────────────────┐
│                    USER NOT AUTHENTICATED               │
│              (redirected to /login or /register)         │
└─────────────────────────────────────────────────────────┘

REGISTER (/register)
    ↓
AuthForm (mode="sign-up")
    ├─ Email input + validation
    ├─ Password input + validation
    ├─ Name input + validation
    └─ [Sign Up] button
        ↓
    authClient.signUp.email({
      email,
      password,
      name
    })
        ↓
    Better Auth HTTP handler (/api/auth/sign-up)
        ├─ Hash password
        ├─ Create user in DB
        ├─ Create session
        ├─ Set secure HTTP-only cookie
        └─ Return session + user
        ↓
    Client receives session
        ├─ Store session in cookie (automatic)
        ├─ Redirect to /dashboard
        ├─ router.refresh() to sync
        └─ Middleware allows access

┌─────────────────────────────────────────────────────────┐
│                    USER AUTHENTICATED                   │
│              (can access protected routes)              │
└─────────────────────────────────────────────────────────┘

LOGIN (/login)
    ↓
AuthForm (mode="sign-in")
    ├─ Email input + validation
    ├─ Password input + validation
    └─ [Sign In] button
        ↓
    authClient.signIn.email({
      email,
      password
    })
        ↓
    Better Auth HTTP handler (/api/auth/sign-in)
        ├─ Verify email exists
        ├─ Verify password correct
        ├─ Create session
        ├─ Set secure HTTP-only cookie
        └─ Return session + user
        ↓
    Client receives session
        ├─ Store session in cookie (automatic)
        ├─ Redirect to /dashboard
        └─ Can access protected routes

LOGGED IN (/dashboard, /courses, /assignments, etc)
    ├─ Middleware checks session
    │  ├─ Valid session → Allow
    │  └─ No session → Redirect to /login
    │
    ├─ Server Components can call:
    │  └─ auth.api.getSession({ headers })
    │
    ├─ Client Components can use:
    │  └─ const { data: session } = authClient.useSession()
    │
    └─ Server Actions check auth:
       └─ const userId = await getUserId()

LOGOUT (/settings)
    ↓
[Sign Out] button click
    ↓
authClient.signOut()
    ↓
Better Auth HTTP handler (/api/auth/sign-out)
    ├─ Invalidate session
    ├─ Delete session cookie
    └─ Return success
    ↓
Client
    ├─ Redirect to /
    ├─ router.refresh() to clear cache
    └─ Cannot access protected routes
```

## Database Relations

```
┌──────────┐
│  user    │ (from Better Auth)
├──────────┤
│ id (PK)  │
│ email    │
│ name     │
│ image    │
│ created  │
└────┬─────┘
     │
     ├──→ ┌─────────┐
     │    │ session │ (1:many)
     │    └─────────┘
     │
     ├──→ ┌─────────┐
     │    │ account │ (1:many)
     │    └─────────┘
     │
     ├──→ ┌──────────────┐
     │    │ userRole     │ (1:1)
     │    └──────────────┘
     │
     ├──→ ┌─────────┐
     │    │  course │ (1:many, as teacher)
     │    └────┬────┘
     │         │
     │         ├──→ ┌──────────┐
     │         │    │ lesson   │ (1:many)
     │         │    └──────────┘
     │         │
     │         ├──→ ┌────────────┐
     │         │    │ assignment │ (1:many)
     │         │    └────┬───────┘
     │         │         │
     │         │         └──→ ┌────────────┐
     │         │              │ submission │
     │         │              └────────────┘
     │         │
     │         └──→ ┌────────────┐
     │              │ enrollment │
     │              └────────────┘
     │
     └──→ ┌──────────────┐
          │ enrollment   │ (1:many, as student)
          └──────────────┘
```

## Technology Stack Diagram

```
┌──────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                         │
│  React 19 + TypeScript + Tailwind CSS v4 + Framer Motion │
├──────────────────────────────────────────────────────────┤
│ Components: shadcn/ui + Lucide Icons                     │
│ State: Zustand (UI) + TanStack Query (Server)            │
│ Forms: React Hook Form + Zod validation                  │
│ Auth: Better Auth client (authClient)                    │
└───────────────────┬────────────────────────────────────┬─┘
                    │                                    │
         NEXT.JS APP ROUTER                 MIDDLEWARE.TS
                    │                                    │
          ┌─────────┴────────────┐                       │
          │                      │                       │
    SERVER COMPONENTS      CLIENT COMPONENTS       ROUTE PROTECTION
    ├─ RSC layouts         ├─ useAuth()           ├─ Check session
    ├─ DB queries (RSC)    ├─ useQuery()          └─ Redirect
    ├─ Direct DB access    └─ useState/useForm
    └─ getSession()
    
┌──────────────────────────────────────────────────────────┐
│                    SERVER LAYER                          │
│              Next.js Route Handlers & API                │
├──────────────────────────────────────────────────────────┤
│ Better Auth HTTP Handlers (/api/auth/...)               │
│ Custom API Routes (POST /api/courses, etc)              │
│ Server Actions (for mutations)                          │
│ Route handlers with auth checking                       │
└───────────────────┬────────────────────────────────────┬─┘
                    │                                    │
         BETTER AUTH                              DRIZZLE ORM
         (Sessions)                               (Queries)
                    │                                    │
                    └───────────────┬────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
                ┌─────────────────────────────────┐ │
                │   NEON POSTGRESQL DATABASE      │ │
                ├─────────────────────────────────┤ │
                │ Better Auth Tables:             │ │
                │ • user, session, account        │ │
                │ • verification                  │ │
                │                                 │ │
                │ TEDUCA Tables:                  │ │
                │ • course, enrollment            │ │
                │ • lesson, assignment, submission│
                │ • userRole                      │
                └─────────────────────────────────┘
                    
                    ↓

            ┌──────────────────┐
            │    VERCEL IDE    │
            ├──────────────────┤
            │ • Auto-deploy    │
            │ • Edge functions │
            │ • Analytics      │
            │ • Image opt      │
            └──────────────────┘
```

---

## Componentes Principales

### 1. StatsCard
```
Propósito: Mostrar estadísticas con ícono y tendencia
Props: title, value, icon, trend, description
Uso: Dashboards (4 stats en grid)
```

### 2. CourseCard
```
Propósito: Card reutilizable para cursos
Props: id, title, image, instructor, students, rating, level
Uso: Listado de cursos (grid responsive)
```

### 3. GradeCard
```
Propósito: Mostrar calificaciones y feedback
Props: title, score, maxScore, feedback, dates
Uso: Vista de calificaciones
```

### 4. Forms
```
- CreateCourseForm: Crear nuevo curso (docentes)
- SubmitAssignmentForm: Enviar tarea (estudiantes)
- AuthForm: Login/Register (public)
```

---

## URLs Completas Mapeo

```
Path                          Component                Role    Auth
────────────────────────────────────────────────────────────────────
/                             Landing                  Public  No
/login                        LoginPage                Public  No
/register                     RegisterPage             Public  No
/dashboard                    DashboardPage            All     Yes
/courses                       CoursesPage              All     Yes
/courses/create               CreateCoursePage         Teacher Yes
/courses/[id]                 CourseDetailPage         All     Yes
/assignments                  AssignmentsPage          All     Yes
/profile                      ProfilePage              All     Yes
/settings                     SettingsPage             All     Yes
/api/auth/[...all]            Better Auth Handler      Public  Dynamic
```

---

## Notas de Implementación

- **TypeScript Strict**: Todos los componentes typed
- **Error Boundaries**: Envueltos en try/catch
- **Loading States**: Spinners durante async operations
- **Toast Notifications**: (Ready para Sonner/Toaster)
- **Responsive**: Mobile-first with Tailwind
- **Accessible**: ARIA labels, semantic HTML
- **Performance**: RSC when possible, SSR forms
