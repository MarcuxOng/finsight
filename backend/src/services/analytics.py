"""
Analytics service for financial data analysis.
"""
from datetime import datetime, timedelta, date
from typing import List, Dict, Optional
from collections import defaultdict
import numpy as np

from src.database import get_supabase_admin


async def get_spending_summary(
    user_id: str,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None
) -> Dict:
    """
    Get spending summary for a user within a date range.
    
    Args:
        user_id: User ID
        start_date: Start date for analysis
        end_date: End date for analysis
        
    Returns:
        Dictionary with spending summary
    """
    supabase = get_supabase_admin()
    
    # If no dates provided, get all transactions
    # Otherwise use the specified date range
    query = supabase.table("transactions").select("*").eq("user_id", user_id)
    
    if start_date:
        query = query.gte("date", start_date.isoformat())
    if end_date:
        query = query.lte("date", end_date.isoformat())
    
    result = query.execute()
    transactions = result.data
    
    # Calculate totals
    total_income = sum(t["amount"] for t in transactions if t["type"] == "income")
    total_expense = sum(t["amount"] for t in transactions if t["type"] == "expense")
    
    # Group by category
    category_totals = defaultdict(lambda: {"total": 0.0, "count": 0})
    
    for t in transactions:
        if t["type"] == "expense":
            category_totals[t["category"]]["total"] += t["amount"]
            category_totals[t["category"]]["count"] += 1
    
    # Calculate percentages
    categories = []
    for category, data in category_totals.items():
        percentage = (data["total"] / total_expense * 100) if total_expense > 0 else 0
        categories.append({
            "category": category,
            "total": round(data["total"], 2),
            "count": data["count"],
            "percentage": round(percentage, 2)
        })
    
    # Sort by total
    categories.sort(key=lambda x: x["total"], reverse=True)
    
    # Determine period for response
    if transactions:
        # Get actual date range from transactions
        dates = [datetime.fromisoformat(t["date"].replace('Z', '+00:00')).date() if isinstance(t["date"], str) else t["date"] for t in transactions]
        actual_start = min(dates)
        actual_end = max(dates)
        period_start = start_date.isoformat() if start_date else actual_start.isoformat()
        period_end = end_date.isoformat() if end_date else actual_end.isoformat()
    else:
        # No transactions, use provided dates or current date
        period_start = start_date.isoformat() if start_date else datetime.now().date().isoformat()
        period_end = end_date.isoformat() if end_date else datetime.now().date().isoformat()
    
    return {
        "total_income": round(total_income, 2),
        "total_expense": round(total_expense, 2),
        "net": round(total_income - total_expense, 2),
        "categories": categories,
        "period": {
            "start": period_start,
            "end": period_end
        }
    }


async def detect_anomalies(user_id: str) -> List[Dict]:
    """
    Detect unusual spending patterns using statistical methods.
    
    Args:
        user_id: User ID
        
    Returns:
        List of anomalous transactions
    """
    supabase = get_supabase_admin()
    
    # Get last 90 days of transactions
    start_date = (datetime.now() - timedelta(days=90)).date()
    
    query = supabase.table("transactions").select("*").eq("user_id", user_id)
    query = query.gte("date", start_date.isoformat()).eq("type", "expense")
    
    result = query.execute()
    transactions = result.data
    
    if len(transactions) < 10:
        return []  # Not enough data for anomaly detection
    
    # Group by category and find outliers using z-score
    anomalies = []
    category_groups = defaultdict(list)
    
    for t in transactions:
        category_groups[t["category"]].append(t)
    
    for category, cat_transactions in category_groups.items():
        if len(cat_transactions) < 5:
            continue
        
        amounts = [t["amount"] for t in cat_transactions]
        mean = np.mean(amounts)
        std = np.std(amounts)
        
        if std == 0:
            continue
        
        # Find transactions with z-score > 2 (outliers)
        for t in cat_transactions:
            z_score = (t["amount"] - mean) / std
            if z_score > 2:
                anomalies.append({
                    "transaction": t,
                    "z_score": round(z_score, 2),
                    "category_average": round(mean, 2),
                    "reason": f"Unusually high {category} expense"
                })
    
    # Sort by z-score
    anomalies.sort(key=lambda x: x["z_score"], reverse=True)
    
    return anomalies[:10]  # Return top 10 anomalies


async def compare_monthly_trends(user_id: str, months: int = 3) -> Dict:
    """
    Compare spending trends across recent months.
    
    Args:
        user_id: User ID
        months: Number of months to compare
        
    Returns:
        Dictionary with monthly comparison data
    """
    supabase = get_supabase_admin()
    
    monthly_data = []
    
    for i in range(months):
        # Calculate month boundaries - go back i months from current month
        current_date = datetime.now()
        # Calculate target month
        target_month = current_date.month - i
        target_year = current_date.year
        
        # Handle year rollover
        while target_month <= 0:
            target_month += 12
            target_year -= 1
        
        # Get first day of target month
        start_date = datetime(target_year, target_month, 1).date()
        
        # Get last day of target month
        if target_month == 12:
            end_date = datetime(target_year + 1, 1, 1).date() - timedelta(days=1)
        else:
            end_date = datetime(target_year, target_month + 1, 1).date() - timedelta(days=1)
        
        # Get month name
        month_name = start_date.strftime("%B %Y")
        
        # Get spending summary for this month
        summary = await get_spending_summary(
            user_id,
            start_date,
            end_date
        )
        
        monthly_data.append({
            "month": month_name,
            "total_income": summary["total_income"],
            "total_expense": summary["total_expense"],
            "net": summary["net"],
            "top_categories": summary["categories"][:5]  # Top 5 categories
        })
    
    # Calculate trends (compare most recent month to previous)
    trends = {}
    if len(monthly_data) >= 2:
        current = monthly_data[0]
        previous = monthly_data[1]
        
        expense_change = ((current["total_expense"] - previous["total_expense"]) / previous["total_expense"] * 100) if previous["total_expense"] > 0 else 0
        income_change = ((current["total_income"] - previous["total_income"]) / previous["total_income"] * 100) if previous["total_income"] > 0 else 0
        
        trends = {
            "expense_change_percent": round(expense_change, 2),
            "income_change_percent": round(income_change, 2),
            "expense_direction": "increased" if expense_change > 0 else "decreased",
            "income_direction": "increased" if income_change > 0 else "decreased"
        }
    
    return {
        "monthly_data": monthly_data,
        "trends": trends
    }
