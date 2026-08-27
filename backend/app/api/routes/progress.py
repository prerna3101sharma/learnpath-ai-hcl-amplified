from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.core.database import get_db
from app.models.progress import LearningProgress


router = APIRouter(
    prefix="/api/progress",
    tags=["Progress"]
)


class ProgressRequest(BaseModel):
    user_id: int
    course_id: int
    progress_percentage: float


@router.post("")
def update_progress(
    request: ProgressRequest,
    db: Session = Depends(get_db)
):
    progress = (
        db.query(LearningProgress)
        .filter(
            LearningProgress.user_id == request.user_id,
            LearningProgress.course_id == request.course_id
        )
        .first()
    )

    percentage = max(
        0,
        min(100, request.progress_percentage)
    )

    if progress is None:

        progress = LearningProgress(
            user_id=request.user_id,
            course_id=request.course_id,
            progress_percentage=percentage,
            status=(
                "Completed"
                if percentage >= 100
                else "In Progress"
            )
        )

        db.add(progress)

    else:

        progress.progress_percentage = percentage

        progress.status = (
            "Completed"
            if percentage >= 100
            else "In Progress"
        )

    db.commit()
    db.refresh(progress)

    return {
        "id": progress.id,
        "user_id": progress.user_id,
        "course_id": progress.course_id,
        "progress_percentage": progress.progress_percentage,
        "status": progress.status
    }


@router.get("/{user_id}")
def get_user_progress(
    user_id: int,
    db: Session = Depends(get_db)
):
    progress_records = (
        db.query(LearningProgress)
        .filter(
            LearningProgress.user_id == user_id
        )
        .all()
    )

    return [
        {
            "id": record.id,
            "user_id": record.user_id,
            "course_id": record.course_id,
            "progress_percentage":
                record.progress_percentage,
            "status":
                record.status
        }
        for record in progress_records
    ]