"""
Transaction categorization service using AI.
"""
import google.generativeai as genai
from typing import List, Dict

from src.config import settings
from src.database import get_supabase_admin
from src.utils.llm_prompt import build_transaction_categorization_prompt, TRANSACTION_CATEGORIES

# Configure Gemini
genai.configure(api_key=settings.gemini_api_key)


async def categorize_transaction(description: str, amount: float) -> str:
    """
    Categorize a single transaction using Gemini AI.
    
    Args:
        description: Transaction description
        amount: Transaction amount
        
    Returns:
        Category name
    """
    try:
        model = genai.GenerativeModel(settings.gemini_model)
        prompt = build_transaction_categorization_prompt(description, amount)
        response = model.generate_content(prompt)
        category = response.text.strip()
        
        # Validate category
        if category in TRANSACTION_CATEGORIES:
            return category
        else:
            return "Other"
            
    except Exception as e:
        print(f"Error categorizing transaction: {e}")
        return "Other"


async def categorize_transactions_batch(user_id: str, transaction_ids: List[str] = None) -> Dict[str, int]:
    """
    Categorize multiple transactions for a user.
    
    Args:
        user_id: User ID
        transaction_ids: Optional list of specific transaction IDs to categorize
        
    Returns:
        Dictionary with count of categorized transactions
    """
    supabase = get_supabase_admin()
    
    # Get uncategorized transactions or specific ones
    if transaction_ids:
        query = supabase.table("transactions").select("*").in_("id", transaction_ids).eq("user_id", user_id)
    else:
        query = supabase.table("transactions").select("*").eq("user_id", user_id).eq("category", "Uncategorized")
    
    result = query.execute()
    transactions = result.data
    
    categorized_count = 0
    
    for transaction in transactions:
        category = await categorize_transaction(
            transaction["description"],
            transaction["amount"]
        )
        
        # Update the transaction
        supabase.table("transactions").update({"category": category}).eq("id", transaction["id"]).execute()
        categorized_count += 1
    
    return {
        "total": len(transactions),
        "categorized": categorized_count
    }


async def suggest_category(description: str, amount: float) -> Dict[str, any]:
    """
    Suggest a category for a transaction without saving.
    
    Args:
        description: Transaction description
        amount: Transaction amount
        
    Returns:
        Dictionary with category and confidence
    """
    category = await categorize_transaction(description, amount)
    
    return {
        "category": category,
        "confidence": 0.85,  # Placeholder - could be enhanced with actual confidence scoring
        "alternatives": []  # Could be enhanced to return alternative categories
    }
