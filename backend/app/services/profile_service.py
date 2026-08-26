from sqlalchemy.orm import Session

from app.models.user import User
from app.models.skill import Skill
from app.models.user_skill import UserSkill
from app.models.user_interest import UserInterest
from app.models.learning_history import LearningHistory

from app.schemas.learner_profile import LearnerProfileCreate


def create_learner_profile(
    db: Session,
    profile_data: LearnerProfileCreate
):
    # ------------------------------------------------------
    # 1. Check whether user already exists
    # ------------------------------------------------------

    existing_user = (
        db.query(User)
        .filter(User.email == profile_data.email)
        .first()
    )

    if existing_user:
        raise ValueError(
            "A learner with this email already exists."
        )

    # ------------------------------------------------------
    # 2. Create user
    # ------------------------------------------------------

    user = User(
        name=profile_data.name,
        email=profile_data.email,
        experience_level=profile_data.experience_level,
        goal=profile_data.goal,
        weekly_hours=profile_data.weekly_hours
    )

    db.add(user)

    # Get generated ID
    db.flush()

    # ------------------------------------------------------
    # 3. Add interests
    # ------------------------------------------------------

    for interest in profile_data.interests:

        cleaned_interest = interest.strip()

        if not cleaned_interest:
            continue

        user_interest = UserInterest(
            user_id=user.id,
            interest=cleaned_interest
        )

        db.add(user_interest)

    # ------------------------------------------------------
    # 4. Add skills
    # ------------------------------------------------------

    for skill_input in profile_data.skills:

        skill = (
            db.query(Skill)
            .filter(
                Skill.id == skill_input.skill_id
            )
            .first()
        )

        if not skill:
            raise ValueError(
                f"Skill ID {skill_input.skill_id} does not exist."
            )

        user_skill = UserSkill(
            user_id=user.id,
            skill_id=skill.id,
            proficiency=skill_input.proficiency
        )

        db.add(user_skill)

    # ------------------------------------------------------
    # 5. Add learning history
    # ------------------------------------------------------

    for history_input in profile_data.learning_history:

        history = LearningHistory(
            user_id=user.id,
            course_id=history_input.course_id,
            progress=history_input.progress,
            score=history_input.score,
            completed=history_input.completed
        )

        db.add(history)

    db.commit()
    db.refresh(user)

    return user

def get_learner_profile(
    db: Session,
    user_id: int
):
    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if not user:
        return None

    skills = (
        db.query(
            Skill.id,
            Skill.name,
            Skill.category,
            UserSkill.proficiency
        )
        .join(
            UserSkill,
            UserSkill.skill_id == Skill.id
        )
        .filter(
            UserSkill.user_id == user_id
        )
        .all()
    )

    interests = (
        db.query(UserInterest.interest)
        .filter(
            UserInterest.user_id == user_id
        )
        .all()
    )

    learning_history = (
        db.query(LearningHistory)
        .filter(
            LearningHistory.user_id == user_id
        )
        .all()
    )

    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "experience_level": user.experience_level,
        "goal": user.goal,
        "weekly_hours": user.weekly_hours,

        "interests": [
            item.interest
            for item in interests
        ],

        "skills": [
            {
                "id": skill.id,
                "name": skill.name,
                "category": skill.category,
                "proficiency": skill.proficiency
            }
            for skill in skills
        ],

        "learning_history": [
            {
                "course_id": item.course_id,
                "progress": item.progress,
                "score": item.score,
                "completed": item.completed
            }
            for item in learning_history
        ]
    }

def generate_profile_summary(
    db: Session,
    user_id: int
):
    profile = get_learner_profile(
        db,
        user_id
    )

    if not profile:
        return None

    completed_courses = [
        item
        for item in profile["learning_history"]
        if item["completed"]
    ]

    strong_skills = [
        skill
        for skill in profile["skills"]
        if skill["proficiency"] >= 4
    ]

    developing_skills = [
        skill
        for skill in profile["skills"]
        if skill["proficiency"] <= 3
    ]

    return {
        "learner": profile["name"],

        "goal": profile["goal"],

        "experience_level": (
            profile["experience_level"]
        ),

        "weekly_learning_capacity": (
            profile["weekly_hours"]
        ),

        "interests": profile["interests"],

        "strong_skills": [
            skill["name"]
            for skill in strong_skills
        ],

        "developing_skills": [
            skill["name"]
            for skill in developing_skills
        ],

        "completed_courses": len(
            completed_courses
        ),

        "profile_completeness": calculate_profile_completeness(
            profile
        )
    }

def calculate_profile_completeness(
    profile: dict
):
    total = 6
    completed = 0

    if profile["name"]:
        completed += 1

    if profile["goal"]:
        completed += 1

    if profile["experience_level"]:
        completed += 1

    if profile["weekly_hours"]:
        completed += 1

    if profile["interests"]:
        completed += 1

    if profile["skills"]:
        completed += 1

    return round(
        (completed / total) * 100
    )