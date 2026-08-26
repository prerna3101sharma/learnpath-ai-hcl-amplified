import re


# ============================================================
# GOAL -> TARGET SKILLS
# ============================================================

GOAL_SKILL_MAP = {

    "machine learning engineer": [
        "Python",
        "Statistics",
        "Data Analysis",
        "Machine Learning",
        "Data Structures",
        "Algorithms"
    ],

    "ml engineer": [
        "Python",
        "Statistics",
        "Data Analysis",
        "Machine Learning",
        "Data Structures",
        "Algorithms"
    ],

    "data scientist": [
        "Python",
        "SQL",
        "Statistics",
        "Data Analysis",
        "Machine Learning"
    ],

    "data analyst": [
        "SQL",
        "Statistics",
        "Data Analysis",
        "Python"
    ],

    "ai engineer": [
        "Python",
        "Statistics",
        "Machine Learning",
        "Deep Learning",
        "NLP",
        "Generative AI"
    ],

    "artificial intelligence engineer": [
        "Python",
        "Statistics",
        "Machine Learning",
        "Deep Learning",
        "NLP",
        "Generative AI"
    ],

    "generative ai engineer": [
        "Python",
        "Deep Learning",
        "NLP",
        "Generative AI"
    ],

    "llm engineer": [
        "Python",
        "NLP",
        "Deep Learning",
        "Generative AI"
    ],

    "frontend developer": [
        "Programming Fundamentals",
        "Java",
        "React"
    ],

    "react developer": [
        "Programming Fundamentals",
        "React"
    ],

    "software developer": [
        "Programming Fundamentals",
        "Data Structures",
        "Algorithms",
        "System Design"
    ],

    "software engineer": [
        "Programming Fundamentals",
        "Data Structures",
        "Algorithms",
        "System Design"
    ],

    "backend developer": [
        "Programming Fundamentals",
        "SQL",
        "Data Structures",
        "Algorithms",
        "System Design"
    ]
}

GOAL_ALIASES = {
    "ai developer": "ai engineer",
    "ml developer": "machine learning engineer",
    "machine learning developer": "machine learning engineer",
    "data science": "data scientist",
    "frontend developer": "react developer",
    "web developer": "react developer",
    "llm developer": "llm engineer"
}
# ============================================================
# KEYWORD MATCHING
# ============================================================

KEYWORD_SKILLS = {

    "python": "Python",
    "sql": "SQL",
    "statistics": "Statistics",
    "statistical": "Statistics",

    "data analysis": "Data Analysis",
    "data analytics": "Data Analysis",

    "machine learning": "Machine Learning",
    "ml": "Machine Learning",

    "deep learning": "Deep Learning",
    "neural network": "Deep Learning",
    "neural networks": "Deep Learning",

    "nlp": "NLP",
    "natural language processing": "NLP",

    "generative ai": "Generative AI",
    "genai": "Generative AI",
    "llm": "Generative AI",
    "large language model": "Generative AI",

    "react": "React",

    "java": "Java",

    "data structures": "Data Structures",
    "algorithms": "Algorithms",

    "system design": "System Design"
}


def normalize_text(text: str) -> str:
    """
    Normalize goal text for matching.
    """

    text = text.lower().strip()

    text = re.sub(
        r"[^a-z0-9\s]",
        " ",
        text
    )

    text = re.sub(
        r"\s+",
        " ",
        text
    )

    return text


def extract_target_skills(goal: str):
    """
    Extract target skills from a learner's goal.

    Uses:
    1. Exact career-goal mapping
    2. Keyword-based skill extraction
    """

    if not goal:
        return []

    normalized_goal = normalize_text(goal)

    # --------------------------------------------------------
    # Apply aliases
    # --------------------------------------------------------

    for alias, standard_goal in GOAL_ALIASES.items():

        if alias in normalized_goal:

            normalized_goal += " " + standard_goal

    target_skills = []

    # --------------------------------------------------------
    # 1. Career goal mapping
    # --------------------------------------------------------

    for career, skills in GOAL_SKILL_MAP.items():

        if career in normalized_goal:

            for skill in skills:

                if skill not in target_skills:
                    target_skills.append(skill)

    # --------------------------------------------------------
    # 2. Keyword extraction
    # --------------------------------------------------------

    for keyword, skill in KEYWORD_SKILLS.items():

        if keyword in normalized_goal:

            if skill not in target_skills:
                target_skills.append(skill)

    return target_skills