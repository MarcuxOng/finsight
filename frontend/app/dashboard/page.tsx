'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import type { SpendingSummary, MonthlyData, TrendData, Anomaly } from '@/types';
import AppLayout from '@/components/AppLayout';
import Loading from '@/components/Loading';
import CategoryPieChart from '@/components/charts/CategoryPieChart';
import SpendingTrendsChart from '@/components/charts/SpendingTrendsChart';
import IncomeExpenseChart from '@/components/charts/IncomeExpenseChart';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [summary, setSummary] = useState<SpendingSummary | null>(null);
  const [trendsData, setTrendsData] = useState<{ monthly_data: MonthlyData[]; trends: TrendData } | null>(null);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [summaryData, trendsResponse, anomaliesData] = await Promise.all([
        api.getSummary(),
        api.getTrends(6), // Get 6 months of trend data
        api.getAnomalies() // Get anomaly alerts
      ]);
      setSummary(summaryData as SpendingSummary);
      setTrendsData(trendsResponse as { monthly_data: MonthlyData[]; trends: TrendData });
      setAnomalies(anomaliesData as Anomaly[]);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return <Loading message="Loading dashboard..." />;
  }

  return (
    <AppLayout
      title="Dashboard"
      description="Your financial overview at a glance"
    >

      {/* Top Categories */}
      {summary && summary.categories.length > 0 && (
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Top Spending Categories</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {summary.categories.slice(0, 5).map((category) => (
                <div key={category.category} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">
                        {category.category}
                      </span>
                      <span className="text-sm text-gray-600">
                        ${category.total.toFixed(2)} ({category.percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-[#ABE7B2] h-2 rounded-full"
                        style={{ width: `${category.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Charts Section */}
      {summary && trendsData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Category Pie Chart */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Spending by Category</h3>
              <p className="text-sm text-gray-600 mt-1">Distribution of your expenses</p>
            </div>
            <div className="p-6">
              <CategoryPieChart data={summary.categories} />
            </div>
          </div>

          {/* Income vs Expense Bar Chart */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Income vs Expenses</h3>
              <p className="text-sm text-gray-600 mt-1">Monthly comparison over time</p>
            </div>
            <div className="p-6">
              <IncomeExpenseChart data={trendsData.monthly_data} />
            </div>
          </div>
        </div>
      )}

      {/* Spending Trends Line Chart - Full Width */}
      {trendsData && (
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Spending Trends</h3>
            <p className="text-sm text-gray-600 mt-1">Track your income, expenses, and net balance over time</p>
          </div>
          <div className="p-6">
            <SpendingTrendsChart data={trendsData.monthly_data} />
          </div>
        </div>
      )}

      {/* Anomaly Alerts & Monthly Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Anomaly Alerts Widget */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <span className="text-xl">⚠️</span>
              Unusual Spending
            </h3>
            <p className="text-sm text-gray-600 mt-1">Transactions higher than your usual patterns</p>
          </div>
          <div className="p-6">
            {anomalies && anomalies.length > 0 ? (
              <div className="space-y-3">
                {anomalies.slice(0, 3).map((anomaly, index) => (
                  <div key={index} className="border-l-4 border-orange-400 pl-4 py-2">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-sm font-medium text-gray-900">
                        {anomaly.transaction.description}
                      </p>
                      <span className="text-sm font-bold text-red-600">
                        ${anomaly.transaction.amount.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mb-1">
                      {anomaly.reason}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>Average: ${anomaly.category_average.toFixed(2)}</span>
                      <span>•</span>
                      <span className="text-orange-600 font-medium">
                        {((anomaly.transaction.amount / anomaly.category_average - 1) * 100).toFixed(0)}% higher
                      </span>
                    </div>
                  </div>
                ))}
                {anomalies.length > 3 && (
                  <button
                    onClick={() => router.push('/transactions')}
                    className="text-sm text-[#93BFC7] hover:text-[#7da8b0] font-medium"
                  >
                    View all anomalies ({anomalies.length}) →
                  </button>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                <span className="text-4xl mb-2">✓</span>
                <p className="text-sm">No unusual spending detected</p>
                <p className="text-xs text-gray-400 mt-1">All transactions are within normal ranges</p>
              </div>
            )}
          </div>
        </div>

        {/* Monthly Comparison Widget */}
        {trendsData && trendsData.monthly_data.length >= 2 && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <span className="text-xl">📊</span>
                Monthly Comparison
              </h3>
              <p className="text-sm text-gray-600 mt-1">Current vs previous month</p>
            </div>
            <div className="p-6">
              {(() => {
                const current = trendsData.monthly_data[0];
                const previous = trendsData.monthly_data[1];
                const expenseChange = previous.total_expense > 0 
                  ? ((current.total_expense - previous.total_expense) / previous.total_expense * 100)
                  : 0;
                const incomeChange = previous.total_income > 0
                  ? ((current.total_income - previous.total_income) / previous.total_income * 100)
                  : 0;

                return (
                  <div className="space-y-4">
                    {/* Income Comparison */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">Income</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">${current.total_income.toFixed(2)}</span>
                          {incomeChange !== 0 && (
                            <span className={`text-xs font-medium px-2 py-1 rounded ${
                              incomeChange > 0 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {incomeChange > 0 ? '↑' : '↓'} {Math.abs(incomeChange).toFixed(1)}%
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">
                        Previous: ${previous.total_income.toFixed(2)}
                      </p>
                    </div>

                    {/* Expense Comparison */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">Expenses</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">${current.total_expense.toFixed(2)}</span>
                          {expenseChange !== 0 && (
                            <span className={`text-xs font-medium px-2 py-1 rounded ${
                              expenseChange > 0 
                                ? 'bg-red-100 text-red-700' 
                                : 'bg-green-100 text-green-700'
                            }`}>
                              {expenseChange > 0 ? '↑' : '↓'} {Math.abs(expenseChange).toFixed(1)}%
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">
                        Previous: ${previous.total_expense.toFixed(2)}
                      </p>
                    </div>

                    {/* Net Comparison */}
                    <div className="pt-3 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-gray-700">Net Balance</span>
                        <div className="text-right">
                          <p className={`text-lg font-bold ${
                            current.net >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            ${current.net.toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-500">
                            vs ${previous.net.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Insight */}
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-700">
                        {expenseChange > 0 
                          ? `💡 Your expenses increased by ${Math.abs(expenseChange).toFixed(1)}% this month. Consider reviewing your spending in high categories.`
                          : expenseChange < 0
                          ? `🎉 Great job! You reduced expenses by ${Math.abs(expenseChange).toFixed(1)}% compared to last month.`
                          : `📊 Your spending remained consistent with last month.`
                        }
                      </p>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
