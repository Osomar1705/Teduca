"""Schemas Pydantic para el módulo merch."""

import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel


class MerchProductRead(BaseModel):
    id: uuid.UUID
    name: str
    description: str | None
    price: Decimal | None
    currency: str
    image: str
    images: list[str]
    category: str | None
    stock: int
    active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class MerchProductCreate(BaseModel):
    name: str
    description: str | None = None
    price: Decimal | None = None
    currency: str = "PEN"
    image: str
    images: list[str] = []
    category: str | None = None
    stock: int = 0
    active: bool = True
