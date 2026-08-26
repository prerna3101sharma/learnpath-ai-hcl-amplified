from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field


class SkillInput(BaseModel):
    skill_id: int
    proficiency: int = Field(
        default=1,
        ge=1,
        le=5,
        description="Skill proficiency from 1 to 5"
    )


class LearningHistoryInput(BaseModel):
    course_id: int
    progress: float = Field(
        default=0,
        ge=0,
        le=100
    )
    score: Optional[float] = Field(
        default=None,
        ge=0,
        le=100
    )
    completed: bool = False


class LearnerProfileCreate(BaseModel):
    name: str = Field(
        min_length=2,
        max_length=100
    )

    email: str = Field(
        min_length=5,
        max_length=255
    )

    experience_level: str = Field(
        default="Beginner"
    )

    goal: Optional[str] = Field(
        default=None,
        max_length=500
    )

    weekly_hours: Optional[int] = Field(
        default=None,
        ge=1,
        le=80
    )

    interests: List[str] = Field(
        default_factory=list
    )

    skills: List[SkillInput] = Field(
        default_factory=list
    )

    learning_history: List[LearningHistoryInput] = Field(
        default_factory=list
    )


class LearnerProfileResponse(BaseModel):
    id: int
    name: str
    email: str
    experience_level: str
    goal: Optional[str]
    weekly_hours: Optional[int]

    interests: List[str]

    skills: List[dict]

    learning_history: List[dict]

    model_config = ConfigDict(
        from_attributes=True
    )