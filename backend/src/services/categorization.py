from typing import List, Dict

from src.database import get_supabase_admin
from src.utils.logging import *
from src.utils.prompt import categorization_prompt, CATEGORIES
from src.utils.llm.gemini_config import gemini_config


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
        log_debug("Categorizing transaction", {"description": description[:50], "amount": amount})
        
        model = gemini_config()
        prompt = categorization_prompt(description, amount)
        response = model.generate_content(prompt)
        category = response.text.strip()
        
        # Validate category
        if category in CATEGORIES:
            log_debug("Transaction categorized successfully", {"category": category})
            return category
        else:
            log_warning("AI returned invalid category, defaulting to 'Other'", {"returned_category": category, "description": description[:50]})
            return "Other"
            
    except Exception as e:
        log_error("Error categorizing transaction", error=e, context={"description": description[:50], "amount": amount})
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
    log_info("Starting batch categorization", {"user_id": user_id, "specific_ids": bool(transaction_ids)})
    
    supabase = get_supabase_admin()
    
    # Get uncategorized transactions or specific ones
    if transaction_ids:
        query = supabase.table("transactions").select("*").in_("id", transaction_ids).eq("user_id", user_id)
    else:
        query = supabase.table("transactions").select("*").eq("user_id", user_id).eq("category", "Uncategorized")
    
    result = query.execute()
    transactions = result.data
    
    log_info(f"Found transactions to categorize", {"user_id": user_id, "count": len(transactions)})
    
    categorized_count = 0
    
    for transaction in transactions:
        category = await categorize_transaction(
            transaction["description"],
            transaction["amount"]
        )
        
        # Update the transaction
        supabase.table("transactions").update({"category": category}).eq("id", transaction["id"]).execute()
        categorized_count += 1
    
    log_info("Batch categorization completed", {"user_id": user_id, "total": len(transactions), "categorized": categorized_count})
    
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
    log_debug("Suggesting category for transaction", {"description": description[:50], "amount": amount})
    
    category = await categorize_transaction(description, amount)
    
    return {
        "category": category,
        "confidence": 0.85,  # Placeholder - could be enhanced with actual confidence scoring
        "alternatives": []  # Could be enhanced to return alternative categories
    }
