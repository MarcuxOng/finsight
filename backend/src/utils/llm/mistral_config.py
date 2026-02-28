from mistralai import Mistral

from src.config import settings


def mistral_config(prompt: str):
    mistral = Mistral(api_key=settings.mistral_api_key)
    
    res = mistral.chat.complete(
        model=settings.mistral_model,
        messages=[
            {
                "role": "user",
                "content": prompt,
            },
        ],
        stream=False
    )

    output = res.choices[0].message.content
    return output