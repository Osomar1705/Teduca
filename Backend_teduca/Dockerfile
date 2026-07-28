# --- Base con uv ---
FROM python:3.13-slim AS base

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy \
    PATH="/app/.venv/bin:$PATH"

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

WORKDIR /app

# Instala dependencias primero (capa cacheable)
COPY pyproject.toml uv.lock* ./
RUN uv sync --frozen --no-install-project --no-dev 2>/dev/null || uv sync --no-install-project --no-dev

COPY . .
RUN uv sync --no-dev 2>/dev/null || uv sync

EXPOSE 8000

CMD ["uvicorn", "teduca.main:app", "--host", "0.0.0.0", "--port", "8000"]
