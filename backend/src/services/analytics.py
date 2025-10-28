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
    
    # Default to current month if no dates provided
    if not start_date:
        start_date = datetime.now().replace(day=1).date()
    if not end_date:
        end_date = datetime.now().date()
    
    # Get transactions
    query = supabase.table("transactions").select("*").eq("user_id", user_id)
    query = query.gte("date", start_date.isoformat()).lte("date", end_date.isoformat())
    
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
    
    return {
        "total_income": round(total_income, 2),
        "total_expense": round(total_expense, 2),
        "net": round(total_income - total_expense, 2),
        "categories": categories,
        "period": {
            "start": start_date.isoformat(),
            "end": end_date.isoformat()
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
        # Calculate month boundaries
        end_date = datetime.now().replace(day=1) - timedelta(days=i * 30)
        start_date = end_date.replace(day=1)
        
        # Get month name
        month_name = end_date.strftime("%B %Y")
        
        # Get spending summary for this month
        summary = await get_spending_summary(
            user_id,
            start_date.date(),
            end_date.date()
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
