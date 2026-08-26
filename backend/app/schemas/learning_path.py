from typing import List, Optional

from pydantic import BaseModel


class LearningPathItem(BaseModel):
    sequence: int

    course_id: int
    course_title: str

    skill_name: str

    difficulty: Optional[str]

    estimated_hours: float

    milestone: str

    objective: str

    project_title: Optional[str] = None

    project_hours: Optional[float] = None

    reason: str

    status: str


class LearningPathResponse(BaseModel):
    user_id: int

    goal: Optional[str]

    total_courses: int

    total_hours: float

    estimated_weeks: int

    completed_courses: int

    progress_percentage: float

    current_milestone: Optional[str]

    items: List[LearningPathItem]