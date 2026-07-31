"""Cliente Redis compartido (cache, rate-limiting, blacklist de tokens)."""

from redis.asyncio import Redis, from_url

from teduca.core.config import settings

_redis: Redis | None = None


def redis_enabled() -> bool:
    """Redis es opcional: en serverless (Vercel) puede no haber instancia."""
    return bool(settings.redis_url)


def get_redis() -> Redis | None:
    """Devuelve el cliente Redis singleton (lazy), o None si no está configurado."""
    global _redis
    if not redis_enabled():
        return None
    if _redis is None:
        _redis = from_url(settings.redis_url, encoding="utf-8", decode_responses=True)
    return _redis


async def close_redis() -> None:
    global _redis
    if _redis is not None:
        await _redis.aclose()
        _redis = None
