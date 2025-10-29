# FinSight - AI-Powered Financial Insights

Transform your raw financial data into **narrative insights** with AI. FinSight analyzes your spending patterns and provides actionable recommendations in plain English.

![Project Status](https://img.shields.io/badge/status-in%20development-yellow)
![Python](https://img.shields.io/badge/python-3.10+-blue)
![Next.js](https://img.shields.io/badge/next.js-16.0-black)

## 🌟 What is FinSight?

FinSight is an intelligent financial management platform that leverages artificial intelligence to help you understand your spending habits, identify trends, and receive personalized financial advice. Upload your transaction data, and let AI do the heavy lifting of categorization, analysis, and insight generation.

## ✨ Key Features

### 🤖 AI-Powered Categorization
Automatically categorize your transactions using Google Gemini AI. No manual tagging required—our AI understands the context of your purchases and assigns appropriate categories.

### 💡 Smart Insights
Receive personalized financial advice based on your spending patterns. The AI analyzes your transaction history and provides actionable recommendations to improve your financial health.

### 🔍 Anomaly Detection
Identify unusual spending patterns automatically. FinSight alerts you when transactions deviate from your normal behavior, helping you catch unexpected charges or changing spending habits.

### 📈 Trend Analysis
Compare your spending across different months with interactive visual charts. Understand how your expenses evolve over time and identify areas where you can save.

### 📊 CSV Import
Bulk import transactions from your bank statement in CSV format. Simply download your bank's transaction export and upload it to FinSight.

### 🔐 Secure Authentication
Your financial data is protected with industry-standard authentication via Supabase, ensuring only you have access to your information.

## 🏗️ Architecture Overview

FinSight is built with a modern, scalable architecture:

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

## 📊 Application Features

### Dashboard
Your financial command center showing:
- Total income and expenses for the selected period
- Category-wise spending breakdown
- Recent transactions
- Latest AI-generated insights

### Transaction Management
- View all your transactions in a searchable, filterable list
- Filter by date range, category, or transaction type
- Add, edit, or delete individual transactions
- Automatic AI categorization for new entries

### Analytics
- **Summary Statistics**: Total income, expenses, and savings rate
- **Category Breakdown**: Pie charts showing spending by category
- **Monthly Trends**: Line graphs comparing spending across months
- **Anomaly Alerts**: Unusual transactions flagged for your review

### AI Insights
Generate personalized financial insights including:
- **Spending Trends**: Patterns identified in your transaction history
- **Savings Advice**: Recommendations on how to optimize your budget
- **Budget Alerts**: Warnings about categories with increasing spend
- **Financial Summary**: Overall assessment of your financial health

### CSV Upload
- Upload bank statements in CSV format
- Automatic parsing and validation
- Bulk categorization using AI
- Preview before confirming import
- Download template to ensure format compatibility

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

## 🔒 Security & Privacy

FinSight takes your financial data security seriously:

- **Row Level Security (RLS)**: Database-level access control ensures users can only access their own data
- **JWT Authentication**: Industry-standard token-based authentication
- **Encrypted Communication**: All API requests use HTTPS encryption
- **No Data Sharing**: Your financial data is never shared with third parties
- **Secure Storage**: Passwords are hashed, and sensitive credentials are environment-protected

## 💾 Data Model

### Transactions
Each transaction represents a single financial event:
- **ID**: Unique identifier
- **User ID**: Links transaction to user account
- **Date**: When the transaction occurred
- **Description**: What the transaction was for
- **Amount**: Transaction value (positive for income, can be positive or negative)
- **Category**: AI-generated or user-assigned category
- **Type**: Income or expense
- **Source**: Where the transaction came from (manual, CSV, etc.)

### Insights
AI-generated financial recommendations:
- **ID**: Unique identifier
- **User ID**: Links insight to user account
- **Generated At**: When the insight was created
- **Content**: The actual insight text
- **Type**: Classification (trend, advice, alert, summary)

## 📝 CSV Import Format

FinSight supports CSV imports with the following format:

**Required Columns:**
- `date` - Transaction date (YYYY-MM-DD format)
- `description` - Transaction description
- `amount` - Transaction amount (positive for income, positive for expenses too)
- `type` - Transaction type: "income" or "expense"

**Example:**
```csv
date,description,amount,type
2024-01-15,Starbucks Coffee,4.50,expense
2024-01-16,Monthly Salary,3000.00,income
2024-01-17,Uber Ride,12.30,expense
2024-01-18,Freelance Payment,500.00,income
```

## 🎯 Use Cases

FinSight is perfect for:
- **Personal Finance Management**: Track your daily expenses and income
- **Budget Planning**: Understand where your money goes each month
- **Savings Goals**: Identify areas to cut back and save more
- **Expense Analysis**: Discover spending patterns you didn't know existed
- **Financial Health Checkups**: Regular insights to keep your finances on track


---

**FinSight** - Empowering better financial decisions through AI

For technical documentation, please refer to the backend and frontend README files in their respective directories.
