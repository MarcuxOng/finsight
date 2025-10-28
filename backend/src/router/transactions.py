from fastapi import APIRouter, Depends, HTTPException, status
from typing import Optional
from datetime import date

from src.utils.auth import get_current_user_id
from src.services.transactions import (
    create_transaction, 
    get_transactions, 
    get_transaction_by_id,
    update_transaction, 
    delete_transaction
)
from src.services.categorization import categorize_transactions_batch, suggest_category
from src.utils.schema import TransactionCreate, TransactionFilter

router = APIRouter(prefix="/transactions", tags=["Transactions"])


@router.post("", status_code=status.HTTP_201_CREATED)
async def add_transaction(
    transaction: TransactionCreate,
    user_id: str = Depends(get_current_user_id)
):
    """Create a new transaction."""
    return await create_transaction(user_id, transaction)


@router.get("")
async def list_transactions(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    category: Optional[str] = None,
    type: Optional[str] = None,
    user_id: str = Depends(get_current_user_id)
):
    """Get all transactions for the current user."""
    filters = TransactionFilter(
        start_date=start_date,
        end_date=end_date,
        category=category,
        type=type
    )
    return await get_transactions(user_id, filters)


@router.get("/{transaction_id}")
async def get_transaction(
    transaction_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """Get a specific transaction."""
    transaction = await get_transaction_by_id(user_id, transaction_id)
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return transaction


@router.put("/{transaction_id}")
async def modify_transaction(
    transaction_id: str,
    updates: dict,
    user_id: str = Depends(get_current_user_id)
):
    """Update a transaction."""
    transaction = await update_transaction(user_id, transaction_id, updates)
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return transaction


@router.delete("/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_transaction(
    transaction_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """Delete a transaction."""
    deleted = await delete_transaction(user_id, transaction_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Transaction not found")


@router.post("/categorize")
async def categorize_all_transactions(
    user_id: str = Depends(get_current_user_id)
):
    """Categorize all uncategorized transactions."""
    result = await categorize_transactions_batch(user_id)
    return result


@router.post("/suggest-category")
async def get_category_suggestion(
    description: str,
    amount: float,
    user_id: str = Depends(get_current_user_id)
):
    """Get category suggestion for a transaction."""
    return await suggest_category(description, amount)
