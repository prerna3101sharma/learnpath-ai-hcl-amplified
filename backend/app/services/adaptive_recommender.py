from typing import List, Dict, Any


def clamp(value: float, minimum: float = 0, maximum: float = 100):
    return max(minimum, min(value, maximum))


def normalize_feedback(feedback: str | None) -> str | None:
    if not feedback:
        return None

    feedback = feedback.strip().upper()

    aliases = {
        "TOO EASY": "TOO_EASY",
        "JUST RIGHT": "JUST_RIGHT",
        "TOO DIFFICULT": "TOO_DIFFICULT",
        "ALREADY KNOW": "ALREADY_KNOW",
        "NOT RELEVANT": "NOT_RELEVANT",
    }

    return aliases.get(feedback, feedback)


def calculate_learning_signal(
    progress: float,
    feedback: str | None
) -> Dict[str, Any]:

    feedback = normalize_feedback(feedback)

    progress = clamp(float(progress))

    signal = {
        "difficulty_adjustment": 0,
        "pace_adjustment": 0,
        "reinforcement_needed": False,
        "skip_similar": False,
        "reason": "Continue with the current learning level."
    }

    # ---------------------------------------------------------
    # TOO EASY
    # ---------------------------------------------------------

    if feedback == "TOO_EASY":

        signal["difficulty_adjustment"] = 1
        signal["pace_adjustment"] = 1
        signal["reason"] = (
            "The learner found the resource too easy, "
            "so a more advanced resource is recommended."
        )

    # ---------------------------------------------------------
    # TOO DIFFICULT
    # ---------------------------------------------------------

    elif feedback == "TOO_DIFFICULT":

        signal["difficulty_adjustment"] = -1
        signal["pace_adjustment"] = -1
        signal["reinforcement_needed"] = True
        signal["reason"] = (
            "The learner found the resource difficult, "
            "so prerequisite or reinforcement material "
            "should be introduced."
        )

    # ---------------------------------------------------------
    # JUST RIGHT
    # ---------------------------------------------------------

    elif feedback == "JUST_RIGHT":

        signal["difficulty_adjustment"] = 0
        signal["pace_adjustment"] = 0
        signal["reason"] = (
            "The current difficulty appears appropriate "
            "for the learner."
        )

    # ---------------------------------------------------------
    # ALREADY KNOW
    # ---------------------------------------------------------

    elif feedback == "ALREADY_KNOW":

        signal["difficulty_adjustment"] = 1
        signal["pace_adjustment"] = 1
        signal["skip_similar"] = True
        signal["reason"] = (
            "The learner already knows this material, "
            "so the system should move toward more advanced content."
        )

    # ---------------------------------------------------------
    # NOT RELEVANT
    # ---------------------------------------------------------

    elif feedback == "NOT_RELEVANT":

        signal["skip_similar"] = True
        signal["reason"] = (
            "The learner considered the resource irrelevant, "
            "so similar resources should receive lower priority."
        )

    # ---------------------------------------------------------
    # PROGRESS BASED ADAPTATION
    # ---------------------------------------------------------

    if progress < 25:

        signal["pace_adjustment"] -= 1

    elif progress >= 75:

        signal["pace_adjustment"] += 1

    return signal


def generate_adaptive_recommendations(
    learning_path: List[Dict[str, Any]],
    progress_records: List[Dict[str, Any]],
    feedback_records: List[Dict[str, Any]]
) -> Dict[str, Any]:

    # =========================================================
    # BUILD PROGRESS MAP
    # =========================================================

    progress_map = {}

    for record in progress_records:

        course_id = (
            record.get("course_id")
            or record.get("courseId")
        )

        progress = (
            record.get("progress_percentage")
            or record.get("progressPercentage")
            or record.get("progress")
            or 0
        )

        if course_id is not None:

            progress_map[int(course_id)] = clamp(
                float(progress)
            )

    # =========================================================
    # BUILD FEEDBACK MAP
    # =========================================================

    feedback_map = {}

    for record in feedback_records:

        course_id = (
            record.get("course_id")
            or record.get("courseId")
        )

        feedback = (
            record.get("feedback_type")
            or record.get("feedbackType")
            or record.get("feedback")
        )

        if course_id is not None and feedback:

            feedback_map[int(course_id)] = normalize_feedback(
                feedback
            )

    # =========================================================
    # ANALYZE PATH
    # =========================================================

    recommendations = []

    for index, item in enumerate(learning_path):

        course_id = (
            item.get("course_id")
            or item.get("courseId")
            or item.get("id")
        )

        course_id_int = (
            int(course_id)
            if course_id is not None
            else None
        )

        progress = progress_map.get(
            course_id_int,
            float(
                item.get(
                    "progress_percentage",
                    0
                ) or 0
            )
        )

        feedback = feedback_map.get(
            course_id_int
        )

        signal = calculate_learning_signal(
            progress,
            feedback
        )

        recommendation = {
            "course_id": course_id_int,
            "course_title": (
                item.get("course_title")
                or item.get("title")
                or item.get("course", {}).get("title")
                or "Learning Resource"
            ),
            "skill_name": item.get(
                "skill_name",
                "General"
            ),
            "progress": progress,
            "feedback": feedback,
            "priority": 100 - progress,
            "difficulty_adjustment": signal[
                "difficulty_adjustment"
            ],
            "pace_adjustment": signal[
                "pace_adjustment"
            ],
            "reinforcement_needed": signal[
                "reinforcement_needed"
            ],
            "skip_similar": signal[
                "skip_similar"
            ],
            "reason": signal["reason"],
        }

        recommendations.append(
            recommendation
        )

    # =========================================================
    # SORT BY PRIORITY
    # =========================================================

    recommendations.sort(
        key=lambda x: (
            x["progress"] >= 100,
            -x["priority"]
        )
    )

    # =========================================================
    # DETERMINE NEXT ACTION
    # =========================================================

    next_action = None

    for recommendation in recommendations:

        if recommendation["progress"] < 100:

            next_action = recommendation

            break

    # =========================================================
    # OVERALL ADAPTATION
    # =========================================================

    completed = sum(
        1
        for recommendation in recommendations
        if recommendation["progress"] >= 100
    )

    total = len(recommendations)

    overall_progress = (
        round(
            sum(
                r["progress"]
                for r in recommendations
            ) / total
        )
        if total > 0
        else 0
    )

    if overall_progress >= 75:

        adaptation_mode = "ACCELERATE"

    elif overall_progress < 30:

        adaptation_mode = "REINFORCE"

    else:

        adaptation_mode = "BALANCED"

    return {
        "adaptation_mode": adaptation_mode,
        "overall_progress": overall_progress,
        "completed_resources": completed,
        "total_resources": total,
        "next_action": next_action,
        "recommendations": recommendations,
    }