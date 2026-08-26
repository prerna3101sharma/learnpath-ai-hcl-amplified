from sqlalchemy.orm import Session

from app.models.user import User
from app.models.course import Course
from app.models.skill import Skill
from app.models.course_skill import CourseSkill
from app.models.user_skill import UserSkill
from app.models.learning_history import LearningHistory

from app.services.recommendation_service import (
    generate_recommendations
)

from app.services.skill_gap_service import (
    analyze_skill_gap
)

DIFFICULTY_ORDER = {
    "Beginner": 1,
    "Easy": 1,

    "Intermediate": 2,
    "Medium": 2,

    "Advanced": 3,
    "Expert": 3
}
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

def get_course_hours(course):

    if hasattr(course, "estimated_hours"):

        return float(
            course.estimated_hours or 5
        )

    if hasattr(course, "duration_hours"):

        return float(
            course.duration_hours or 5
        )

    if hasattr(course, "duration"):

        return float(
            course.duration or 5
        )

    return 5.0

def get_milestone(
    skill_name: str,
    sequence: int
):

    milestones = {

        "Programming Fundamentals":
            "Programming Foundation",

        "Python":
            "Python Foundation",

        "SQL":
            "Data Management",

        "Statistics":
            "Mathematical Foundation",

        "Data Analysis":
            "Data Analysis Foundation",

        "Machine Learning":
            "Machine Learning Core",

        "Deep Learning":
            "Deep Learning",

        "NLP":
            "Natural Language Processing",

        "Generative AI":
            "Generative AI",

        "React":
            "Frontend Development",

        "Java":
            "Java Development",

        "Data Structures":
            "Problem Solving",

        "Algorithms":
            "Algorithmic Thinking",

        "System Design":
            "Software Architecture"
    }

    return milestones.get(
        skill_name,
        f"Learning Milestone {sequence}"
    )

def generate_objective(
    skill_name: str
):

    objectives = {

        "Programming Fundamentals":
            "Understand core programming concepts and problem-solving.",

        "Python":
            "Write Python programs and solve practical programming problems.",

        "SQL":
            "Query, filter and analyze relational data using SQL.",

        "Statistics":
            "Understand statistical concepts required for data-driven decision making.",

        "Data Analysis":
            "Analyze datasets and extract meaningful insights.",

        "Machine Learning":
            "Build and evaluate machine learning models.",

        "Deep Learning":
            "Understand neural networks and build deep learning models.",

        "NLP":
            "Process and analyze human language using NLP techniques.",

        "Generative AI":
            "Understand and build applications using generative AI models.",

        "React":
            "Build interactive frontend applications using React.",

        "Java":
            "Develop applications using Java programming concepts.",

        "Data Structures":
            "Implement and use fundamental data structures.",

        "Algorithms":
            "Design and analyze efficient algorithms.",

        "System Design":
            "Design scalable and maintainable software systems."
    }

    return objectives.get(
        skill_name,
        f"Develop practical skills in {skill_name}."
    )

def generate_path_reason(
    skill_name: str,
    sequence: int,
    gap: int
):

    if sequence == 1:

        return (
            f"{skill_name} is placed first because "
            "it establishes the foundation for your learning goal."
        )

    if gap >= 3:

        return (
            f"{skill_name} is prioritized because "
            "it represents a significant skill gap "
            "for your target career."
        )

    if gap > 0:

        return (
            f"{skill_name} is included to strengthen "
            "a skill required for your target goal."
        )

    return (
        f"{skill_name} is included to build "
        "progressive knowledge toward your goal."
    )
SKILL_ORDER = {

    "Programming Fundamentals": 1,

    "Python": 2,

    "SQL": 3,

    "Statistics": 3,

    "Data Structures": 4,

    "Algorithms": 5,

    "Data Analysis": 5,

    "Machine Learning": 6,

    "Deep Learning": 7,

    "NLP": 8,

    "Generative AI": 9,

    "React": 5,

    "Java": 4,

    "System Design": 10
}

def sort_courses_for_learning(
    recommendations
):

    def get_sort_key(item):

        skills = item[
            "skill_gaps_addressed"
        ]

        if not skills:

            return (
                999,
                DIFFICULTY_ORDER.get(
                    item["difficulty"],
                    1
                )
            )

        skill_order = min(
            SKILL_ORDER.get(
                skill,
                999
            )
            for skill in skills
        )

        difficulty_order = (
            DIFFICULTY_ORDER.get(
                item["difficulty"],
                1
            )
        )

        return (
            skill_order,
            difficulty_order
        )

    return sorted(
        recommendations,
        key=get_sort_key
    )

def generate_learning_path(
    db: Session,
    user_id: int,
    weekly_hours: int = 10,
    max_courses: int = 10
):

    # ========================================================
    # 1. Find learner
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
    # 2. Skill-gap analysis
    # ========================================================

    gap_analysis = analyze_skill_gap(
        db,
        user_id
    )

    if not gap_analysis:

        return None

    # ========================================================
    # 3. Get recommendations
    # ========================================================

    recommendation_result = (
        generate_recommendations(
            db,
            user_id,
            limit=50
        )
    )

    if not recommendation_result:

        return None

    recommendations = (
        recommendation_result[
            "recommendations"
        ]
    )

    # ========================================================
    # 4. Sort for learning sequence
    # ========================================================

    recommendations = (
        sort_courses_for_learning(
            recommendations
        )
    )

    # ========================================================
    # 5. Completed courses
    # ========================================================

    completed_courses = (
        get_completed_courses(
            db,
            user_id
        )
    )

    # ========================================================
    # 6. Build gap map
    # ========================================================

    gap_map = {
        item["skill_name"]: item
        for item in gap_analysis[
            "skill_gaps"
        ]
    }

    # ========================================================
    # 7. Build path
    # ========================================================

    path_items = []

    total_hours = 0

    sequence = 1

    for recommendation in recommendations:

        if len(path_items) >= max_courses:

            break

        course_id = (
            recommendation["course_id"]
        )

        course = (
            db.query(Course)
            .filter(
                Course.id == course_id
            )
            .first()
        )

        if not course:

            continue

        # ----------------------------------------------------
        # Skills addressed
        # ----------------------------------------------------

        skills = recommendation[
            "skill_gaps_addressed"
        ]

        if not skills:

            continue

        # ----------------------------------------------------
        # Choose primary skill
        # ----------------------------------------------------

        primary_skill = min(
            skills,
            key=lambda skill:
                SKILL_ORDER.get(
                    skill,
                    999
                )
        )

        # ----------------------------------------------------
        # Gap information
        # ----------------------------------------------------

        gap_item = gap_map.get(
            primary_skill,
            {}
        )

        gap = gap_item.get(
            "gap",
            0
        )

        # ----------------------------------------------------
        # Course hours
        # ----------------------------------------------------

        hours = get_course_hours(
            course
        )

        total_hours += hours

        # ----------------------------------------------------
        # Milestone
        # ----------------------------------------------------

        milestone = get_milestone(
            primary_skill,
            sequence
        )

        # ----------------------------------------------------
        # Objective
        # ----------------------------------------------------

        objective = generate_objective(
            primary_skill
        )

        # ----------------------------------------------------
        # Reason
        # ----------------------------------------------------

        reason = generate_path_reason(
            primary_skill,
            sequence,
            gap
        )

        # ----------------------------------------------------
        # Status
        # ----------------------------------------------------

        if course.id in completed_courses:

            status = "Completed"

        elif sequence == 1:

            status = "Next"

        else:

            status = "Upcoming"

        # ----------------------------------------------------
        # Add item
        # ----------------------------------------------------

        path_items.append(
            {
                "sequence": sequence,

                "course_id": course.id,

                "course_title":
                    course.title,

                "skill_name":
                    primary_skill,

                "difficulty":
                    course.difficulty,

                "estimated_hours":
                    hours,

                "milestone":
                    milestone,

                "objective":
                    objective,

                "reason":
                    reason,

                "status":
                    status
            }
        )

        sequence += 1

    # ========================================================
    # 8. Estimate weeks
    # ========================================================

    if weekly_hours <= 0:

        weekly_hours = 10

    estimated_weeks = max(
        1,
        int(
            (total_hours / weekly_hours)
            + 0.999
        )
    )

    # ========================================================
    # 9. Progress
    # ========================================================

    completed_count = sum(
        1
        for item in path_items
        if item["status"] == "Completed"
    )

    total_courses = len(
        path_items
    )

    if total_courses > 0:

        progress_percentage = round(
            (
                completed_count
                / total_courses
            ) * 100,
            2
        )

    else:

        progress_percentage = 0

    # ========================================================
    # 10. Current milestone
    # ========================================================

    current_milestone = None

    for item in path_items:

        if item["status"] != "Completed":

            current_milestone = (
                item["milestone"]
            )

            break

    # ========================================================
    # 11. Return
    # ========================================================

    return {
        "user_id": user.id,

        "goal": user.goal,

        "total_courses":
            total_courses,

        "total_hours":
            round(total_hours, 2),

        "estimated_weeks":
            estimated_weeks,

        "completed_courses":
            completed_count,

        "progress_percentage":
            progress_percentage,

        "current_milestone":
            current_milestone,

        "items":
            path_items
    }