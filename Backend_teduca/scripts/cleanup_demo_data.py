"""Limpieza de datos demo/test en producción.

USO (desde Backend_teduca/):
    .venv/bin/python scripts/cleanup_demo_data.py --dry-run          # solo muestra
    .venv/bin/python scripts/cleanup_demo_data.py --buckets A,B      # ejecuta A y B
    .venv/bin/python scripts/cleanup_demo_data.py --buckets A,B,C    # incluye ambiguos

Borra usuarios por email EXACTO (nunca por patrón) para evitar accidentes.
Todas las FK a users/teacher_profiles son ON DELETE CASCADE, así que borrar el
usuario arrastra su perfil docente, cursos, favoritos, swipes, reservas, chats,
tokens, onboarding y asientos de Orbits. Corre dentro de UNA transacción.
"""
import argparse
import asyncio

import asyncpg

# ── Clasificación explícita (revisada manualmente contra la BD) ──────────────

# A · Profesores demo sembrados (auth_provider='seed', @teduca.dev) con ratings,
#     reseñas y nº de alumnos INVENTADOS. Datos falsos inequívocos.
BUCKET_A = [
    "valentina.rios@teduca.dev",
    "mateo.fernandez@teduca.dev",
    "camila.torres@teduca.dev",
    "diego.salazar@teduca.dev",
    "sofia.mendez@teduca.dev",
    "lucas.moreno@teduca.dev",
    "antonella.bruno@teduca.dev",
    "javier.ocampo@teduca.dev",
]

# B · Cuentas de prueba automatizadas (E2E / verificación de email).
BUCKET_B = [
    "e2e-prod-1785652799@teduca.dev",
    "verify_1785727194@test.com",
    "verify_1785727222@test.com",
    "verify_1785727290@test.com",
    "verify_1785727389@test.com",
    "verify@example.com",
    "test_verify_1785983708@teduca.com",
]

# C · Ambiguos: cuentas internas de prueba temprana. Requieren decisión explícita.
BUCKET_C = [
    "admin@teduca.com",   # rol solo 'student', email sin verificar, perfil docente vacío
    "profe@teduca.com",   # rol 'teacher', email sin verificar, cuenta de prueba
]

BUCKETS = {"A": BUCKET_A, "B": BUCKET_B, "C": BUCKET_C}


def db_url() -> str:
    for line in open("/home/osmar/Teduca/Backend_teduca/.env"):
        if line.startswith("DATABASE_URL="):
            return line.split("=", 1)[1].strip().replace("postgresql+asyncpg://", "postgresql://")
    raise SystemExit("No DATABASE_URL en .env")


async def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--buckets", default="", help="Coma-separado: A,B,C")
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    selected = [b.strip().upper() for b in args.buckets.split(",") if b.strip()]
    emails: list[str] = []
    for b in selected:
        if b not in BUCKETS:
            raise SystemExit(f"Bucket desconocido: {b}")
        emails += BUCKETS[b]

    if not emails and not args.dry_run:
        raise SystemExit("Nada seleccionado. Usa --buckets A,B[,C] o --dry-run.")

    conn = await asyncpg.connect(db_url())

    # Muestra a quién afecta.
    rows = await conn.fetch(
        "select email, auth_provider from users where email = any($1::text[]) order by email",
        emails or (BUCKET_A + BUCKET_B + BUCKET_C),
    )
    print(f"Usuarios objetivo ({len(rows)}):")
    for r in rows:
        print(f"  - {r['email']} ({r['auth_provider']})")

    if args.dry_run:
        print("\n[DRY-RUN] No se borró nada.")
        await conn.close()
        return

    async with conn.transaction():
        res = await conn.execute(
            "delete from users where email = any($1::text[])", emails
        )
        print(f"\nEjecutado: {res}")

    # Conteos post-limpieza.
    for t in ["users", "teacher_profiles", "marketplace_courses", "reservations",
              "favorites", "swipes", "chat_threads", "chat_messages"]:
        c = await conn.fetchval(f"select count(*) from {t}")
        print(f"  {t:22} {c}")
    await conn.close()


if __name__ == "__main__":
    asyncio.run(main())
