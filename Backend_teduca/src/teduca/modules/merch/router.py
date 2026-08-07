"""Router del módulo merch — endpoints públicos."""

import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from teduca.core.database import get_db
from teduca.modules.merch.models import MerchProduct
from teduca.modules.merch.schemas import MerchProductRead

router = APIRouter(prefix="/merch", tags=["merch"])


@router.get("", response_model=list[MerchProductRead])
async def list_merch(session: AsyncSession = Depends(get_db)):
    """Lista todos los productos de merch activos."""
    result = await session.execute(
        select(MerchProduct).where(MerchProduct.active == True).order_by(MerchProduct.created_at)
    )
    return result.scalars().all()


@router.get("/{product_id}", response_model=MerchProductRead)
async def get_merch(product_id: uuid.UUID, session: AsyncSession = Depends(get_db)):
    """Retorna un producto de merch por ID."""
    product = await session.get(MerchProduct, product_id)
    if not product or not product.active:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado")
    return product
