"""Sembrado idempotente del marketplace (profesores demo + sus cursos).

Portado desde el mock del frontend para que 'descubrir', 'cursos' y 'favoritos'
tengan datos reales desde el arranque. Cada profesor es un User (rol teacher,
sin contraseña local) con su TeacherProfile y cursos ofertados.
"""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from teduca.modules.edtech.models import MarketplaceCourse, TeacherProfile
from teduca.modules.users.models import Role, User


def _avatar(n: int) -> str:
    # Avatares placeholder externos eliminados — se usa null para no mostrar URLs inválidas en producción
    return None  # type: ignore[return-value]


def _cover(seed: str) -> str:
    return f"https://picsum.photos/seed/teduca-{seed}/800/500"


# Cada entrada: (email, datos del perfil, cursos ofertados).
TEACHERS: list[dict] = [
    {
        "email": "valentina.rios@teduca.dev",
        "name": "Valentina Ríos",
        "avatar": _avatar(5),
        "specialty": "Matemática · Cálculo y Álgebra",
        "bio": "Apasionada por hacer que las matemáticas se sientan simples e "
        "intuitivas. Enseño con ejemplos del mundo real y mucha práctica guiada.",
        "experience_years": 8,
        "university": "Universidad de Buenos Aires",
        "modality": "both",
        "hourly_price": 25,
        "location": "Buenos Aires, AR",
        "languages": ["Español", "Inglés"],
        "availability": [
            {"day": "Lun", "slots": ["09:00 - 12:00", "18:00 - 21:00"]},
            {"day": "Mié", "slots": ["15:00 - 19:00"]},
            {"day": "Vie", "slots": ["09:00 - 13:00"]},
        ],
        "categories": ["Matemática", "Ciencias"],
        "socials": [
            {"type": "linkedin", "url": "https://linkedin.com"},
            {"type": "website", "url": "https://teduca.dev"},
        ],
        "rating": 4.9,
        "reviews_count": 214,
        "students_count": 1280,
        "courses": [
            {"title": "Cálculo I desde cero", "image": _cover("calculo"), "category": "Matemática",
             "description": "Límites, derivadas e integrales con enfoque práctico y visual.",
             "level": "beginner", "duration_hours": 24, "price": 89, "rating": 4.9,
             "reviews_count": 132},
            {"title": "Álgebra Lineal Aplicada", "image": _cover("algebra"),
             "category": "Matemática",
             "description": "Vectores, matrices y transformaciones para ciencia de datos e "
             "ingeniería.", "level": "intermediate", "duration_hours": 20, "price": 99,
             "rating": 4.8, "reviews_count": 74},
        ],
    },
    {
        "email": "mateo.fernandez@teduca.dev",
        "name": "Mateo Fernández",
        "avatar": _avatar(13),
        "specialty": "Programación · Full-Stack Web",
        "bio": "Ingeniero de software y mentor. Te acompaño desde tu primer 'Hello World' "
        "hasta desplegar tu propia app en producción.",
        "experience_years": 10,
        "university": "Universidad Politécnica de Madrid",
        "modality": "virtual",
        "hourly_price": 40,
        "location": "Remoto",
        "languages": ["Español", "Inglés", "Portugués"],
        "availability": [
            {"day": "Mar", "slots": ["10:00 - 14:00"]},
            {"day": "Jue", "slots": ["16:00 - 20:00"]},
            {"day": "Sáb", "slots": ["09:00 - 12:00"]},
        ],
        "categories": ["Programación", "Tecnología"],
        "socials": [
            {"type": "website", "url": "https://teduca.dev"},
            {"type": "twitter", "url": "https://twitter.com"},
        ],
        "rating": 4.8,
        "reviews_count": 341,
        "students_count": 2140,
        "courses": [
            {"title": "Full-Stack Web con React & Node", "image": _cover("fullstack"),
             "category": "Programación",
             "description": "Construí y desplegá una app completa: frontend, API y base de "
             "datos.", "level": "intermediate", "duration_hours": 48, "price": 199,
             "rating": 4.9, "reviews_count": 256},
            {"title": "TypeScript Profesional", "image": _cover("typescript"),
             "category": "Programación",
             "description": "Tipado avanzado, patrones y arquitectura para proyectos "
             "escalables.", "level": "advanced", "duration_hours": 16, "price": 129,
             "rating": 4.85, "reviews_count": 98},
        ],
    },
    {
        "email": "camila.torres@teduca.dev",
        "name": "Camila Torres",
        "avatar": _avatar(20),
        "specialty": "Inglés · Business & Conversation",
        "bio": "Certificada CELTA. Clases dinámicas centradas en que hables desde el día "
        "uno, con foco en fluidez y confianza.",
        "experience_years": 6,
        "university": "University of Cambridge",
        "modality": "virtual",
        "hourly_price": 22,
        "location": "Córdoba, AR",
        "languages": ["Inglés", "Español"],
        "availability": [
            {"day": "Lun", "slots": ["08:00 - 11:00"]},
            {"day": "Mié", "slots": ["18:00 - 22:00"]},
            {"day": "Vie", "slots": ["14:00 - 18:00"]},
        ],
        "categories": ["Idiomas"],
        "socials": [{"type": "instagram", "url": "https://instagram.com"}],
        "rating": 4.95,
        "reviews_count": 189,
        "students_count": 980,
        "courses": [
            {"title": "Inglés para Negocios", "image": _cover("english"), "category": "Idiomas",
             "description": "Reuniones, emails y presentaciones con confianza. Nivel B1 a C1.",
             "level": "intermediate", "duration_hours": 30, "price": 149, "rating": 4.95,
             "reviews_count": 187},
        ],
    },
    {
        "email": "diego.salazar@teduca.dev",
        "name": "Diego Salazar",
        "avatar": _avatar(33),
        "specialty": "Física · Mecánica y Electromagnetismo",
        "bio": "Doctor en Física. Convierto conceptos abstractos en algo que podés ver y "
        "tocar. Ideal para universitarios y preparación de exámenes.",
        "experience_years": 12,
        "university": "Universidad de Chile",
        "modality": "both",
        "hourly_price": 30,
        "location": "Santiago, CL",
        "languages": ["Español"],
        "availability": [
            {"day": "Mar", "slots": ["09:00 - 12:00"]},
            {"day": "Jue", "slots": ["15:00 - 18:00"]},
        ],
        "categories": ["Física", "Ciencias"],
        "socials": [],
        "rating": 4.7,
        "reviews_count": 156,
        "students_count": 640,
        "courses": [
            {"title": "Física Universitaria", "image": _cover("fisica"), "category": "Física",
             "description": "Mecánica y electromagnetismo con resolución guiada de problemas.",
             "level": "advanced", "duration_hours": 36, "price": 159, "rating": 4.7,
             "reviews_count": 89},
        ],
    },
    {
        "email": "sofia.mendez@teduca.dev",
        "name": "Sofía Méndez",
        "avatar": _avatar(45),
        "specialty": "Diseño UX/UI · Product Design",
        "bio": "Product Designer en tech. Te enseño a pensar en el usuario, prototipar en "
        "Figma y armar un portfolio que consiga entrevistas.",
        "experience_years": 7,
        "university": "Universidad de Palermo",
        "modality": "virtual",
        "hourly_price": 35,
        "location": "Buenos Aires, AR",
        "languages": ["Español", "Inglés"],
        "availability": [
            {"day": "Lun", "slots": ["16:00 - 20:00"]},
            {"day": "Sáb", "slots": ["10:00 - 14:00"]},
        ],
        "categories": ["Diseño", "Tecnología"],
        "socials": [{"type": "linkedin", "url": "https://linkedin.com"}],
        "rating": 4.85,
        "reviews_count": 203,
        "students_count": 1120,
        "courses": [
            {"title": "Diseño UX/UI de Producto", "image": _cover("uxui"), "category": "Diseño",
             "description": "De la investigación al prototipo en Figma. Armá un portfolio "
             "real.", "level": "beginner", "duration_hours": 28, "price": 179, "rating": 4.9,
             "reviews_count": 143},
        ],
    },
    {
        "email": "lucas.moreno@teduca.dev",
        "name": "Lucas Moreno",
        "avatar": _avatar(51),
        "specialty": "Química · Orgánica e Inorgánica",
        "bio": "Profe de química con paciencia infinita. Explico paso a paso hasta que el "
        "'click' llega. Preparación de ingresos y secundaria.",
        "experience_years": 9,
        "university": "Universidad Nacional de La Plata",
        "modality": "in-person",
        "hourly_price": 20,
        "location": "La Plata, AR",
        "languages": ["Español"],
        "availability": [
            {"day": "Mié", "slots": ["09:00 - 13:00"]},
            {"day": "Vie", "slots": ["15:00 - 19:00"]},
        ],
        "categories": ["Química", "Ciencias"],
        "socials": [],
        "rating": 4.6,
        "reviews_count": 98,
        "students_count": 410,
        "courses": [
            {"title": "Química Orgánica", "image": _cover("quimica"), "category": "Química",
             "description": "Grupos funcionales, reacciones y mecanismos explicados con "
             "claridad.", "level": "intermediate", "duration_hours": 22, "price": 79,
             "rating": 4.6, "reviews_count": 61},
        ],
    },
    {
        "email": "antonella.bruno@teduca.dev",
        "name": "Antonella Bruno",
        "avatar": _avatar(24),
        "specialty": "Data Science · Python & ML",
        "bio": "Data Scientist. De pandas a modelos de machine learning con proyectos "
        "reales. Ideal si querés dar el salto a datos.",
        "experience_years": 6,
        "university": "Universidad Torcuato Di Tella",
        "modality": "virtual",
        "hourly_price": 45,
        "location": "Remoto",
        "languages": ["Español", "Inglés"],
        "availability": [
            {"day": "Mar", "slots": ["18:00 - 21:00"]},
            {"day": "Jue", "slots": ["18:00 - 21:00"]},
        ],
        "categories": ["Programación", "Datos"],
        "socials": [{"type": "linkedin", "url": "https://linkedin.com"}],
        "rating": 4.9,
        "reviews_count": 167,
        "students_count": 890,
        "courses": [
            {"title": "Data Science con Python", "image": _cover("data"), "category": "Datos",
             "description": "Pandas, visualización y tu primer modelo de machine learning.",
             "level": "intermediate", "duration_hours": 40, "price": 219, "rating": 4.9,
             "reviews_count": 174},
        ],
    },
    {
        "email": "javier.ocampo@teduca.dev",
        "name": "Javier Ocampo",
        "avatar": _avatar(60),
        "specialty": "Historia · Contemporánea y del Arte",
        "bio": "Historiador y narrador. Convierto fechas y nombres en relatos que se "
        "recuerdan. Secundaria, universidad y curiosos.",
        "experience_years": 11,
        "university": "Universidad de Salamanca",
        "modality": "both",
        "hourly_price": 18,
        "location": "Salamanca, ES",
        "languages": ["Español", "Inglés", "Italiano"],
        "availability": [
            {"day": "Lun", "slots": ["14:00 - 18:00"]},
            {"day": "Mié", "slots": ["14:00 - 18:00"]},
        ],
        "categories": ["Historia", "Humanidades"],
        "socials": [],
        "rating": 4.75,
        "reviews_count": 122,
        "students_count": 530,
        "courses": [
            {"title": "Historia del Arte", "image": _cover("arte"), "category": "Historia",
             "description": "Del Renacimiento al arte contemporáneo en relatos memorables.",
             "level": "beginner", "duration_hours": 18, "price": 69, "rating": 4.8,
             "reviews_count": 52},
        ],
    },
]


async def seed_marketplace(session: AsyncSession) -> None:
    """Crea profesores demo con su perfil y cursos si aún no existen."""
    teacher_role = await session.scalar(select(Role).where(Role.name == "teacher"))
    if teacher_role is None:
        teacher_role = Role(name="teacher", description="Profesor")
        session.add(teacher_role)
        await session.flush()

    for entry in TEACHERS:
        existing = await session.scalar(select(User).where(User.email == entry["email"]))
        if existing is not None:
            continue

        user = User(
            email=entry["email"],
            name=entry["name"],
            password_hash=None,
            auth_provider="seed",
            avatar=entry["avatar"],
            email_verified=True,
            roles=[teacher_role],
        )
        session.add(user)
        await session.flush()

        profile = TeacherProfile(
            user_id=user.id,
            specialty=entry["specialty"],
            bio=entry["bio"],
            experience_years=entry["experience_years"],
            university=entry["university"],
            modality=entry["modality"],
            hourly_price=entry["hourly_price"],
            location=entry["location"],
            languages=entry["languages"],
            availability=entry["availability"],
            categories=entry["categories"],
            socials=entry["socials"],
            is_published=True,
            rating=entry["rating"],
            reviews_count=entry["reviews_count"],
            students_count=entry["students_count"],
        )
        session.add(profile)
        await session.flush()

        for c in entry["courses"]:
            session.add(MarketplaceCourse(teacher_profile_id=profile.id, **c))

    await session.commit()


if __name__ == "__main__":
    """Solo para desarrollo local: python -m teduca.modules.edtech.seed"""
    import asyncio
    from teduca.core.database import AsyncSessionLocal

    async def _run() -> None:
        async with AsyncSessionLocal() as session:
            await seed_marketplace(session)
        print("Demo marketplace sembrado.")

    asyncio.run(_run())
