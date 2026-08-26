from sqlalchemy.orm import Session

from app.models.user import User
from app.models.skill import Skill
from app.models.course import Course
from app.models.course_skill import CourseSkill
from app.models.user_skill import UserSkill
from app.models.learning_history import LearningHistory
from app.models.prerequisite import CoursePrerequisite

from app.services.skill_gap_service import (
    analyze_skill_gap
)


# ============================================================
# DIFFICULTY LEVEL
# ============================================================

DIFFICULTY_LEVEL = {
    "Beginner": 1,
    "Easy": 1,

    "Intermediate": 2,
    "Medium": 2,

    "Advanced": 3,
    "Expert": 3
}


# ============================================================
# LEARNER -> MAX COURSE DIFFICULTY
# ============================================================

EXPERIENCE_TO_DIFFICULTY = {
    "Beginner": 1,
    "Intermediate": 2,
    "Advanced": 3,
    "Expert": 3
}


# ============================================================
# GET LEARNER SKILLS
# ============================================================

def get_user_skill_map(
    db: Session,
    user_id: int
):

    user_skills = (
        db.query(UserSkill)
        .filter(
            UserSkill.user_id == user_id
        )
        .all()
    )

    return {
        item.skill_id: item.proficiency
        for item in user_skills
    }


# ============================================================
# GET COMPLETED COURSES
# ============================================================

def get_completed_courses(
    db: Session,
    user_id: int
):

    history = (
        db.query(LearningHistory)
        .filter(
            LearningHistory.user_id == user_id,
            LearningHistory.completed == True
        )
        .all()
    )

    return {
        item.course_id
        for item in history
    }


# ============================================================
# GET COURSE SKILLS
# ============================================================

def get_course_skills(
    db: Session,
    course_id: int
):

    results = (
        db.query(
            Skill.id,
            Skill.name
        )
        .join(
            CourseSkill,
            CourseSkill.skill_id == Skill.id
        )
        .filter(
            CourseSkill.course_id == course_id
        )
        .all()
    )

    return [
        {
            "id": skill.id,
            "name": skill.name
        }
        for skill in results
    ]

def check_prerequisites(
    db: Session,
    course_id: int,
    user_skill_map
):

    prerequisites = (
        db.query(CoursePrerequisite)
        .filter(
            CoursePrerequisite.course_id == course_id
        )
        .all()
    )

    if not prerequisites:

        return {
            "status": "Satisfied",
            "score": 10
        }

    missing = []

    for prerequisite in prerequisites:

        skill_id = prerequisite.prerequisite_course_id

        current_level = user_skill_map.get(
            skill_id,
            0
        )

        required_level = getattr(
            prerequisite,
            "required_level",
            1
        )

        if current_level < required_level:

            missing.append(skill_id)

    if missing:

        return {
            "status": "Missing",
            "score": -25
        }

    return {
        "status": "Satisfied",
        "score": 10
    }
def calculate_gap_coverage_score(
    matched_gap_items
):

    score = 0

    for item in matched_gap_items:

        gap = item["gap"]
        priority_score = item.get(
            "priority_score",
            0
        )

        score += (
            gap * 10
            + priority_score * 0.25
        )

    return min(
        score,
        60
    )
def calculate_course_score(
    matched_skills_count,
    gap_coverage_score,
    difficulty_score,
    prerequisite_score
):

    score = 0

    # Basic relevance
    score += matched_skills_count * 10

    # Important skill-gap coverage
    score += gap_coverage_score

    # Difficulty compatibility
    score += difficulty_score

    # Prerequisite compatibility
    score += prerequisite_score

    return max(
        0,
        min(score, 100)
    )

def calculate_difficulty_score(
    learner_level,
    course_difficulty
):

    learner_value = EXPERIENCE_TO_DIFFICULTY.get(
        learner_level,
        1
    )

    course_value = DIFFICULTY_LEVEL.get(
        course_difficulty,
        1
    )

    difference = abs(
        learner_value - course_value
    )

    if difference == 0:

        return 20

    if difference == 1:

        return 10

    return 0

def generate_recommendation_reason(
    course_title,
    matched_skills,
    gap_skills,
    prerequisite_status,
    matched_gap_items
):

    reasons = []

    if gap_skills:

        skills = ", ".join(
            gap_skills
        )

        reasons.append(
            f"it addresses your skill gaps in {skills}"
        )

    high_priority_skills = [
        item["skill_name"]
        for item in matched_gap_items
        if item.get("priority") == "High"
    ]

    if high_priority_skills:

        skills = ", ".join(
            high_priority_skills
        )

        reasons.append(
            f"it covers high-priority gaps in {skills}"
        )

    if matched_skills:

        skills = ", ".join(
            matched_skills
        )

        reasons.append(
            f"it aligns with your target skills in {skills}"
        )

    if prerequisite_status == "Satisfied":

        reasons.append(
            "you satisfy its prerequisites"
        )

    if not reasons:

        return (
            f"{course_title} is relevant "
            "to your learning goal."
        )

    return (
        f"{course_title} is recommended because "
        + ", ".join(reasons)
        + "."
    )

def generate_recommendations(
    db: Session,
    user_id: int,
    limit: int = 10
):

    # ========================================================
    # 1. Get learner
    # ========================================================

    user = (
        db.query(User)
        .filter(
            User.id == user_id
        )
        .first()
    )

    if not user:

        return None

    # ========================================================
    # 2. Get skill-gap analysis
    # ========================================================

    gap_analysis = analyze_skill_gap(
        db,
        user_id
    )

    if not gap_analysis:

        return None

    # ========================================================
    # 3. Build required skill set
    # ========================================================

    gap_map = {
        item["skill_id"]: item
        for item in gap_analysis[
            "skill_gaps"
        ]
    }

    needed_skill_ids = set(
        gap_map.keys()
    )

    # ========================================================
    # 4. Learner skill map
    # ========================================================

    user_skill_map = get_user_skill_map(
        db,
        user_id
    )

    # ========================================================
    # 5. Completed courses
    # ========================================================

    completed_courses = get_completed_courses(
        db,
        user_id
    )

    # ========================================================
    # 6. Get all courses
    # ========================================================

    courses = (
        db.query(Course)
        .all()
    )

    recommendations = []

    # ========================================================
    # 7. Analyze every course
    # ========================================================

    for course in courses:

        # ----------------------------------------------------
        # Skip already completed courses
        # ----------------------------------------------------

        if course.id in completed_courses:

            continue

        # ----------------------------------------------------
        # Course skills
        # ----------------------------------------------------

        course_skills = get_course_skills(
            db,
            course.id
        )

        course_skill_ids = {
            item["id"]
            for item in course_skills
        }

        # ----------------------------------------------------
        # Skills matching learner's gaps
        # ----------------------------------------------------

        matched_gap_ids = (
            course_skill_ids
            & needed_skill_ids
        )

        if not matched_gap_ids:

            continue

        # ----------------------------------------------------
        # Names
        # ----------------------------------------------------

        matched_gap_items = [
            gap_map[skill_id]
            for skill_id in matched_gap_ids
        ]

        matched_skills = [
            item["skill_name"]
            for item in matched_gap_items
        ]

        gap_skills = [
            item["skill_name"]
            for item in matched_gap_items
            if item["gap"] > 0
        ]

        # ----------------------------------------------------
        # Difficulty
        # ----------------------------------------------------

        difficulty_score = calculate_difficulty_score(
            user.experience_level,
            course.difficulty
        )

        # ----------------------------------------------------
        # Prerequisites
        # ----------------------------------------------------

        prerequisite_result = check_prerequisites(
            db,
            course.id,
            user_skill_map
        )

        # ----------------------------------------------------
        # Score
        # ----------------------------------------------------

        gap_coverage_score = calculate_gap_coverage_score(
            matched_gap_items
        )
        score = calculate_course_score(
            len(matched_skills),
            gap_coverage_score,
            difficulty_score,
            prerequisite_result["score"]
        )

        # ----------------------------------------------------
        # Explanation
        # ----------------------------------------------------

        reason = generate_recommendation_reason(
                course.title,
                matched_skills,
                gap_skills,
                prerequisite_result["status"],
                matched_gap_items
            )

        recommendations.append(
            {
                "course_id": course.id,

                "course_title": course.title,

                "difficulty": course.difficulty,

                "score": score,

                "matched_skills": matched_skills,

                "skill_gaps_addressed": gap_skills,

                "prerequisite_status":
                    prerequisite_result["status"],

                "reason": reason
            }
        )

    # ========================================================
    # 8. Rank recommendations
    # ========================================================

    recommendations.sort(
        key=lambda item: item["score"],
        reverse=True
    )

    # ========================================================
    # 9. Return top N
    # ========================================================

    return {
        "user_id": user.id,

        "goal": user.goal,

        "recommendations":
            recommendations[:limit]
    }