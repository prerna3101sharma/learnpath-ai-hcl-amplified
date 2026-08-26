from typing import List, Optional

from pydantic import BaseModel


class CourseRecommendation(BaseModel):
    course_id: int
    course_title: str

    difficulty: Optional[str]

    score: float

    matched_skills: List[str]

    skill_gaps_addressed: List[str]

    prerequisite_status: str

    reason: str


class RecommendationResponse(BaseModel):
    user_id: int
    goal: Optional[str]

    recommendations: List[CourseRecommendation]