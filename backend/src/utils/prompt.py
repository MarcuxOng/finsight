from typing import Dict, List, Any

NumberLike = Any


# Categories for transaction classification
CATEGORIES = [
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


def insights_prompt(data_context: str) -> str:
    """
    Build a prompt for generating financial insights.

    Args:
            data_context: String containing financial data summary

    Returns:
            Formatted prompt string
    """
    prompt = f"""
        You are a helpful, encouraging financial coach. Analyze the user's spending based ONLY on the data below.

        Your goals:
        1) Write a brief summary of their financial situation (2–3 sentences).
        2) Provide exactly three key insights about their spending habits.
        3) Provide exactly three actionable recommendations for improving their finances.

        Data (do not infer anything not present):
        {data_context}

        Constraints and style:
        - Output VALID JSON only. No markdown, code fences, or extra text before/after the JSON.
            • Use this EXACT structure and keys:
                {{
                    "data": {{
                        "summary": "string",
                        "insights": ["string", "string", "string"],
                        "recommendations": ["string", "string", "string"]
                    }}
                }}
        - Numbers must come from the provided data. If a number is missing, use a qualitative phrasing or omit the number.
        - When using currency, format as $1,234.56 (two decimals, thousands separators).
        - When using percentages, include one decimal place when relevant (e.g., 12.3%).
        - Each insight should reference a concrete figure or trend from the data (e.g., top category, % change, anomaly count).
        - At least one insight should note anomalies if any are present.
        - Recommendations should be SMART: give a clear action and expected impact. Where data allows, include an estimated monthly savings in parentheses at the end, e.g., "(est. $45.00/mo)".
        - Be specific, conversational, and supportive. Avoid shaming; focus on next steps.

        Example shape (values are illustrative, do NOT copy):
            {{
                "data": {{
                    "summary": "You spent more on Groceries this month while overall expenses were stable. Your net remained positive.",
                    "insights": [
                        "Groceries led spending at $642.20 (28.3% of expenses).",
                        "Expenses were up 5.2% MoM while income was stable.",
                        "2 anomalies detected, including an unusually large Transport charge."
                    ],
                    "recommendations": [
                        "Set a weekly grocery cap and switch 2 brand items to store-brand (est. $35.00/mo)",
                        "Review subscriptions >$15 and cancel/pauses low-use services (est. $12.00/mo)",
                        "Dispute or confirm the large Transport charge; if valid, plan 10% lower ride use next month"
                    ]
                }}
            }}
    """
    return prompt


def categorization_prompt(description: str, amount: float) -> str:
    """
    Build a prompt for categorizing a transaction.
    
    Args:
        description: Transaction description
        amount: Transaction amount
        
    Returns:
        Formatted prompt string
    """

    prompt = f"""
        Categorize the transaction into EXACTLY ONE of these categories:
        {', '.join(CATEGORIES)}

        Transaction description: {description}
        Amount: ${amount:,.2f}

        Guidelines:
        - Use the provided categories only; if none clearly fits, return "Other".
        - Common mappings (not exhaustive):
          • "uber", "lyft", "metro", "bus", "gas" -> Transport
          • "grocery", "supermarket", "whole foods", "trader joe", "walmart" -> Groceries
          • "netflix", "spotify", "apple music", "hulu", "prime" -> Subscriptions
          • "rent", "electric", "water", "internet", "phone" -> Bills & Utilities
          • "salary", "payroll", "direct deposit", "refund" -> Income
          • "doctor", "pharmacy", "clinic" -> Healthcare
        - Ignore merchant suffixes like city/state or transaction ids.
        - Do not infer beyond the description; amount can be a tie-breaker (very small recurring amounts may indicate Subscriptions; very large recurring amounts may indicate Bills & Utilities or Rent).

        Respond with ONLY the category name from the list above. No punctuation, quotes, or extra words.
    """
    return prompt


def format_financial_data(summary: Dict[str, Any], trends: Dict[str, Any], anomalies: List[Dict[str, Any]]) -> str:
    """
    Format financial data into a context string for LLM prompts.
    
    Args:
        summary: Financial summary dictionary
        trends: Trends data dictionary
        anomalies: List of anomalies
        
    Returns:
        Formatted context string
    """
    
    def fmt_currency(x: NumberLike) -> str:
        try:
            return f"${float(x):,.2f}"
        except Exception:
            return "$0.00"

    def fmt_percent(x: NumberLike) -> str:
        try:
            return f"{float(x):.1f}%"
        except Exception:
            return "0.0%"

    total_income = summary.get("total_income", 0)
    total_expense = summary.get("total_expense", 0)
    net = summary.get("net", (total_income or 0) - (total_expense or 0))

    categories = summary.get("categories", []) or []
    top5_lines: List[str] = []
    for cat in categories[:5]:
        cat_name = cat.get("category", "Unknown")
        cat_total = fmt_currency(cat.get("total", 0))
        cat_pct = cat.get("percentage")
        pct_str = f"{cat_pct}%" if isinstance(cat_pct, (int, float)) else str(cat_pct or "0%")
        top5_lines.append(f"- {cat_name}: {cat_total} ({pct_str})")

    t = trends.get("trends", {}) if isinstance(trends, dict) else {}
    expense_change = fmt_percent(t.get("expense_change_percent", 0))
    expense_dir = t.get("expense_direction", "stable") or "stable"
    income_change = fmt_percent(t.get("income_change_percent", 0))
    income_dir = t.get("income_direction", "stable") or "stable"

    anomalies_count = len(anomalies or [])

    data_context = f"""
        Financial Summary:
        - Total Income: {fmt_currency(total_income)}
        - Total Expenses: {fmt_currency(total_expense)}
        - Net: {fmt_currency(net)}

        Top Spending Categories:
        {chr(10).join(top5_lines) if top5_lines else "- (no categories available)"}

        Recent Trends:
        - Expense Change: {expense_change} ({expense_dir})
        - Income Change: {income_change} ({income_dir})

        Anomalies Detected: {anomalies_count}
    """
    return data_context
