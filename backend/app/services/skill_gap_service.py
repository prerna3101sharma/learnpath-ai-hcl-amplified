from sqlalchemy.orm import Session

from app.models.skill import Skill
from app.models.user_skill import UserSkill
from app.models.user import User

from app.ai.goal_parser import extract_target_skills


# ============================================================
# REQUIRED PROFICIENCY
# ============================================================

REQUIRED_LEVELS = {
    "Programming Fundamentals": 3,
    "Python": 4,
    "SQL": 3,
    "Statistics": 4,
    "Data Analysis": 4,
    "Machine Learning": 4,
    "Deep Learning": 3,
    "NLP": 3,
    "Generative AI": 3,
    "React": 4,
    "Java": 4,
    "Data Structures": 4,
    "Algorithms": 4,
    "System Design": 3
}


# ============================================================
# SKILL STATUS
# ============================================================

def get_skill_status(
    current_level: int,
    required_level: int
):

    if current_level >= required_level:

        return "Strong"

    if current_level > 0:

        return "Partial"

    return "Missing"


# ============================================================
# PRIORITY
# ============================================================

def get_priority(
    gap: int,
    skill_name: str
):

    # Critical foundational skills
    foundational_skills = {
        "Programming Fundamentals",
        "Python",
        "Statistics",
        "Data Structures"
    }

    if gap >= 3:

        return "High"

    if (
        skill_name in foundational_skills
        and gap >= 2
    ):

        return "High"

    if gap == 2:

        return "Medium"

    if gap == 1:

        return "Low"

    return "None"


# ============================================================
# REASON
# ============================================================

def generate_reason(
    skill_name: str,
    current_level: int,
    required_level: int,
    status: str
):

    if status == "Strong":

        return (
            f"You already have a strong {skill_name} "
            f"foundation at level {current_level}."
        )

    if status == "Partial":

        return (
            f"Your {skill_name} level is {current_level}, "
            f"but the target requires level "
            f"{required_level}. "
            f"This skill should be strengthened."
        )

    return (
        f"{skill_name} is required for your target goal "
        f"but is currently missing from your profile."
    )


# ============================================================
# MAIN ANALYSIS
# ============================================================

def analyze_skill_gap(
    db: Session,
    user_id: int
):

    # --------------------------------------------------------
    # 1. Get user
    # --------------------------------------------------------

    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if not user:

        return None

    # --------------------------------------------------------
    # 2. Extract target skills
    # --------------------------------------------------------

    target_skill_names = extract_target_skills(
        user.goal
    )

    if not target_skill_names:

        return {
            "user_id": user.id,
            "goal": user.goal,
            "total_required_skills": 0,
            "strong_skills": 0,
            "partial_skills": 0,
            "missing_skills": 0,
            "overall_gap_score": 0,
            "skill_gaps": []
        }

    # --------------------------------------------------------
    # 3. Get target skills from database
    # --------------------------------------------------------

    target_skills = (
        db.query(Skill)
        .filter(
            Skill.name.in_(target_skill_names)
        )
        .all()
    )

    # --------------------------------------------------------
    # 4. Get user's current skills
    # --------------------------------------------------------

    user_skills = (
        db.query(UserSkill)
        .filter(
            UserSkill.user_id == user_id
        )
        .all()
    )

    current_skill_map = {
        item.skill_id: item.proficiency
        for item in user_skills
    }

    # --------------------------------------------------------
    # 5. Analyze each skill
    # --------------------------------------------------------

    skill_gaps = []

    strong_count = 0
    partial_count = 0
    missing_count = 0

    total_gap = 0
    total_possible_gap = 0

    for skill in target_skills:

        current_level = current_skill_map.get(
            skill.id,
            0
        )

        required_level = REQUIRED_LEVELS.get(
            skill.name,
            3
        )

        gap = max(
            required_level - current_level,
            0
        )

        status = get_skill_status(
            current_level,
            required_level
        )

        priority = get_priority(
            gap,
            skill.name
        )

        priority_score = calculate_priority_score(
            gap,
            required_level,
            skill.name
        )

        reason = generate_reason(
            skill.name,
            current_level,
            required_level,
            status
        )

        # Counters
        if status == "Strong":
            strong_count += 1

        elif status == "Partial":
            partial_count += 1

        else:
            missing_count += 1

        total_gap += gap
        total_possible_gap += required_level

        skill_gaps.append(
            {
                "skill_id": skill.id,
                "skill_name": skill.name,
                "category": skill.category,

                "current_level": current_level,
                "required_level": required_level,

                "gap": gap,

                "status": status,
                "priority": priority,
                "priority_score": priority_score,

                "reason": reason
            }
        )

    # --------------------------------------------------------
    # 6. Overall gap score
    # --------------------------------------------------------

    if total_possible_gap > 0:

        overall_gap_score = round(
            (
                total_gap
                / total_possible_gap
            ) * 100,
            2
        )

    else:

        overall_gap_score = 0

    # --------------------------------------------------------
    # 7. Sort by priority / gap
    # --------------------------------------------------------

    priority_order = {
        "High": 1,
        "Medium": 2,
        "Low": 3,
        "None": 4
    }

    skill_gaps.sort(
        key=lambda item: (
            priority_order[item["priority"]],
            -item["gap"]
        )
    )

    # --------------------------------------------------------
    # 8. Return result
    # --------------------------------------------------------

    return {
        "user_id": user.id,
        "goal": user.goal,

        "total_required_skills": len(
            target_skills
        ),

        "strong_skills": strong_count,

        "partial_skills": partial_count,

        "missing_skills": missing_count,

        "overall_gap_score": overall_gap_score,

        "skill_gaps": skill_gaps
    }

def calculate_priority_score(
    gap: int,
    required_level: int,
    skill_name: str
):

    foundational_skills = {
        "Programming Fundamentals",
        "Python",
        "Statistics",
        "Data Structures",
        "Algorithms"
    }

    score = gap * 20

    if required_level >= 4:
        score += 10

    if skill_name in foundational_skills:
        score += 10

    return min(score, 100)