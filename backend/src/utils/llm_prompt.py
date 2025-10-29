"""
LLM prompt templates and related utilities.
"""
from typing import Dict, List


# Categories for transaction classification
TRANSACTION_CATEGORIES = [
    "Food & Dining",
    "Transport",
    "Entertainment",
    "Shopping",
    "Bills & Utilities",
    "Healthcare",
    "Education",
    "Subscriptions",
    "Groceries",
    "Travel",
    "Personal Care",
    "Home & Garden",
    "Insurance",
    "Investments",
    "Income",
    "Other"
]


def build_financial_insights_prompt(data_context: str) -> str:
    """
    Build a prompt for generating financial insights.
    
    Args:
        data_context: String containing financial data summary
        
    Returns:
        Formatted prompt string
    """

    prompt = f"""
        You are a financial advisor analyzing a user's spending patterns. Based on the following data, provide:

        1. A brief summary of their financial situation (2-3 sentences)
        2. Three key insights about their spending habits
        3. Three actionable recommendations for improving their finances

        {data_context}

        Format your response as JSON with this structure:
        {{
        "summary": "...",
        "insights": ["...", "...", "..."],
        "recommendations": ["...", "...", "..."]
        }}

        Be specific, conversational, and encouraging. Use actual numbers from the data.
    """
    return prompt


def build_transaction_categorization_prompt(description: str, amount: float) -> str:
    """
    Build a prompt for categorizing a transaction.
    
    Args:
        description: Transaction description
        amount: Transaction amount
        
    Returns:
        Formatted prompt string
    """

    prompt = f"""
        Categorize the following transaction into ONE of these categories:
        {', '.join(TRANSACTION_CATEGORIES)}

        Transaction: {description}
        Amount: ${amount}

        Respond with ONLY the category name, nothing else.
    """
    return prompt


def format_financial_data_context(summary: Dict, trends: Dict, anomalies: List) -> str:
    """
    Format financial data into a context string for LLM prompts.
    
    Args:
        summary: Financial summary dictionary
        trends: Trends data dictionary
        anomalies: List of anomalies
        
    Returns:
        Formatted context string
    """
    
    data_context = f"""
        Financial Summary:
        - Total Income: ${summary['total_income']}
        - Total Expenses: ${summary['total_expense']}
        - Net: ${summary['net']}

        Top Spending Categories:
        {chr(10).join([f"- {cat['category']}: ${cat['total']} ({cat['percentage']}%)" for cat in summary['categories'][:5]])}

        Recent Trends:
        - Expense Change: {trends['trends'].get('expense_change_percent', 0)}% ({trends['trends'].get('expense_direction', 'stable')})
        - Income Change: {trends['trends'].get('income_change_percent', 0)}% ({trends['trends'].get('income_direction', 'stable')})

        Anomalies Detected: {len(anomalies)}
    """
    return data_context
