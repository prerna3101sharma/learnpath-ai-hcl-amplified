from ollama import Client, ResponseError

from app.core.config import settings


client = Client(
    host=settings.ollama_host
)


def chat_with_ollama(
    messages,
    temperature: float = 0.4
):

    try:

        response = client.chat(
            model=settings.ollama_model,

            messages=messages,

            stream=False,

            options={
                "temperature": temperature
            }
        )

        return response.message.content

    except ResponseError as error:

        raise RuntimeError(
            f"Ollama error: {error.error}"
        )

    except Exception as error:

        raise RuntimeError(
            f"Unable to connect to Ollama: {str(error)}"
        )