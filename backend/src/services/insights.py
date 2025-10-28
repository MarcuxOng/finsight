"""
AI-powered insights generation service.
"""
import google.generativeai as genai
from datetime import datetime
from typing import Dict, List

from src.config import settings
from src.database import get_supabase_admin
from src.services.analytics import get_spending_summary, detect_anomalies, compare_monthly_trends

# Configure Gemini
genai.configure(api_key=settings.gemini_api_key)


async def generate_insights(user_id: str, period: str = "month") -> Dict:
    """
    Generate AI-powered financial insights for a user.
    
    Args:
        user_id: User ID
        period: Analysis period ('week', 'month', 'quarter', 'year')
        
    Returns:
        Dictionary with insights and recommendations
    """
    # Gather financial data
    summary = await get_spending_summary(user_id)
    anomalies = await detect_anomalies(user_id)
    trends = await compare_monthly_trends(user_id, months=3)
    
    # Prepare data for AI analysis
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

    # Generate insights using Gemini
    try:
        model = genai.GenerativeModel(settings.gemini_model)
        
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

        response = model.generate_content(prompt)
        
        # Parse the response
        import json
        insights_data = json.loads(response.text.strip().replace("```json", "").replace("```", ""))
                
        # Save insights to database
        supabase = get_supabase_admin()
        
        # Save summary
        result_summary = supabase.table("insights").insert({
            "user_id": user_id,
            "content": insights_data["summary"],
            "type": "summary",
            "generated_at": datetime.now().isoformat()
        }).execute()
        
        # Save individual insights
        for i, insight in enumerate(insights_data["insights"]):
            result_insight = supabase.table("insights").insert({
                "user_id": user_id,
                "content": insight,
                "type": "trend",
                "generated_at": datetime.now().isoformat()
            }).execute()
        
        # Save recommendations
        for i, recommendation in enumerate(insights_data["recommendations"]):
            result_rec = supabase.table("insights").insert({
                "user_id": user_id,
                "content": recommendation,
                "type": "advice",
                "generated_at": datetime.now().isoformat()
            }).execute()
        
        return {
            "summary": insights_data["summary"],
            "insights": insights_data["insights"],
            "recommendations": insights_data["recommendations"],
            "generated_at": datetime.now().isoformat(),
            "data_summary": summary,
            "anomalies": anomalies[:3]  # Top 3 anomalies
        }
        
    except Exception as e:
        print(f"[ERROR] Error generating insights: {e}")
        print(f"[ERROR] Error type: {type(e)}")
        import traceback
        traceback.print_exc()
        # Return fallback insights
        return {
            "summary": f"You spent ${summary['total_expense']} this period with a net of ${summary['net']}.",
            "insights": [
                f"Your top spending category is {summary['categories'][0]['category']} at ${summary['categories'][0]['total']}" if summary['categories'] else "No spending data available",
                "Track your expenses regularly to identify patterns",
                "Consider setting budget limits for each category"
            ],
            "recommendations": [
                "Review your subscriptions and cancel unused ones",
                "Set up automatic savings transfers",
                "Create a monthly budget plan"
            ],
            "generated_at": datetime.now().isoformat(),
            "data_summary": summary
        }


async def get_user_insights(user_id: str, limit: int = 10) -> List[Dict]:
    """
    Retrieve recent insights for a user, grouped by generation.
    
    Args:
        user_id: User ID
        limit: Maximum number of insight groups to return
        
    Returns:
        List of insight groups
    """
    supabase = get_supabase_admin()
    
    # Get all insights ordered by generated_at
    result = supabase.table("insights").select("*").eq("user_id", user_id).order("generated_at", desc=True).limit(limit * 7).execute()
    
    # Group insights by timestamp (within 1 minute = same generation)
    from collections import defaultdict
    from datetime import datetime
    
    grouped = defaultdict(lambda: {"summary": None, "trends": [], "advice": [], "timestamp": None})
    
    for insight in result.data:
        timestamp = insight["generated_at"]
        # Use timestamp as key (rounded to minute for grouping)
        dt = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
        key = dt.strftime("%Y-%m-%d %H:%M")
        
        if insight["type"] == "summary":
            grouped[key]["summary"] = insight
            grouped[key]["timestamp"] = timestamp
        elif insight["type"] == "trend":
            grouped[key]["trends"].append(insight)
        elif insight["type"] == "advice":
            grouped[key]["advice"].append(insight)
    
    # Convert to list and sort by timestamp
    insight_groups = []
    for key, group in grouped.items():
        if group["summary"] or group["trends"] or group["advice"]:
            insight_groups.append({
                "timestamp": group["timestamp"] or group.get("trends", [{}])[0].get("generated_at") or group.get("advice", [{}])[0].get("generated_at"),
                "summary": group["summary"],
                "trends": group["trends"],
                "advice": group["advice"]
            })
    
    # Sort by timestamp descending and limit
    insight_groups.sort(key=lambda x: x["timestamp"], reverse=True)
    return insight_groups[:limit]
