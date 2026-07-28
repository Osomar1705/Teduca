# TEDUCA - Setup Guide para Fase 2

## Autenticación con Better Auth + Neon

Este documento describe cómo completar el setup de Better Auth y la base de datos Neon.

### Paso 1: Configurar variables de entorno

1. Copia `.env.local.example` a `.env.local`:
```bash
cp .env.local.example .env.local
```

2. Genera una `BETTER_AUTH_SECRET` segura:
```bash
openssl rand -base64 32
```

3. Actualiza `.env.local` con:
   - `DATABASE_URL`: Url de conexión a Neon (del dashboard de Neon)
   - `BETTER_AUTH_SECRET`: El valor generado en el paso 2
   - `BETTER_AUTH_URL`: Mantén como http://localhost:3000 en desarrollo

### Paso 2: Crear las tablas en Neon

1. Ve al dashboard de Neon
2. Abre la consola SQL para tu base de datos
3. Copia y ejecuta el contenido de `scripts/setup-db.sql`

Esto creará todas las tablas necesarias para:
- Better Auth (user, session, account, verification)
- TEDUCA (course, enrollment, lesson, assignment, submission, userRole)

### Paso 3: Instalar dependencias

```bash
pnpm install
```

### Paso 4: Iniciar el servidor

```bash
pnpm dev
```

El servidor estará disponible en http://localhost:3000

### Paso 5: Probar autenticación

1. Ve a http://localhost:3000/register
2. Crea una nueva cuenta con email y password
3. Serás redirigido al dashboard después de registrarte
4. Ve a http://localhost:3000/login para probar login

## Estructura de autenticación

- **lib/auth.ts**: Configuración de Better Auth (server-side)
- **lib/auth-client.ts**: Cliente de autenticación (client-side)
- **app/api/auth/[...all]/route.ts**: Endpoint de Better Auth
- **components/auth/AuthForm.tsx**: Componente compartido de login/register
- **middleware.ts**: Protección de rutas autenticadas

## Archivos importantes

- **lib/db/index.ts**: Drizzle client y pool de Neon
- **lib/db/schema.ts**: Definición de tablas
- **app/(auth)**: Routes de autenticación
- **app/(authenticated)**: Routes protegidas

## Próximos pasos

Después de que el setup esté completo:

1. Crear server actions para operaciones de base de datos
2. Implementar dashboards para estudiantes y docentes
3. Crear funcionalidad de cursos
4. Implementar sistema de tareas y calificaciones

## Troubleshooting

### Error: "BETTER_AUTH_SECRET is not set"
- Asegúrate que `BETTER_AUTH_SECRET` está en `.env.local`
- Reinicia el servidor `pnpm dev`

### Error: "Database connection failed"
- Verifica que `DATABASE_URL` es correcta
- Comprueba la conexión a Neon en el dashboard
- Asegúrate que las tablas fueron creadas con `setup-db.sql`

### Error: "Cannot find module @/lib/auth"
- Espera a que la compilación se complete
- Reinicia el servidor si necesario
