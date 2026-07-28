"""Repositorio de entregas."""

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from teduca.modules.submissions.models import Submission


class SubmissionRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_by_id(self, submission_id: uuid.UUID) -> Submission | None:
        return await self.session.get(Submission, submission_id)

    async def get(self, assignment_id: uuid.UUID, student_id: uuid.UUID) -> Submission | None:
        result = await self.session.execute(
            select(Submission).where(
                Submission.assignment_id == assignment_id,
                Submission.student_id == student_id,
            )
        )
        return result.scalar_one_or_none()

    async def list_by_assignment(self, assignment_id: uuid.UUID) -> list[Submission]:
        result = await self.session.execute(
            select(Submission)
            .where(Submission.assignment_id == assignment_id)
            .order_by(Submission.submitted_at.desc())
        )
        return list(result.scalars())

    async def add(self, submission: Submission) -> Submission:
        self.session.add(submission)
        await self.session.flush()
        return submission
