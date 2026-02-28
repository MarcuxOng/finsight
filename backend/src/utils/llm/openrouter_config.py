import requests
import json

from src.config import settings

def openrouter_config(prompt: str):
    response = requests.post(
        url=settings.openrouter_url,
        headers={
            "Authorization": f"Bearer {settings.openrouter_api_key}",
            "Content-Type": "application/json"
        },
        data=json.dumps({
            "model": settings.openrouter_model,
            "messages": [
                {
                    "role": "user",
                    "content": prompt
                }
            ],

        })
    ).json()

    output = response["choices"][0]["message"]["content"]

    return output