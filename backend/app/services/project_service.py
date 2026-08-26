PROJECTS = {

    "Python": {
        "title": "Python Data Processing Project",
        "hours": 5
    },

    "Statistics": {
        "title": "Statistical Analysis Mini Project",
        "hours": 5
    },

    "Data Analysis": {
        "title": "Exploratory Data Analysis Project",
        "hours": 8
    },

    "Machine Learning": {
        "title": "Machine Learning Prediction Project",
        "hours": 10
    },

    "Deep Learning": {
        "title": "Image Classification Project",
        "hours": 12
    },

    "NLP": {
        "title": "NLP Text Classification Project",
        "hours": 10
    },

    "Generative AI": {
        "title": "RAG-Based AI Assistant Project",
        "hours": 12
    },

    "React": {
        "title": "Interactive React Dashboard",
        "hours": 8
    },

    "SQL": {
        "title": "SQL Analytics Project",
        "hours": 6
    }
}


def get_project_for_skill(
    skill_name: str
):

    return PROJECTS.get(
        skill_name
    )