# Developer Documentation

## 🏗️ Tech-Stack

### Backend (FastAPI + Python)
- **FastAPI** - High-performance REST API framework
- **Supabase** - PostgreSQL database with built-in authentication
- **Google Gemini AI** - Advanced language model for categorization and insights
- **Pandas** - Powerful data processing and analysis
- **NumPy** - Statistical analysis and anomaly detection

### Frontend (Next.js + TypeScript)
- **Next.js 16** - React framework with App Router for optimal performance
- **TypeScript** - Type-safe code for reliability
- **Tailwind CSS** - Modern, responsive styling
- **Recharts** - Interactive data visualization
- **Supabase Auth** - Seamless user authentication

## 📡 API Reference

### Authentication Endpoints

#### Register User
```
POST /auth/register
```
Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

#### Login
```
POST /auth/login
```
Authenticate and receive access token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

### Transaction Endpoints

#### List Transactions
```
GET /transactions
```
Retrieve all transactions for the authenticated user.

**Query Parameters:**
- `start_date` (optional): Filter by start date (YYYY-MM-DD)
- `end_date` (optional): Filter by end date (YYYY-MM-DD)
- `category` (optional): Filter by category
- `type` (optional): Filter by type (income/expense)

#### Create Transaction
```
POST /transactions
```
Add a new transaction.

**Request Body:**
```json
{
  "date": "2024-01-15",
  "description": "Grocery Store",
  "amount": 85.50,
  "type": "expense"
}
```

#### Get Single Transaction
```
GET /transactions/{id}
```
Retrieve details of a specific transaction.

#### Update Transaction
```
PUT /transactions/{id}
```
Update an existing transaction.

#### Delete Transaction
```
DELETE /transactions/{id}
```
Remove a transaction.

### Analytics Endpoints

#### Spending Summary
```
GET /analytics/summary
```
Get aggregate spending statistics.

**Query Parameters:**
- `start_date` (optional): Start of analysis period
- `end_date` (optional): End of analysis period

**Response:**
```json
{
  "total_income": 5000.00,
  "total_expenses": 3200.50,
  "net_savings": 1799.50,
  "by_category": {
    "Food": 800.00,
    "Transport": 350.00,
    "Entertainment": 200.50
  }
}
```

#### Detect Anomalies
```
GET /analytics/anomalies
```
Identify unusual transactions using statistical analysis.

**Response:**
```json
{
  "anomalies": [
    {
      "id": "uuid",
      "date": "2024-01-20",
      "description": "Unusual Purchase",
      "amount": 1500.00,
      "reason": "Amount is 3 standard deviations above average"
    }
  ]
}
```

#### Monthly Trends
```
GET /analytics/trends
```
Compare spending across different months.

**Query Parameters:**
- `months` (optional): Number of months to analyze (default: 6)

### Insights Endpoints

#### Generate Insights
```
POST /insights/generate
```
Create new AI-generated financial insights based on recent transactions.

**Response:**
```json
{
  "insights": [
    {
      "type": "trend",
      "content": "Your dining expenses increased by 25% this month compared to last month."
    },
    {
      "type": "advice",
      "content": "Consider setting a budget limit for entertainment spending."
    }
  ]
}
```

#### Get Recent Insights
```
GET /insights
```
Retrieve previously generated insights.

**Query Parameters:**
- `limit` (optional): Number of insights to return (default: 10)

### Upload Endpoints

#### Upload CSV
```
POST /upload/csv
```
Bulk import transactions from CSV file.

**Request:**
- Content-Type: `multipart/form-data`
- File field: `file`

**Expected CSV Format:**
```csv
date,description,amount,type
2024-01-15,Starbucks Coffee,4.50,expense
2024-01-16,Salary Deposit,3000.00,income
```

#### Download Template
```
GET /upload/template
```
Download a CSV template file with the correct format.

## 📁 System Architecture

```
FinSight Application
│
├── Backend API (FastAPI)
│   ├── Authentication Layer (Supabase Auth)
│   ├── Database Layer (PostgreSQL via Supabase)
│   ├── Business Logic Layer
│   │   ├── Transaction Management
│   │   ├── AI Categorization Service
│   │   ├── Analytics Engine
│   │   ├── Insights Generator
│   │   └── CSV Upload Handler
│   └── REST API Endpoints
│
├── Frontend Web App (Next.js)
│   ├── Authentication Pages (Login/Register)
│   ├── Dashboard (Overview)
│   ├── Transactions View (CRUD Operations)
│   ├── Insights Page (AI Recommendations)
│   ├── Upload Page (CSV Import)
│   └── Shared Components
│
└── External Services
    ├── Supabase (Database + Auth)
    └── Google Gemini AI (Categorization + Insights)
```

## 💾 Data Model

### Transactions
Each transaction represents a single financial event:
 
 | Field | Description |
 |---|---|
 | ID | Unique identifier |
 | User ID | Links transaction to user account |
 | Date | When the transaction occurred |
 | Description | What the transaction was for |
 | Amount | Transaction value (positive for income, can be positive or negative) |
 | Category | AI-generated or user-assigned category |
 | Type | Income or expense |
 | Source | Where the transaction came from (manual, CSV, etc.) |

### Insights
AI-generated financial recommendations:
 
 | Field | Description |
 |---|---|
 | ID | Unique identifier |
 | User ID | Links insight to user account |
 | Generated At | When the insight was created |
 | Content | The actual insight text |
 | Type | Classification (trend, advice, alert, summary) |