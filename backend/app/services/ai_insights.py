import requests
from dotenv import load_dotenv
import os
load_dotenv()

OLLAMA_URL = (
    "http://localhost:11434/api/generate"
)

OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "gemma3:4b")

def generate_learning_insight(
    analytics,
    learner_profile=None
):

    prompt = f"""
You are an AI learning advisor.

Analyze the following learner information.

Analytics:
{analytics}

Learner Profile:
{learner_profile}

Generate a concise personalized learning insight in 30-40 words.

Include:

1. Current learning status
2. Main strength
3. Main area needing improvement
4. Recommended next action
5. Short explanation for the recommendation

Do not invent courses that are not present
in the supplied information.

Keep the response under 180 words.
"""


    try:

        response = requests.post(
            OLLAMA_URL,
            json={
                "model": OLLAMA_MODEL,
                "prompt": prompt,
                "stream": False
            },
            timeout=120
        )


        response.raise_for_status()

        data = response.json()

        return data.get(
            "response",
            "Unable to generate insight."
        )


    except Exception as error:

        print(
            "Ollama error:",
            error
        )

        return (
            "AI insights are temporarily "
            "unavailable."
        )