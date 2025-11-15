import google.generativeai as genai

from src.config import settings

def gemini_config(prompt: str):
    genai.configure(api_key=settings.gemini_api_key)
    model = genai.GenerativeModel(settings.gemini_model)
    output = model.generate_content(prompt)

    return output