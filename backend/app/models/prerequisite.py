from sqlalchemy import (
    Column,
    Integer,
    ForeignKey
)

from app.core.database import Base


class CoursePrerequisite(Base):
    __tablename__ = "course_prerequisites"

    id = Column(
        Integer,
        primary_key=True
    )

    course_id = Column(
        Integer,
        ForeignKey("courses.id"),
        nullable=False
    )

    prerequisite_course_id = Column(
        Integer,
        ForeignKey("courses.id"),
        nullable=False
    )