from typing import List

from pydantic import BaseModel


class SkillGapItem(BaseModel):
    skill_id: int
    skill_name: str
    category: str | None

    current_level: int
    required_level: int

    gap: int

    status: str
    priority: str
    priority_score: float


    reason: str


class SkillGapResponse(BaseModel):
    user_id: int
    goal: str

    total_required_skills: int
    strong_skills: int
    partial_skills: int
    missing_skills: int

    overall_gap_score: float

    skill_gaps: List[SkillGapItem]