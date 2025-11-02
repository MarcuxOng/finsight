# FinSight - AI-Powered Financial Insights

Transform your raw financial data into **narrative insights** with AI. FinSight analyzes your spending patterns and provides actionable recommendations in plain English.

![Project Status](https://img.shields.io/badge/status-in%20development-yellow)
![Python](https://img.shields.io/badge/python-3.10+-blue)
![Next.js](https://img.shields.io/badge/next.js-16.0-black)

## 🌟 What is FinSight?

FinSight is an intelligent financial management platform that leverages artificial intelligence to help you understand your spending habits, identify trends, and receive personalized financial advice. Upload your transaction data, and let AI do the heavy lifting of categorization, analysis, and insight generation.

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
- **Anomaly Alerts**: Unusual transactions flagged for your review (WIP)

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

## ✨ Key Features

### 🤖 AI-Powered Categorization
Automatically categorize your transactions using Google Gemini AI. No manual tagging required—our AI understands the context of your purchases and assigns appropriate categories.

### 💡 Smart Insights
Receive personalized financial advice based on your spending patterns. The AI analyzes your transaction history and provides actionable recommendations to improve your financial health.

### 🔐 Secure Authentication
Your financial data is protected with industry-standard authentication via Supabase, ensuring only you have access to your information.

### 🔍 Anomaly Detection (WIP)
Identify unusual spending patterns automatically. FinSight alerts you when transactions deviate from your normal behavior, helping you catch unexpected charges or changing spending habits.

## 🔒 Security & Privacy

FinSight takes your financial data security seriously:

- **Row Level Security (RLS)**: Database-level access control ensures users can only access their own data
- **JWT Authentication**: Industry-standard token-based authentication
- **Encrypted Communication**: All API requests use HTTPS encryption
- **No Data Sharing**: Your financial data is never shared with third parties
- **Secure Storage**: Passwords are hashed, and sensitive credentials are environment-protected

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
