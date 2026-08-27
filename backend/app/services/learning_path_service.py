from sqlalchemy.orm import Session

from app.models.user import User
from app.models.course import Course
from app.models.skill import Skill
from app.models.course_skill import CourseSkill
from app.models.learning_history import LearningHistory

from app.services.recommendation_service import (
    generate_recommendations
)

from app.services.skill_gap_service import (
    analyze_skill_gap
)

from app.ai.ollama_service import (
    chat_with_ollama
)

import json
import re


# ============================================================
# DIFFICULTY ORDER
# ============================================================

DIFFICULTY_ORDER = {
    "Beginner": 1,
    "Easy": 1,

    "Intermediate": 2,
    "Medium": 2,

    "Advanced": 3,
    "Expert": 3
}


# ============================================================
# SKILL ORDER
# ============================================================

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


# ============================================================
# COURSE SKILLS
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


# ============================================================
# COMPLETED COURSES
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
# COURSE HOURS
# ============================================================

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


# ============================================================
# DEFAULT MILESTONE
# ============================================================

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


# ============================================================
# DEFAULT OBJECTIVES
# ============================================================

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


# ============================================================
# FALLBACK REASON
# ============================================================

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


# ============================================================
# SORT COURSES
# ============================================================

def sort_courses_for_learning(
    recommendations
):

    def get_sort_key(item):

        skills = item.get(
            "skill_gaps_addressed",
            []
        )

        if not skills:

            return (
                999,
                DIFFICULTY_ORDER.get(
                    item.get("difficulty"),
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
                item.get("difficulty"),
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


# ============================================================
# AI LEARNING PATH GENERATOR
# ============================================================

def generate_ai_learning_plan(
    user,
    skill_gaps,
    courses
):

    course_data = []

    for course in courses:

        course_data.append({
            "course_id": course["course_id"],
            "title": course["course_title"],
            "difficulty": course["difficulty"],
            "skills": course["skills"]
        })

    prompt = f"""
You are an AI learning path planner.

Create a personalized learning roadmap for this learner.

Learner goal:
{user.goal}

Skill gaps:
{json.dumps(skill_gaps, indent=2)}

Available courses:
{json.dumps(course_data, indent=2)}

Rules:

1. Use ONLY the available course IDs.
2. Do not invent courses.
3. Prioritize courses that address larger skill gaps.
4. Respect prerequisite relationships.
5. Start with foundational skills.
6. Place advanced topics after prerequisite skills.
7. Give a meaningful personalized module name.
8. Give a concise learning objective.
9. Give a concise reason for the recommendation.
10. Return valid JSON only.

Return exactly this structure:

{{
    "modules": [
        {{
            "course_id": 1,
            "module_name": "Python Foundations",
            "objective": "Build strong Python programming fundamentals.",
            "reason": "Python is required before progressing to machine learning."
        }}
    ]
}}

Do not include markdown.
Do not include explanations outside JSON.
"""

    try:

        response = chat_with_ollama(
            [
                {
                    "role": "system",
                    "content":
                        "You are an expert personalized learning path planner."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.2
        )

        # ----------------------------------------------------
        # Remove accidental markdown
        # ----------------------------------------------------

        response = response.strip()

        response = re.sub(
            r"^```json",
            "",
            response,
            flags=re.IGNORECASE
        )

        response = re.sub(
            r"^```",
            "",
            response
        )

        response = re.sub(
            r"```$",
            "",
            response
        )

        response = response.strip()

        ai_data = json.loads(response)

        if not isinstance(
            ai_data,
            dict
        ):

            return None

        modules = ai_data.get(
            "modules",
            []
        )

        if not isinstance(
            modules,
            list
        ):

            return None

        return modules

    except Exception as error:

        print(
            "AI learning path generation failed:",
            error
        )

        return None


# ============================================================
# MAIN LEARNING PATH
# ============================================================

def generate_learning_path(
    db: Session,
    user_id: int,
    weekly_hours: int = 10,
    max_courses: int = 10
):

    # ========================================================
    # 1. USER
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
    # 2. SKILL GAP
    # ========================================================

    gap_analysis = analyze_skill_gap(
        db,
        user_id
    )

    if not gap_analysis:

        return None


    skill_gaps = gap_analysis.get(
        "skill_gaps",
        []
    )


    # ========================================================
    # 3. RECOMMENDATIONS
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
        recommendation_result.get(
            "recommendations",
            []
        )
    )


    # ========================================================
    # 4. SORT
    # ========================================================

    recommendations = (
        sort_courses_for_learning(
            recommendations
        )
    )


    # ========================================================
    # 5. COMPLETED
    # ========================================================

    completed_courses = (
        get_completed_courses(
            db,
            user_id
        )
    )


    # ========================================================
    # 6. PREPARE COURSES FOR AI
    # ========================================================

    candidate_courses = []

    for recommendation in recommendations:

        course_id = recommendation.get(
            "course_id"
        )

        if not course_id:

            continue

        course = (
            db.query(Course)
            .filter(
                Course.id == course_id
            )
            .first()
        )

        if not course:

            continue

        skills = recommendation.get(
            "skill_gaps_addressed",
            []
        )

        if not skills:

            continue

        candidate_courses.append({
            "course_id": course.id,

            "course_title":
                course.title,

            "difficulty":
                course.difficulty,

            "skills":
                skills
        })


    # ========================================================
    # 7. ASK AI TO CREATE LEARNING PATH
    # ========================================================

    ai_modules = generate_ai_learning_plan(
        user=user,
        skill_gaps=skill_gaps,
        courses=candidate_courses[:50]
    )


    # ========================================================
    # 8. FALLBACK
    # ========================================================

    if not ai_modules:

        ai_modules = [
            {
                "course_id":
                    item["course_id"],

                "module_name":
                    get_milestone(
                        item["skills"][0],
                        index + 1
                    ),

                "objective":
                    generate_objective(
                        item["skills"][0]
                    ),

                "reason":
                    generate_path_reason(
                        item["skills"][0],
                        index + 1,
                        0
                    )
            }

            for index, item
            in enumerate(
                candidate_courses[:max_courses]
            )
        ]


    # ========================================================
    # 9. CREATE COURSE LOOKUP
    # ========================================================

    course_lookup = {
        item["course_id"]: item
        for item in candidate_courses
    }


    # ========================================================
    # 10. BUILD FINAL PATH
    # ========================================================

    path_items = []

    total_hours = 0

    sequence = 1

    used_courses = set()


    for module in ai_modules:

        if len(path_items) >= max_courses:

            break

        course_id = module.get(
            "course_id"
        )

        if not course_id:

            continue

        if course_id in used_courses:

            continue

        course_info = course_lookup.get(
            course_id
        )

        if not course_info:

            continue

        course = (
            db.query(Course)
            .filter(
                Course.id == course_id
            )
            .first()
        )

        if not course:

            continue

        used_courses.add(
            course_id
        )


        # ----------------------------------------------------
        # Skills
        # ----------------------------------------------------

        skills = course_info.get(
            "skills",
            []
        )

        primary_skill = (
            min(
                skills,
                key=lambda skill:
                    SKILL_ORDER.get(
                        skill,
                        999
                    )
            )
            if skills
            else "General"
        )


        # ----------------------------------------------------
        # Gap
        # ----------------------------------------------------

        gap_item = next(
            (
                item
                for item in skill_gaps
                if item.get(
                    "skill_name"
                ) == primary_skill
            ),
            {}
        )

        gap = gap_item.get(
            "gap",
            0
        )


        # ----------------------------------------------------
        # Hours
        # ----------------------------------------------------

        hours = get_course_hours(
            course
        )

        total_hours += hours


        # ----------------------------------------------------
        # Status
        # ----------------------------------------------------

        if course_id in completed_courses:

            status = "Completed"

        elif not any(
            item["status"] == "Next"
            for item in path_items
        ):

            status = "Next"

        else:

            status = "Upcoming"


        # ----------------------------------------------------
        # AI CONTENT
        # ----------------------------------------------------

        module_name = module.get(
            "module_name"
        ) or get_milestone(
            primary_skill,
            sequence
        )

        objective = module.get(
            "objective"
        ) or generate_objective(
            primary_skill
        )

        reason = module.get(
            "reason"
        ) or generate_path_reason(
            primary_skill,
            sequence,
            gap
        )


        # ----------------------------------------------------
        # ADD PATH ITEM
        # ----------------------------------------------------

        path_items.append({

            "sequence":
                sequence,

            "course_id":
                course.id,

            "course_title":
                course.title,

            "module_name":
                module_name,

            "skill_name":
                primary_skill,

            "difficulty":
                course.difficulty,

            "estimated_hours":
                hours,

            "milestone":
                module_name,

            "objective":
                objective,

            "reason":
                reason,

            "status":
                status,

            "progress_percentage":
                100
                if course_id in completed_courses
                else 0
        })

        sequence += 1


    # ========================================================
    # 11. WEEKS
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
    # 12. PROGRESS
    # ========================================================

    total_courses = len(
        path_items
    )

    completed_count = sum(
        1
        for item in path_items
        if item["status"] == "Completed"
    )

    if total_courses > 0:

        progress_percentage = round(
            (
                completed_count
                /
                total_courses
            ) * 100,
            2
        )

    else:

        progress_percentage = 0


    # ========================================================
    # 13. CURRENT MILESTONE
    # ========================================================

    current_milestone = None

    for item in path_items:

        if item["status"] != "Completed":

            current_milestone = (
                item["module_name"]
            )

            break


    # ========================================================
    # 14. RETURN
    # ========================================================

    return {

        "user_id":
            user.id,

        "goal":
            user.goal,

        "total_courses":
            total_courses,

        "total_hours":
            round(
                total_hours,
                2
            ),

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