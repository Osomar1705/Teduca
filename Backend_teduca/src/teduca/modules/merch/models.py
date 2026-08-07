"""Modelo MerchProduct — productos de merchandising TEDUCA."""

from sqlalchemy import JSON, Boolean, Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from teduca.core.database import Base, TimestampMixin, UUIDMixin


class MerchProduct(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "merch_products"

    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    price: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)
    currency: Mapped[str] = mapped_column(String(10), default="PEN", nullable=False)
    image: Mapped[str] = mapped_column(String(500), nullable=False)
    images: Mapped[list] = mapped_column(JSON, default=list, nullable=False)
    category: Mapped[str | None] = mapped_column(String(100), nullable=True)
    stock: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
