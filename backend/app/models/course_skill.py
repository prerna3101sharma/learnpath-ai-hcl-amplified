from sqlalchemy import (
    Column,
    Integer,
    ForeignKey
)

from app.core.database import Base


class CourseSkill(Base):
    __tablename__ = "course_skills"

    id = Column(
        Integer,
        primary_key=True
    )

    course_id = Column(
        Integer,
        ForeignKey("courses.id"),
        nullable=False
    )

    skill_id = Column(
        Integer,
        ForeignKey("skills.id"),
        nullable=False
    )

    importance = Column(
        Integer,
        default=3
    )