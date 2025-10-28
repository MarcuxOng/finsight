# FinSight Backend

AI-powered financial insights and analysis backend built with FastAPI.

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
venv\Scripts\activate  # On Windows
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Configure environment variables:
```bash
copy .env.example .env
# Edit .env with your actual credentials
```

4. Set up Supabase database:
   - Create tables: `transactions`, `insights`, `forecasts`, `settings`
   - Enable Row Level Security (RLS)
   - Configure authentication

## Database Schema

### transactions
```sql
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
```

### insights
```sql
CREATE TABLE insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users NOT NULL,
    generated_at TIMESTAMP DEFAULT NOW(),
    content TEXT NOT NULL,
    type TEXT CHECK (type IN ('trend', 'advice', 'alert', 'summary'))
);
```

## Run the server

Development:
```bash
python -m src.app
```

or

```bash
uvicorn src.app:app --reload
```

Production:
```bash
uvicorn src.app:app --host 0.0.0.0 --port 8000
```

## API Documentation

Once running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Key Features

- **Authentication**: Supabase Auth integration
- **Transaction Management**: CRUD operations for financial transactions
- **AI Categorization**: Automatic transaction categorization using Gemini AI
- **Analytics**: Spending summaries, anomaly detection, trend analysis
- **Insights Generation**: AI-powered financial advice and recommendations
- **CSV Upload**: Bulk import transactions from CSV files

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user

### Transactions
- `GET /transactions` - List all transactions
- `POST /transactions` - Create transaction
- `GET /transactions/{id}` - Get single transaction
- `PUT /transactions/{id}` - Update transaction
- `DELETE /transactions/{id}` - Delete transaction

### Analytics
- `GET /analytics/summary` - Get spending summary
- `GET /analytics/anomalies` - Detect spending anomalies
- `GET /analytics/trends` - Compare monthly trends

### Insights
- `POST /insights/generate` - Generate AI insights
- `GET /insights` - Get recent insights

### Upload
- `POST /upload/csv` - Upload CSV file
- `GET /upload/template` - Download CSV template
