from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)

from sqlalchemy.orm import Session

from pydantic import BaseModel

from app.core.database import get_db

from app.models.progress import (
    LearningProgress
)


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
        db.query(
            LearningProgress
        )
        .filter(
            LearningProgress.user_id
            == request.user_id,

            LearningProgress.course_id
            == request.course_id
        )
        .first()
    )


    if not progress:

        progress = LearningProgress(

            user_id=request.user_id,

            course_id=request.course_id,

            progress_percentage=
                request.progress_percentage,

            status=(
                "Completed"
                if request.progress_percentage >= 100
                else "In Progress"
            )

        )

        db.add(progress)

    else:

        progress.progress_percentage = (
            request.progress_percentage
        )

        progress.status = (

            "Completed"

            if request.progress_percentage >= 100

            else "In Progress"

        )


    db.commit()

    db.refresh(progress)


    return {

        "message":
            "Progress updated",

        "course_id":
            progress.course_id,

        "progress_percentage":
            progress.progress_percentage,

        "status":
            progress.status

    }