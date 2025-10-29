"""
AI-powered insights generation service.
"""
import google.generativeai as genai
from datetime import datetime
from typing import Dict, List

from src.config import settings
from src.database import get_supabase_admin
from src.services.analytics import get_spending_summary, detect_anomalies, compare_monthly_trends
from src.utils.llm_prompt import build_financial_insights_prompt, format_financial_data_context

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
    data_context = format_financial_data_context(summary, trends, anomalies)

    # Generate insights using Gemini
    try:
        model = genai.GenerativeModel(settings.gemini_model)
        prompt = build_financial_insights_prompt(data_context)
        response = model.generate_content(prompt)
        
        # Parse the response
        import json
        insights_data = json.loads(response.text.strip().replace("```json", "").replace("```", ""))
                
        # Save insights to database with new schema
        supabase = get_supabase_admin()
        
        # Save as a single row with all data
        result = supabase.table("insights").insert({
            "user_id": user_id,
            "summary": insights_data["summary"],
            "trend": insights_data["insights"],  # Array of trends
            "advice": insights_data["recommendations"],  # Array of advice
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
    Retrieve recent insights for a user.
    
    Args:
        user_id: User ID
        limit: Maximum number of insights to return
        
    Returns:
        List of insights with summary, trends, and advice
    """
    supabase = get_supabase_admin()
    
    # Get insights ordered by generated_at
    result = supabase.table("insights").select("*").eq("user_id", user_id).order("generated_at", desc=True).limit(limit).execute()
    
    # Format the response to match frontend expectations
    insights = []
    for insight in result.data:
        insights.append({
            "id": insight["id"],
            "timestamp": insight["generated_at"],
            "summary": {
                "content": insight["summary"],
                "generated_at": insight["generated_at"]
            },
            "trends": [{"content": trend, "generated_at": insight["generated_at"]} for trend in insight["trend"]],
            "advice": [{"content": advice, "generated_at": insight["generated_at"]} for advice in insight["advice"]]
        })
    
    return insights
