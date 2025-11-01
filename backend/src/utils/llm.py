import google.generativeai as genai

from src.config import settings

def llm_config():
    genai.configure(api_key=settings.gemini_api_key)
    
    return genai.GenerativeModel(settings.gemini_model)
