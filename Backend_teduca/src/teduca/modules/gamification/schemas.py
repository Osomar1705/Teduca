"""Schemas del módulo gamification."""

import uuid
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict


class GamificationSummary(BaseModel):
    total_points: int
    current_streak: int
    longest_streak: int
    last_active_date: date | None = None


class RewardRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    code: str
    name: str
    description: str | None = None
    cost_points: int


class UserRewardRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    reward_id: uuid.UUID
    redeemed_at: datetime | None = None


class PointsLedgerRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    points: int
    reason: str
    event_name: str | None = None
    created_at: datetime


class AwardPointsRequest(BaseModel):
    user_id: uuid.UUID
    event: str
    points: int
    reason: str


class RankingEntry(BaseModel):
    position: int
    user_id: uuid.UUID
    name: str
    avatar_url: str | None = None
    total_points: int
    current_streak: int


class RankingResponse(BaseModel):
    entries: list[RankingEntry]
    current_user_position: int | None = None
