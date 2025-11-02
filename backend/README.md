# FinSight Backend API

The FinSight backend is a high-performance REST API built with FastAPI that powers the financial insights platform. It handles transaction management, AI-powered categorization, analytics, and generates personalized financial insights.

## Overview

This backend service provides a complete financial management API with built-in AI capabilities. It uses Google Gemini AI for intelligent transaction categorization and insight generation, while Supabase handles authentication and data persistence.

## Technology Stack

- **FastAPI** - Modern Python web framework with automatic API documentation
- **Supabase** - PostgreSQL database with built-in authentication
- **Google Gemini AI** - Large language model for categorization and insights
- **Pandas** - Data manipulation and analysis
- **NumPy** - Statistical computations for anomaly detection
- **Pydantic** - Data validation and serialization

## Core Features

### 🔐 Authentication System
Integrated with Supabase Auth for secure user management:
- Supabase-issued JWT authentication
- Password hashing and validation handled by Supabase Auth
- User session management
- Row-level security enforcement

### 💳 Transaction Management
Full CRUD operations for financial transactions:
- Create, read, update, and delete transactions
- Filter by date range, category, type
- Automatic timestamping
- User-specific data isolation

### 🤖 AI Categorization
Intelligent transaction categorization using Google Gemini:
- Automatic category assignment based on transaction description
- Context-aware categorization
- Consistent category suggestions
- Bulk categorization for CSV imports

### 📊 Analytics Engine
Statistical analysis of financial data:
- **Summary Statistics**: Total income, expenses, net savings
- **Category Breakdown**: Spending distribution by category
- **Anomaly Detection**: Identifies unusual transactions using Z-score analysis
- **Trend Analysis**: Month-over-month spending comparisons

### 💡 Insights Generation
AI-powered financial recommendations:
- Spending pattern analysis
- Budget recommendations
- Savings opportunities
- Personalized financial advice

### 📤 CSV Upload Handler
Bulk transaction import system:
- CSV parsing and validation
- Automatic data type conversion
- Batch processing
- Error handling and reporting

## API Endpoints Reference

### Authentication Endpoints

#### POST `/auth/register`
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:** `201 Created`
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  },
  "access_token": "jwt_token",
  "token_type": "bearer"
}
```

**Errors:**
- `400 Bad Request` - Invalid email or password format
- `409 Conflict` - Email already registered

---

#### POST `/auth/login`
Authenticate user and receive access token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:** `200 OK`
```json
{
  "access_token": "jwt_token",
  "token_type": "bearer",
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  }
}
```

**Errors:**
- `401 Unauthorized` - Invalid credentials

---

### Transaction Endpoints

#### GET `/transactions`
List all transactions for authenticated user.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `start_date` (optional): Filter start date (YYYY-MM-DD)
- `end_date` (optional): Filter end date (YYYY-MM-DD)
- `category` (optional): Filter by category name
- `type` (optional): Filter by type (`income` or `expense`)

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "date": "2024-01-15",
    "description": "Grocery Store",
    "amount": 85.50,
    "category": "Food & Dining",
    "type": "expense",
    "source": "manual",
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

---

#### POST `/transactions`
Create a new transaction.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "date": "2024-01-15",
  "description": "Grocery Store",
  "amount": 85.50,
  "type": "expense"
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "date": "2024-01-15",
  "description": "Grocery Store",
  "amount": 85.50,
  "category": "Food & Dining",
  "type": "expense",
  "source": "manual",
  "created_at": "2024-01-15T10:30:00Z"
}
```

*Note: Category is automatically assigned by AI if not provided.*

---

#### GET `/transactions/{id}`
Get details of a specific transaction.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "date": "2024-01-15",
  "description": "Grocery Store",
  "amount": 85.50,
  "category": "Food & Dining",
  "type": "expense",
  "source": "manual",
  "created_at": "2024-01-15T10:30:00Z"
}
```

**Errors:**
- `404 Not Found` - Transaction doesn't exist or doesn't belong to user

---

#### PUT `/transactions/{id}`
Update an existing transaction.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "description": "Whole Foods Market",
  "amount": 92.30,
  "category": "Groceries"
}
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "date": "2024-01-15",
  "description": "Whole Foods Market",
  "amount": 92.30,
  "category": "Groceries",
  "type": "expense",
  "source": "manual",
  "created_at": "2024-01-15T10:30:00Z"
}
```

---

#### DELETE `/transactions/{id}`
Delete a transaction.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:** `204 No Content`

**Errors:**
- `404 Not Found` - Transaction doesn't exist or doesn't belong to user

---

### Analytics Endpoints

#### GET `/analytics/summary`
Get spending summary and statistics.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `start_date` (optional): Analysis period start (YYYY-MM-DD)
- `end_date` (optional): Analysis period end (YYYY-MM-DD)

**Response:** `200 OK`
```json
{
  "period": {
    "start_date": "2024-01-01",
    "end_date": "2024-01-31"
  },
  "summary": {
    "total_income": 5000.00,
    "total_expenses": 3200.50,
    "net_savings": 1799.50,
    "savings_rate": 0.36
  },
  "by_category": {
    "Food & Dining": 800.00,
    "Transportation": 350.00,
    "Entertainment": 200.50,
    "Shopping": 450.00,
    "Utilities": 400.00,
    "Other": 1000.00
  },
  "by_type": {
    "income": 5000.00,
    "expense": 3200.50
  }
}
```

---

#### GET `/analytics/anomalies`
Detect unusual transactions using statistical analysis.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `threshold` (optional): Z-score threshold (default: 2.5)

**Response:** `200 OK`
```json
{
  "anomalies": [
    {
      "transaction": {
        "id": "uuid",
        "date": "2024-01-20",
        "description": "Electronics Store",
        "amount": 1500.00,
        "category": "Shopping"
      },
      "anomaly_score": 3.2,
      "reason": "Amount is 3.2 standard deviations above average",
      "severity": "high"
    }
  ],
  "statistics": {
    "total_transactions": 150,
    "anomalies_found": 3,
    "average_amount": 150.00,
    "std_deviation": 200.00
  }
}
```

---

#### GET `/analytics/trends`
Compare spending trends across months.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `months` (optional): Number of months to analyze (default: 6)

**Response:** `200 OK`
```json
{
  "trends": [
    {
      "month": "2024-01",
      "total_income": 5000.00,
      "total_expenses": 3200.50,
      "net_savings": 1799.50,
      "top_categories": {
        "Food & Dining": 800.00,
        "Transportation": 350.00,
        "Entertainment": 200.50
      }
    },
    {
      "month": "2023-12",
      "total_income": 5000.00,
      "total_expenses": 2950.00,
      "net_savings": 2050.00,
      "top_categories": {
        "Food & Dining": 650.00,
        "Transportation": 300.00,
        "Shopping": 500.00
      }
    }
  ],
  "comparison": {
    "income_change": 0.0,
    "expense_change": 8.5,
    "savings_change": -12.2
  }
}
```

---

### Insights Endpoints

#### POST `/insights/generate`
Generate new AI-powered financial insights.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `days` (optional): Number of days of transaction history to analyze (default: 30)

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "summary": "Your spending this month is 15% higher than last month, primarily due to increased dining expenses.",
  "trend": {
    "spending_change": 15.0,
    "categories_increased": ["Food & Dining", "Entertainment"],
    "categories_decreased": ["Transportation"],
    "highest_category": "Food & Dining",
    "month_over_month": {
      "current_month": 3200.50,
      "previous_month": 2800.00
    }
  },
  "advice": {
    "recommendations": [
      "Consider setting a monthly budget limit of $700 for dining expenses",
      "Your transportation costs have decreased - great job on reducing commute expenses"
    ],
    "warnings": [
      "Entertainment spending increased by 30% this month"
    ],
    "opportunities": [
      "You could save $150/month by reducing dining frequency"
    ]
  },
  "generated_at": "2024-10-29T15:30:00Z",
  "metadata": {
    "transactions_analyzed": 45,
    "analysis_period": "2024-10-01 to 2024-10-29"
  }
}
```

---

#### GET `/insights`
Retrieve previously generated insights.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `limit` (optional): Maximum number of insights to return (default: 10)

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "summary": "Your spending this month is 15% higher than last month...",
    "trend": {
      "spending_change": 15.0,
      "categories_increased": ["Food & Dining", "Entertainment"],
      "highest_category": "Food & Dining"
    },
    "advice": {
      "recommendations": [
        "Consider setting a monthly budget limit of $700 for dining expenses"
      ],
      "warnings": ["Entertainment spending increased by 30% this month"]
    },
    "generated_at": "2024-10-29T15:30:00Z"
  },
  {
    "id": "uuid",
    "user_id": "uuid",
    "summary": "Overall spending is within budget this month...",
    "trend": {
      "spending_change": -5.0,
      "categories_decreased": ["Shopping", "Entertainment"]
    },
    "advice": {
      "recommendations": [
        "Great job reducing discretionary spending"
      ]
    },
    "generated_at": "2024-10-20T10:00:00Z"
  }
]
```

---

### Upload Endpoints

#### POST `/upload/csv`
Bulk import transactions from CSV file.

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

**Request Body:**
```
file: <binary CSV data>
```

**Expected CSV Format:**
```csv
date,description,amount,type
2024-01-15,Starbucks Coffee,4.50,expense
2024-01-16,Monthly Salary,3000.00,income
2024-01-17,Uber Ride,12.30,expense
```

**Response:** `200 OK`
```json
{
  "success": true,
  "imported": 3,
  "failed": 0,
  "transactions": [
    {
      "id": "uuid",
      "date": "2024-01-15",
      "description": "Starbucks Coffee",
      "amount": 4.50,
      "category": "Food & Dining",
      "type": "expense"
    }
  ],
  "errors": []
}
```

**Errors:**
- `400 Bad Request` - Invalid CSV format or missing required columns
- `413 Payload Too Large` - File exceeds size limit

---

#### GET `/upload/template`
Download a CSV template file.

**Response:** `200 OK`
```
Content-Type: text/csv
Content-Disposition: attachment; filename="finsight_template.csv"

date,description,amount,type
2024-01-15,Example Transaction,50.00,expense
```

---

## Database Schema

### `transactions` Table
Stores all financial transactions for users.

<!-- ```sql
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users NOT NULL,
    date DATE NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    category TEXT,
    type TEXT CHECK (type IN ('income', 'expense')),
    source TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Users can only access their own transactions
CREATE POLICY "Users can view own transactions" 
    ON transactions FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" 
    ON transactions FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions" 
    ON transactions FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions" 
    ON transactions FOR DELETE 
    USING (auth.uid() = user_id);
``` -->

**Columns:**
- `id` - Unique transaction identifier
- `user_id` - Reference to the user who owns this transaction
- `date` - Transaction date
- `description` - Transaction description
- `amount` - Transaction amount (always positive)
- `category` - AI-assigned or user-defined category
- `type` - Transaction type: 'income' or 'expense'
- `source` - How the transaction was created: 'manual', 'csv', etc.
- `created_at` - Timestamp when record was created

---

### `insights` Table
Stores AI-generated financial insights.

<!-- ```sql
CREATE TABLE insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users NOT NULL,
    summary TEXT NOT NULL,
    trend JSONB NOT NULL,
    advice JSONB NOT NULL,
    generated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_insights_user_id ON insights(user_id);
CREATE INDEX idx_insights_generated_at ON insights(generated_at DESC);

-- Enable Row Level Security
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;

-- Users can only access their own insights
CREATE POLICY "Users can view own insights" 
    ON insights FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own insights" 
    ON insights FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own insights" 
    ON insights FOR DELETE 
    USING (auth.uid() = user_id);
``` -->

**Columns:**
- `id` - Unique insight identifier
- `user_id` - Reference to the user who owns this insight
- `summary` - Overall financial summary text
- `trend` - Structured JSON data containing spending trends and patterns
- `advice` - Structured JSON data containing personalized financial recommendations
- `generated_at` - Timestamp with timezone when insight was generated

**Example Insight Data:**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "summary": "Your spending this month is 15% higher than last month, primarily due to increased dining expenses.",
  "trend": {
    "spending_change": 15.0,
    "categories_increased": ["Food & Dining", "Entertainment"],
    "categories_decreased": ["Transportation"],
    "highest_category": "Food & Dining",
    "month_over_month": {
      "current_month": 3200.50,
      "previous_month": 2800.00
    }
  },
  "advice": {
    "recommendations": [
      "Consider setting a monthly budget limit of $700 for dining expenses",
      "Your transportation costs have decreased - great job on reducing commute expenses"
    ],
    "warnings": [
      "Entertainment spending increased by 30% this month"
    ],
    "opportunities": [
      "You could save $150/month by reducing dining frequency"
    ]
  },
  "generated_at": "2024-10-29T10:30:00Z"
}
```

---

## Service Architecture

### `services/transactions.py`
Handles transaction CRUD operations:
- Create new transactions
- Query transactions with filters
- Update existing transactions
- Delete transactions
- Enforce user data isolation

### `services/categorization.py`
AI-powered categorization service:
- Calls Google Gemini API with transaction description
- Parses AI response to extract category
- Maintains consistency in category naming
- Handles fallback for API failures

### `services/analytics.py`
Statistical analysis engine:
- Aggregates transactions by category, type, period
- Calculates summary statistics
- Performs anomaly detection using Z-score analysis
- Generates trend comparisons

### `services/insights.py`
AI insight generation:
- Analyzes recent transaction patterns
- Identifies spending trends
- Generates personalized recommendations
- Creates actionable financial advice

### `services/upload.py`
CSV processing pipeline:
- Validates CSV format
- Parses and cleanses data
- Batch processes transactions
- Triggers AI categorization
- Returns detailed import results

---

## API Documentation

When the backend is running, interactive API documentation is available:

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

These provide:
- Complete endpoint listing
- Request/response schemas
- Interactive testing interface
- Authentication handling

---

## Error Handling

The API uses standard HTTP status codes:

- `200 OK` - Successful request
- `201 Created` - Resource successfully created
- `204 No Content` - Successful deletion
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Missing or invalid authentication
- `403 Forbidden` - Valid auth but insufficient permissions
- `404 Not Found` - Resource doesn't exist
- `409 Conflict` - Resource already exists
- `422 Unprocessable Entity` - Validation error
- `500 Internal Server Error` - Server-side error

**Error Response Format:**
```json
{
  "detail": "Error message describing what went wrong"
}
```

---

## Authentication Flow

1. **Registration**: User creates account via `/auth/register`
2. **Token Issuance**: Backend returns Supabase session access token (JWT)
3. **Authenticated Requests**: Client includes token in `Authorization` header
4. **Token Validation**: Backend validates token on each request by calling Supabase Auth (`auth.get_user`)
5. **User Context**: User ID extracted from token for data isolation

**Authorization Header Format:**
```
Authorization: Bearer <jwt_access_token>
```

Note: Tokens are minted and signed by Supabase; the backend does not self-sign JWTs.

---

## AI Integration

### Google Gemini AI
The backend uses Google's Gemini AI model for:

**Transaction Categorization:**
- Input: Transaction description
- Process: AI analyzes context and patterns
- Output: Appropriate category name

**Insight Generation:**
- Input: Transaction history and spending patterns
- Process: AI identifies trends, anomalies, and opportunities
- Output: Natural language insights and recommendations

**API Key Configuration:**
Set `GEMINI_API_KEY` in environment variables.

---

## Performance Considerations

- **Database Indexing**: Key columns (user_id, date, category) are indexed
- **Query Optimization**: Efficient filtering using database-level queries
- **Caching**: Consider implementing Redis for frequently accessed data
- **Batch Processing**: CSV imports processed in optimized batches
- **Connection Pooling**: Supabase client maintains connection pool

---

## Security Features

- **Row Level Security**: Database-enforced user data isolation
- **JWT Authentication**: Secure, stateless authentication
- **Password Hashing**: Handled by Supabase Auth; backend never stores plaintext passwords
- **CORS Configuration**: Restrict API access to authorized origins
- **Input Validation**: Pydantic models validate all input data
- **SQL Injection Protection**: Parameterized queries via ORM

---

**FinSight Backend** - Powering intelligent financial management
