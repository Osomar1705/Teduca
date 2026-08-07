"""Schemas del módulo participation."""

from pydantic import BaseModel


class ParticipationStats(BaseModel):
    coursesEnrolled: int
    hoursLearned: int
    assignmentsCompleted: int
    helpGiven: int
    commentsPosted: int
    certificatesEarned: int
    ranking: int | None
