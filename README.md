# FinSight - AI-Powered Financial Insights

Transform your raw financial data into **narrative insights** with AI. FinSight analyzes your spending patterns and provides actionable recommendations in plain English.

![Project Status](https://img.shields.io/badge/status-in%20development-yellow)
![Python](https://img.shields.io/badge/python-3.10+-blue)
![Next.js](https://img.shields.io/badge/next.js-16.0-black)

## 🌟 Features

- **AI-Powered Categorization**: Automatically categorize transactions using Gemini AI
- **Smart Insights**: Get personalized financial advice and spending analysis
- **Anomaly Detection**: Identify unusual spending patterns automatically
- **Trend Analysis**: Compare spending across months with visual charts
- **CSV Import**: Bulk import transactions from your bank
- **Secure Authentication**: User authentication via Supabase

## 🏗️ Architecture

### Backend (FastAPI + Python)
- **FastAPI** for REST API
- **Supabase** for PostgreSQL database and authentication
- **Google Gemini AI** for categorization and insights
- **Pandas** for data processing
- **NumPy** for statistical analysis

### Frontend (Next.js + TypeScript)
- **Next.js 16** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Recharts** for data visualization
- **Supabase Auth** for user management

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- Supabase account
- Google Gemini API key

### Backend Setup

1. **Navigate to backend directory**:
```bash
cd backend
```

2. **Create virtual environment**:
```bash
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac
```

3. **Install dependencies**:
```bash
pip install -r requirements.txt
```

4. **Configure environment**:
```bash
copy .env.example .env
```

Edit `.env` with your credentials:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key
GEMINI_API_KEY=your_gemini_api_key
JWT_SECRET=your_secret_key
```

5. **Set up database** (Run these SQL commands in Supabase):

```sql
-- Create transactions table
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

-- Create insights table
CREATE TABLE insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users NOT NULL,
    generated_at TIMESTAMP DEFAULT NOW(),
    content TEXT NOT NULL,
    type TEXT CHECK (type IN ('trend', 'advice', 'alert', 'summary'))
);

-- Enable Row Level Security
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own transactions" ON transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own insights" ON insights
    FOR SELECT USING (auth.uid() = user_id);
```

6. **Run the server**:
```bash
python -m src.app
```

API will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory**:
```bash
cd frontend
```

2. **Install dependencies**:
```bash
npm install
```

3. **Configure environment**:
```bash
copy .env.local.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Run development server**:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📊 API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user

### Transactions
- `GET /transactions` - List transactions (with filters)
- `POST /transactions` - Create transaction
- `GET /transactions/{id}` - Get single transaction
- `PUT /transactions/{id}` - Update transaction
- `DELETE /transactions/{id}` - Delete transaction

### Analytics
- `GET /analytics/summary` - Get spending summary
- `GET /analytics/anomalies` - Detect anomalies
- `GET /analytics/trends` - Compare monthly trends

### Insights
- `POST /insights/generate` - Generate AI insights
- `GET /insights` - Get recent insights

### Upload
- `POST /upload/csv` - Upload CSV file
- `GET /upload/template` - Download CSV template

## 📁 Project Structure

```
finsight/
├── backend/
│   ├── src/
│   │   ├── __init__.py
│   │   ├── __main__.py
│   │   ├── app.py              # Main FastAPI app
│   │   ├── auth.py             # Authentication utilities
│   │   ├── config.py           # Configuration management
│   │   ├── database.py         # Database connection
│   │   ├── models.py           # Pydantic models
│   │   └── services/           # Business logic
│   │       ├── analytics.py    # Analytics service
│   │       ├── categorization.py  # AI categorization
│   │       ├── insights.py     # AI insights generation
│   │       ├── transactions.py # Transaction management
│   │       └── upload.py       # CSV upload handling
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── app/
│   │   ├── auth/              # Authentication pages
│   │   ├── dashboard/         # Dashboard
│   │   ├── transactions/      # Transaction views
│   │   ├── insights/          # AI insights
│   │   └── upload/            # CSV upload
│   ├── components/            # React components
│   ├── contexts/              # React contexts
│   │   └── AuthContext.tsx
│   ├── lib/
│   │   └── api.ts             # API client
│   ├── types/
│   │   └── index.ts           # TypeScript types
│   ├── package.json
│   └── .env.local.example
│
└── finsight.txt               # Project documentation
```

## 🔒 Security

- **Row Level Security (RLS)** enabled on all Supabase tables
- **JWT-based authentication** with Supabase Auth
- **API rate limiting** (recommended for production)
- **Environment variables** for sensitive data

## 🎯 Roadmap

- [ ] Add forecasting with Prophet/statsmodels
- [ ] Implement category budget limits
- [ ] Add multi-currency support
- [ ] Create mobile app (React Native)
- [ ] Add bank API integration (Plaid)
- [ ] Build custom ML model for categorization
- [ ] Add export functionality (PDF reports)
- [ ] Implement sharing/collaboration features

## 📝 CSV Format

Expected CSV format for upload:

```csv
date,description,amount,type
2024-01-15,Starbucks Coffee,4.50,expense
2024-01-16,Salary Deposit,3000.00,income
2024-01-17,Uber Ride,12.30,expense
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- **FastAPI** for the excellent Python web framework
- **Next.js** for the powerful React framework
- **Supabase** for backend infrastructure
- **Google Gemini** for AI capabilities
- **Vercel** for hosting inspiration

## 📧 Contact

For questions or feedback, please open an issue on GitHub.

---

**Made with ❤️ for better financial health**
