'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import type { SpendingSummary, Insight } from '@/types';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  const [summary, setSummary] = useState<SpendingSummary | null>(null);
  const [insights, setInsights] = useState<Insight[]>([]);
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
      const [summaryData, insightsData] = await Promise.all([
        api.getSummary(),
        api.getInsights(5)
      ]);
      setSummary(summaryData as SpendingSummary);
      setInsights(insightsData as Insight[]);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#ECF4E8]">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-[#93BFC7]">FinSight</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {user?.name}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h2>
          <p className="text-gray-600">Your financial overview at a glance</p>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm font-medium text-gray-600 mb-2">Total Income</p>
              <p className="text-3xl font-bold text-green-600">
                ${summary.total_income.toFixed(2)}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm font-medium text-gray-600 mb-2">Total Expenses</p>
              <p className="text-3xl font-bold text-red-600">
                ${summary.total_expense.toFixed(2)}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm font-medium text-gray-600 mb-2">Net</p>
              <p className={`text-3xl font-bold ${summary.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${summary.net.toFixed(2)}
              </p>
            </div>
          </div>
        )}

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

        {/* Recent Insights */}
        {insights.length > 0 && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Recent Insights</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {insights.map((insight) => (
                  <div key={insight.id} className="border-l-4 border-[#93BFC7] pl-4 py-2">
                    <span className="inline-block px-2 py-1 text-xs font-medium bg-[#CBF3BB] text-gray-800 rounded mb-2">
                      {insight.type}
                    </span>
                    <p className="text-gray-700">{insight.content}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(insight.generated_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={() => router.push('/transactions')}
            className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow text-left"
          >
            <h4 className="font-semibold text-gray-900 mb-2">View Transactions</h4>
            <p className="text-sm text-gray-600">See all your financial transactions</p>
          </button>
          <button
            onClick={() => router.push('/upload')}
            className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow text-left"
          >
            <h4 className="font-semibold text-gray-900 mb-2">Upload CSV</h4>
            <p className="text-sm text-gray-600">Import transactions from a file</p>
          </button>
          <button
            onClick={() => router.push('/insights')}
            className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow text-left"
          >
            <h4 className="font-semibold text-gray-900 mb-2">AI Insights</h4>
            <p className="text-sm text-gray-600">Get AI-powered financial advice</p>
          </button>
        </div>
      </main>
    </div>
  );
}
