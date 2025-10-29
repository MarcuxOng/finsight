// Type definitions for the application

export interface User {
  id: string;
  email: string;
  username: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  source: string;
  created_at: string;
}

export interface CategorySpending {
  category: string;
  total: number;
  count: number;
  percentage: number;
}

export interface SpendingSummary {
  total_income: number;
  total_expense: number;
  net: number;
  categories: CategorySpending[];
  period: {
    start: string;
    end: string;
  };
}

export interface Insight {
  id: string;
  user_id: string;
  generated_at: string;
  content: string;
  type: 'trend' | 'advice' | 'alert' | 'summary';
}

export interface Anomaly {
  transaction: Transaction;
  z_score: number;
  category_average: number;
  reason: string;
}

export interface MonthlyData {
  month: string;
  total_income: number;
  total_expense: number;
  net: number;
  top_categories: CategorySpending[];
}

export interface TrendData {
  expense_change_percent: number;
  income_change_percent: number;
  expense_direction: 'increased' | 'decreased';
  income_direction: 'increased' | 'decreased';
}

export interface InsightsResponse {
  summary: string;
  insights: string[];
  recommendations: string[];
  generated_at: string;
  data_summary: SpendingSummary;
  anomalies?: Anomaly[];
}
