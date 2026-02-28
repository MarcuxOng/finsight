from groq import Groq
from groq.types.chat import ChatCompletionUserMessageParam

from src.config import settings

def groq_config(prompt: str):
    groq = Groq(api_key=settings.groq_api_key)

    messages: list[ChatCompletionUserMessageParam] = [
        {
            "role": "user",
            "content": prompt
        }
    ]

    completion = groq.chat.completions.create(
        model=settings.groq_model,
        messages=messages,
        temperature=0.3,
        max_completion_tokens=4096,
        top_p=0.95,
        stream=True,
        stop=None
    )

    for chunk in completion:
        output = chunk.choices[0].delta.content or ""

    return output