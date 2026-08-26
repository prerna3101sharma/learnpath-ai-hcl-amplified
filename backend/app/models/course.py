from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Float
)

from app.core.database import Base


class Course(Base):
    __tablename__ = "courses"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    title = Column(
        String(200),
        nullable=False
    )

    description = Column(
        Text,
        nullable=False
    )

    difficulty = Column(
        String(50),
        nullable=False
    )

    duration_hours = Column(
        Float,
        nullable=False
    )

    course_type = Column(
        String(50),
        nullable=False,
        default="Course"
    )