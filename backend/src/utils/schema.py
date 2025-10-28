"""
Pydantic models for request/response validation.
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Literal
from datetime import datetime, date


# ============= Auth Models =============
class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    name: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


# ============= Transaction Models =============
class TransactionCreate(BaseModel):
    date: date
    description: str
    amount: float
    category: Optional[str] = None
    type: Literal["income", "expense"] = "expense"
    source: str = "manual"


class Transaction(TransactionCreate):
    id: str
    user_id: str
    created_at: datetime


class TransactionFilter(BaseModel):
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    category: Optional[str] = None
    type: Optional[Literal["income", "expense"]] = None
    min_amount: Optional[float] = None
    max_amount: Optional[float] = None


# ============= Insight Models =============
class Insight(BaseModel):
    id: str
    user_id: str
    generated_at: datetime
    content: str
    type: Literal["trend", "advice", "alert", "summary"]


class InsightGenerate(BaseModel):
    period: Literal["week", "month", "quarter", "year", "total"] = "month"
    focus: Optional[str] = None  # e.g., "savings", "spending", "subscriptions"


# ============= CSV Upload Models =============
class CSVUploadResponse(BaseModel):
    message: str
    total_rows: int
    successful_imports: int
    failed_imports: int
    errors: List[str] = []


# ============= Category Models =============
class CategorySpending(BaseModel):
    category: str
    total: float
    count: int
    percentage: float


class SpendingSummary(BaseModel):
    total_income: float
    total_expense: float
    net: float
    categories: List[CategorySpending]
    period: str


# ============= Forecast Models =============
class ForecastItem(BaseModel):
    month: str
    category: str
    predicted_amount: float
    confidence: Optional[float] = None


class ForecastResponse(BaseModel):
    user_id: str
    generated_at: datetime
    forecasts: List[ForecastItem]
