from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.course import Course


router = APIRouter(
    prefix="/api/courses",
    tags=["Courses"]
)


@router.get("/")
def get_courses(
    db: Session = Depends(get_db)
):
    courses = (
        db.query(Course)
        .order_by(Course.id)
        .all()
    )

    return courses