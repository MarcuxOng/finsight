"""
Transaction service for managing financial transactions.
"""
from typing import List, Optional, Dict

from src.database import get_supabase
from src.utils.schema import TransactionCreate, Transaction, TransactionFilter


async def create_transaction(user_id: str, transaction: TransactionCreate) -> Dict:
    """
    Create a new transaction for a user.
    
    Args:
        user_id: The user's ID
        transaction: Transaction data
        
    Returns:
        The created transaction
    """
    supabase = get_supabase()
    
    transaction_data = {
        "user_id": user_id,
        "date": transaction.date.isoformat(),
        "description": transaction.description,
        "amount": float(transaction.amount),
        "category": transaction.category or "Uncategorized",
        "type": transaction.type,
        "source": transaction.source,
    }
    
    result = supabase.table("transactions").insert(transaction_data).execute()
    return result.data[0] if result.data else None


async def get_transactions(
    user_id: str,
    filters: Optional[TransactionFilter] = None
) -> List[Dict]:
    """
    Retrieve transactions for a user with optional filters.
    
    Args:
        user_id: The user's ID
        filters: Optional filters for transactions
        
    Returns:
        List of transactions
    """
    supabase = get_supabase()
    
    query = supabase.table("transactions").select("*").eq("user_id", user_id)
    
    if filters:
        if filters.start_date:
            query = query.gte("date", filters.start_date.isoformat())
        if filters.end_date:
            query = query.lte("date", filters.end_date.isoformat())
        if filters.category:
            query = query.eq("category", filters.category)
        if filters.type:
            query = query.eq("type", filters.type)
        if filters.min_amount is not None:
            query = query.gte("amount", filters.min_amount)
        if filters.max_amount is not None:
            query = query.lte("amount", filters.max_amount)
    
    result = query.order("date", desc=True).execute()
    return result.data


async def get_transaction_by_id(user_id: str, transaction_id: str) -> Optional[Dict]:
    """Get a specific transaction by ID."""
    supabase = get_supabase()
    
    result = supabase.table("transactions").select("*").eq("id", transaction_id).eq("user_id", user_id).execute()
    
    return result.data[0] if result.data else None


async def update_transaction(user_id: str, transaction_id: str, updates: Dict) -> Optional[Dict]:
    """Update a transaction."""
    supabase = get_supabase()
    
    result = supabase.table("transactions").update(updates).eq("id", transaction_id).eq("user_id", user_id).execute()
    
    return result.data[0] if result.data else None


async def delete_transaction(user_id: str, transaction_id: str) -> bool:
    """Delete a transaction."""
    supabase = get_supabase()
    
    result = supabase.table("transactions").delete().eq("id", transaction_id).eq("user_id", user_id).execute()
    
    return len(result.data) > 0


async def get_uncategorized_transactions(user_id: str) -> List[Dict]:
    """Get all uncategorized transactions for a user."""
    supabase = get_supabase()
    
    result = supabase.table("transactions").select("*").eq("user_id", user_id).eq("category", "Uncategorized").execute()
    
    return result.data
