"""Utilidades de texto compartidas."""

import re
import unicodedata
import uuid


def slugify(value: str) -> str:
    value = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode()
    value = re.sub(r"[^\w\s-]", "", value.lower()).strip()
    return re.sub(r"[-\s]+", "-", value) or "item"


def unique_slug(value: str) -> str:
    """Slug + sufijo corto aleatorio para garantizar unicidad sin consultar la DB."""
    return f"{slugify(value)}-{uuid.uuid4().hex[:6]}"
