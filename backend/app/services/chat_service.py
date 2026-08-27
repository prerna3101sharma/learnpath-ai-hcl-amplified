import os

from sqlalchemy.orm import Session

from app.ai.ollama_service import chat_with_ollama
from app.core.config import settings

from app.ai.prompts import (
    SYSTEM_PROMPT,
    build_context_prompt
)

from app.services.ai_context_service import (
    build_learner_context
)


OLLAMA_MODEL = os.getenv(
    "OLLAMA_MODEL",
    getattr(settings, "ollama_model", "gemma3:4b")
)


def generate_ai_response(
    db: Session,
    user_id: int,
    user_message: str,
    history=None
):

    # ========================================================
    # 1. Build learner context
    # ========================================================

    context = build_learner_context(
        db,
        user_id
    )

    if context is None:
        raise ValueError(
            "Learner not found"
        )

    # ========================================================
    # 2. Build context-aware prompt
    # ========================================================

    context_prompt = build_context_prompt(
        context,
        user_message
    )

    # ========================================================
    # 3. Build conversation
    # ========================================================

    messages = [
        {
            "role": "system",
            "content": SYSTEM_PROMPT
        }
    ]

    # ========================================================
    # 4. Add previous conversation
    # ========================================================

    if history:

        for item in history[-10:]:

            # Support both Pydantic objects and dictionaries
            if hasattr(item, "role"):
                role = item.role
                content = item.content

            elif isinstance(item, dict):
                role = item.get("role")
                content = item.get("content")

            else:
                continue

            if role not in ["user", "assistant"]:
                continue

            if not content:
                continue

            messages.append(
                {
                    "role": role,
                    "content": content
                }
            )

    # ========================================================
    # 5. Add current question
    # ========================================================

    messages.append(
        {
            "role": "user",
            "content": context_prompt
        }
    )

    # ========================================================
    # 6. Call Ollama
    # ========================================================

    response = chat_with_ollama(
        messages=messages,
        temperature=0.4
    )

    # ========================================================
    # 7. Return response
    # ========================================================

    return {
        "user_id": int(user_id),
        "message": response,
        "model": OLLAMA_MODEL
    }