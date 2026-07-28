"""Cliente Redis compartido (cache, rate-limiting, blacklist de tokens)."""

from redis.asyncio import Redis, from_url

from teduca.core.config import settings

_redis: Redis | None = None


def get_redis() -> Redis:
    """Devuelve el cliente Redis singleton (lazy)."""
    global _redis
    if _redis is None:
        _redis = from_url(settings.redis_url, encoding="utf-8", decode_responses=True)
    return _redis


async def close_redis() -> None:
    global _redis
    if _redis is not None:
        await _redis.aclose()
        _redis = None
