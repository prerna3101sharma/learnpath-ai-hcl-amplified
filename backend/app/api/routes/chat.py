from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)

from sqlalchemy.orm import Session

from app.core.database import get_db

from app.schemas.chat import (
    ChatRequest,
    ChatResponse
)

from app.services.chat_service import (
    generate_ai_response
)


router = APIRouter(
    prefix="/api/chat",
    tags=["AI Assistant"]
)


@router.post(
    "",
    response_model=ChatResponse
)
def chat(
    request: ChatRequest,
    db: Session = Depends(get_db)
):

    try:

        result = generate_ai_response(
            db=db,
            user_id=request.user_id,
            user_message=request.message,
            history=request.history
        )

        return result

    except ValueError as error:

        raise HTTPException(
            status_code=404,
            detail=str(error)
        )

    except RuntimeError as error:

        raise HTTPException(
            status_code=503,
            detail=str(error)
        )

    except Exception as error:

        print(
            f"AI Chat Error: {error}"
        )

        raise HTTPException(
            status_code=500,
            detail="Unable to process AI request."
        )