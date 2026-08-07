"""Seed de productos de merchandising TEDUCA."""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from teduca.modules.merch.models import MerchProduct

MERCH_PRODUCTS = [
    {
        "name": "Polo TEDUCA",
        "description": "Polo oficial TEDUCA de algodón premium. Diseño minimalista con logo bordado.",
        "price": None,
        "currency": "PEN",
        "image": "/merch/135957c8-5d37-4a12-b75c-73f744639601.jpeg",
        "images": [
            "/merch/135957c8-5d37-4a12-b75c-73f744639601.jpeg",
            "/merch/59cba76f-126b-4e80-bc8b-5f8afab796b3.jpeg",
        ],
        "category": "Ropa",
        "stock": 0,
        "active": True,
    },
    {
        "name": "Camiseta Engineering for Everyone",
        "description": "Camiseta TEDUCA edición especial 'Engineering for Everyone'. Frente y espalda.",
        "price": None,
        "currency": "PEN",
        "image": "/merch/877a476c-40ee-45c3-a610-95505ce23b40.jpeg",
        "images": ["/merch/877a476c-40ee-45c3-a610-95505ce23b40.jpeg"],
        "category": "Ropa",
        "stock": 0,
        "active": True,
    },
    {
        "name": "Gorra TEDUCA",
        "description": "Gorra azul navy con mascota TEDUCA bordada. Ajuste universal.",
        "price": None,
        "currency": "PEN",
        "image": "/merch/b17301ec-17a2-4900-bac8-5d4f2efe8367.jpeg",
        "images": ["/merch/b17301ec-17a2-4900-bac8-5d4f2efe8367.jpeg"],
        "category": "Accesorios",
        "stock": 0,
        "active": True,
    },
    {
        "name": "Crewneck TEDUCA",
        "description": "Crewneck gris suave y abrigador con logo TEDUCA al pecho.",
        "price": None,
        "currency": "PEN",
        "image": "/merch/d62a1b8d-05c1-471c-9e97-e69830286ee4.jpeg",
        "images": ["/merch/d62a1b8d-05c1-471c-9e97-e69830286ee4.jpeg"],
        "category": "Ropa",
        "stock": 0,
        "active": True,
    },
    {
        "name": "Botella Térmica TEDUCA",
        "description": "Botella térmica blanca de acero inoxidable con logo TEDUCA. 500ml.",
        "price": None,
        "currency": "PEN",
        "image": "/merch/d694d67f-a539-4bd4-bf44-21717f73eae7.jpeg",
        "images": ["/merch/d694d67f-a539-4bd4-bf44-21717f73eae7.jpeg"],
        "category": "Accesorios",
        "stock": 0,
        "active": True,
    },
    {
        "name": "Hoodie TEDUCA",
        "description": "Hoodie navy premium con mascota TEDUCA en la espalda. Edición limitada.",
        "price": None,
        "currency": "PEN",
        "image": "/merch/dc93f00e-f19b-4664-9924-e78c3c721bd8.jpeg",
        "images": ["/merch/dc93f00e-f19b-4664-9924-e78c3c721bd8.jpeg"],
        "category": "Ropa",
        "stock": 0,
        "active": True,
    },
]


async def seed_merch(session: AsyncSession) -> None:
    """Crea productos de merch si aún no existen."""
    for data in MERCH_PRODUCTS:
        existing = await session.scalar(
            select(MerchProduct).where(MerchProduct.name == data["name"])
        )
        if existing is not None:
            continue
        session.add(MerchProduct(**data))
    await session.commit()
