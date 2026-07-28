"""Utilidades de paginación estándar, compatibles con el frontend."""

from collections.abc import Sequence
from math import ceil
from typing import Annotated

from fastapi import Query
from pydantic import BaseModel


class PaginationParams(BaseModel):
    page: int = 1
    limit: int = 20

    @property
    def offset(self) -> int:
        return (self.page - 1) * self.limit


def pagination_params(
    page: Annotated[int, Query(ge=1)] = 1,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
) -> PaginationParams:
    return PaginationParams(page=page, limit=limit)


class PageMeta(BaseModel):
    total: int
    page: int
    limit: int
    pages: int


class Page[T](BaseModel):
    success: bool = True
    data: Sequence[T]
    pagination: PageMeta

    @classmethod
    def create(cls, items: Sequence[T], total: int, params: PaginationParams) -> "Page[T]":
        return cls(
            data=items,
            pagination=PageMeta(
                total=total,
                page=params.page,
                limit=params.limit,
                pages=ceil(total / params.limit) if params.limit else 0,
            ),
        )
