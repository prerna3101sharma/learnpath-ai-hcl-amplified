from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models import (
    Skill,
    Course,
    CourseSkill,
    CoursePrerequisite,
)


# ============================================================
# SKILLS
# ============================================================

SKILLS = [
    {
        "name": "Programming Fundamentals",
        "category": "Programming",
        "description": "Basic programming concepts such as variables, loops, functions and problem solving."
    },
    {
        "name": "Python",
        "category": "Programming",
        "description": "Python programming language and its ecosystem."
    },
    {
        "name": "SQL",
        "category": "Database",
        "description": "Relational databases, queries, joins, aggregation and data manipulation."
    },
    {
        "name": "Statistics",
        "category": "Data Science",
        "description": "Probability, distributions, hypothesis testing and statistical reasoning."
    },
    {
        "name": "Data Analysis",
        "category": "Data Science",
        "description": "Data cleaning, exploration and analysis using programming tools."
    },
    {
        "name": "Machine Learning",
        "category": "Artificial Intelligence",
        "description": "Supervised, unsupervised and model evaluation techniques."
    },
    {
        "name": "Deep Learning",
        "category": "Artificial Intelligence",
        "description": "Neural networks and modern deep learning architectures."
    },
    {
        "name": "NLP",
        "category": "Artificial Intelligence",
        "description": "Natural Language Processing and text-based machine learning."
    },
    {
        "name": "Generative AI",
        "category": "Artificial Intelligence",
        "description": "Generative models, LLMs and AI-powered applications."
    },
    {
        "name": "React",
        "category": "Web Development",
        "description": "Frontend development using React."
    },
    {
        "name": "Java",
        "category": "Programming",
        "description": "Object-oriented programming and application development using Java."
    },
    {
        "name": "Data Structures",
        "category": "Computer Science",
        "description": "Arrays, linked lists, stacks, queues, trees, graphs and hash tables."
    },
    {
        "name": "Algorithms",
        "category": "Computer Science",
        "description": "Searching, sorting, recursion, greedy and graph algorithms."
    },
    {
        "name": "System Design",
        "category": "Software Engineering",
        "description": "Designing scalable and distributed software systems."
    },
]


# ============================================================
# COURSES
# ============================================================

COURSES = [
    {
        "title": "Programming Fundamentals",
        "description": "Learn variables, conditions, loops, functions, basic problem solving and programming logic.",
        "difficulty": "Beginner",
        "duration_hours": 15,
        "course_type": "Course",
    },
    {
        "title": "Python Fundamentals",
        "description": "Learn Python syntax, functions, collections, modules, file handling and object-oriented programming.",
        "difficulty": "Beginner",
        "duration_hours": 20,
        "course_type": "Course",
    },
    {
        "title": "Python for Data Science",
        "description": "Learn NumPy, Pandas and practical Python techniques for data science.",
        "difficulty": "Intermediate",
        "duration_hours": 25,
        "course_type": "Course",
    },
    {
        "title": "SQL Fundamentals",
        "description": "Learn relational databases, SELECT queries, joins, aggregation and database operations.",
        "difficulty": "Beginner",
        "duration_hours": 15,
        "course_type": "Course",
    },
    {
        "title": "Statistics Fundamentals",
        "description": "Learn probability, descriptive statistics, distributions, correlation and hypothesis testing.",
        "difficulty": "Beginner",
        "duration_hours": 20,
        "course_type": "Course",
    },
    {
        "title": "Data Analysis with Pandas",
        "description": "Learn data cleaning, exploration, transformation and visualization using Pandas.",
        "difficulty": "Intermediate",
        "duration_hours": 20,
        "course_type": "Course",
    },
    {
        "title": "Machine Learning Foundations",
        "description": "Learn supervised learning, unsupervised learning, feature engineering and model evaluation.",
        "difficulty": "Intermediate",
        "duration_hours": 30,
        "course_type": "Course",
    },
    {
        "title": "Deep Learning with Neural Networks",
        "description": "Learn neural networks, backpropagation, CNNs and modern deep learning concepts.",
        "difficulty": "Advanced",
        "duration_hours": 35,
        "course_type": "Course",
    },
    {
        "title": "Natural Language Processing Fundamentals",
        "description": "Learn text preprocessing, embeddings, classification and NLP pipelines.",
        "difficulty": "Advanced",
        "duration_hours": 30,
        "course_type": "Course",
    },
    {
        "title": "Generative AI Fundamentals",
        "description": "Understand generative AI, foundation models, prompting and modern AI applications.",
        "difficulty": "Advanced",
        "duration_hours": 25,
        "course_type": "Course",
    },
    {
        "title": "LLM Application Development",
        "description": "Build practical applications using large language models, retrieval and AI agents.",
        "difficulty": "Advanced",
        "duration_hours": 30,
        "course_type": "Project",
    },
    {
        "title": "React Fundamentals",
        "description": "Build modern frontend applications using React components, state and hooks.",
        "difficulty": "Intermediate",
        "duration_hours": 25,
        "course_type": "Course",
    },
    {
        "title": "Data Structures and Algorithms",
        "description": "Learn arrays, linked lists, trees, graphs, searching, sorting and algorithmic problem solving.",
        "difficulty": "Intermediate",
        "duration_hours": 35,
        "course_type": "Course",
    },
    {
        "title": "System Design Fundamentals",
        "description": "Learn APIs, databases, caching, scalability and distributed system design principles.",
        "difficulty": "Advanced",
        "duration_hours": 30,
        "course_type": "Course",
    },
]


# ============================================================
# COURSE -> SKILLS
# ============================================================

COURSE_SKILLS = {
    "Programming Fundamentals": [
        ("Programming Fundamentals", 5),
    ],

    "Python Fundamentals": [
        ("Programming Fundamentals", 4),
        ("Python", 5),
    ],

    "Python for Data Science": [
        ("Python", 5),
        ("Data Analysis", 4),
    ],

    "SQL Fundamentals": [
        ("SQL", 5),
    ],

    "Statistics Fundamentals": [
        ("Statistics", 5),
    ],

    "Data Analysis with Pandas": [
        ("Python", 4),
        ("Data Analysis", 5),
        ("Statistics", 3),
    ],

    "Machine Learning Foundations": [
        ("Python", 4),
        ("Statistics", 4),
        ("Machine Learning", 5),
    ],

    "Deep Learning with Neural Networks": [
        ("Python", 4),
        ("Machine Learning", 5),
        ("Deep Learning", 5),
    ],

    "Natural Language Processing Fundamentals": [
        ("Machine Learning", 4),
        ("NLP", 5),
    ],

    "Generative AI Fundamentals": [
        ("Deep Learning", 4),
        ("NLP", 4),
        ("Generative AI", 5),
    ],

    "LLM Application Development": [
        ("Python", 4),
        ("NLP", 4),
        ("Generative AI", 5),
    ],

    "React Fundamentals": [
        ("React", 5),
    ],

    "Data Structures and Algorithms": [
        ("Programming Fundamentals", 3),
        ("Data Structures", 5),
        ("Algorithms", 5),
    ],

    "System Design Fundamentals": [
        ("Data Structures", 3),
        ("Algorithms", 3),
        ("System Design", 5),
    ],
}


# ============================================================
# COURSE PREREQUISITES
# ============================================================

PREREQUISITES = {
    "Python Fundamentals": [
        "Programming Fundamentals",
    ],

    "Python for Data Science": [
        "Python Fundamentals",
    ],

    "Data Analysis with Pandas": [
        "Python for Data Science",
        "Statistics Fundamentals",
    ],

    "Machine Learning Foundations": [
        "Python for Data Science",
        "Statistics Fundamentals",
    ],

    "Deep Learning with Neural Networks": [
        "Machine Learning Foundations",
    ],

    "Natural Language Processing Fundamentals": [
        "Machine Learning Foundations",
    ],

    "Generative AI Fundamentals": [
        "Deep Learning with Neural Networks",
        "Natural Language Processing Fundamentals",
    ],

    "LLM Application Development": [
        "Generative AI Fundamentals",
        "Natural Language Processing Fundamentals",
    ],

    "Data Structures and Algorithms": [
        "Programming Fundamentals",
    ],

    "System Design Fundamentals": [
        "Data Structures and Algorithms",
    ],
}


# ============================================================
# SEED FUNCTION
# ============================================================

def seed_database():
    db: Session = SessionLocal()

    try:
        print("Starting database seeding...")

        # ----------------------------------------------------
        # 1. Skills
        # ----------------------------------------------------

        skill_map = {}

        for skill_data in SKILLS:

            existing_skill = (
                db.query(Skill)
                .filter(Skill.name == skill_data["name"])
                .first()
            )

            if existing_skill:
                skill = existing_skill
            else:
                skill = Skill(**skill_data)
                db.add(skill)
                db.flush()

            skill_map[skill.name] = skill

        print(f"✓ Skills processed: {len(skill_map)}")

        # ----------------------------------------------------
        # 2. Courses
        # ----------------------------------------------------

        course_map = {}

        for course_data in COURSES:

            existing_course = (
                db.query(Course)
                .filter(Course.title == course_data["title"])
                .first()
            )

            if existing_course:
                course = existing_course
            else:
                course = Course(**course_data)
                db.add(course)
                db.flush()

            course_map[course.title] = course

        print(f"✓ Courses processed: {len(course_map)}")

        # ----------------------------------------------------
        # 3. Course -> Skill mappings
        # ----------------------------------------------------

        skill_mapping_count = 0

        for course_title, skills in COURSE_SKILLS.items():

            course = course_map[course_title]

            for skill_name, importance in skills:

                skill = skill_map[skill_name]

                existing_mapping = (
                    db.query(CourseSkill)
                    .filter(
                        CourseSkill.course_id == course.id,
                        CourseSkill.skill_id == skill.id,
                    )
                    .first()
                )

                if not existing_mapping:

                    mapping = CourseSkill(
                        course_id=course.id,
                        skill_id=skill.id,
                        importance=importance,
                    )

                    db.add(mapping)
                    skill_mapping_count += 1

        print(
            f"✓ Course-skill mappings added: "
            f"{skill_mapping_count}"
        )

        # ----------------------------------------------------
        # 4. Prerequisites
        # ----------------------------------------------------

        prerequisite_count = 0

        for course_title, prerequisites in PREREQUISITES.items():

            course = course_map[course_title]

            for prerequisite_title in prerequisites:

                prerequisite_course = course_map[
                    prerequisite_title
                ]

                existing_prerequisite = (
                    db.query(CoursePrerequisite)
                    .filter(
                        CoursePrerequisite.course_id
                        == course.id,

                        CoursePrerequisite.prerequisite_course_id
                        == prerequisite_course.id,
                    )
                    .first()
                )

                if not existing_prerequisite:

                    prerequisite = CoursePrerequisite(
                        course_id=course.id,
                        prerequisite_course_id=prerequisite_course.id,
                    )

                    db.add(prerequisite)

                    prerequisite_count += 1

        print(
            f"✓ Prerequisites added: "
            f"{prerequisite_count}"
        )

        # ----------------------------------------------------
        # Commit
        # ----------------------------------------------------

        db.commit()

        print("\n===================================")
        print("Database seeding completed!")
        print("===================================")

    except Exception as e:

        db.rollback()

        print("\nERROR while seeding database:")
        print(e)

        raise

    finally:
        db.close()


# ============================================================
# ENTRY POINT
# ============================================================

if __name__ == "__main__":
    seed_database()