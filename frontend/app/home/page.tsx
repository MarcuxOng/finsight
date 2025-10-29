'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import type { SpendingSummary } from '@/types';
import AppLayout from '@/components/AppLayout';
import Loading from '@/components/Loading';

export default function HomePage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [summary, setSummary] = useState<SpendingSummary | null>(null);
    const [insightGroups, setInsightGroups] = useState<any[]>([]);
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
            api.getInsights(2), // Get 2 most recent insight groups
        ]);
        setSummary(summaryData as SpendingSummary);
        
        // Store grouped insights for dashboard display
        if (Array.isArray(insightsData)) {
            setInsightGroups((insightsData as any[]).slice(0, 2)); // Show 2 most recent groups
        }
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (authLoading || loading) {
        return <Loading message="Loading home..." />;
    }

    return (
        <AppLayout
            title={`Hello ${user?.username}`}
            description=""
            actions={
              <>
                <button
                  onClick={() => router.push('/transactions')}
                  className="px-6 py-3 bg-white text-[#93BFC7] font-semibold rounded-lg hover:shadow-lg transition-all"
                >
                  + Add Transaction
                </button>
                <button
                  onClick={() => router.push('/insights')}
                  className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-lg hover:bg-white/30 transition-all border border-white/30"
                >
                  ✨ Generate Insights
                </button>
              </>
            }
        >

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

            {/* Recent Insights */}
            {insightGroups.length > 0 && (
                <div className="bg-white rounded-lg shadow mt-8">
                <div className="p-6 border-b flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Insights</h3>
                    <button
                    onClick={() => router.push('/insights')}
                    className="text-sm text-[#93BFC7] hover:text-[#7da8b0] font-medium"
                    >
                    View All →
                    </button>
                </div>
                <div className="p-6">
                    <div className="space-y-6">
                    {insightGroups.map((group, groupIndex) => (
                        <div key={groupIndex} className="border-l-4 border-[#93BFC7] pl-4">
                        <div className="text-xs text-gray-500 mb-3">
                            {new Date(group.timestamp).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            })}
                        </div>
                        
                        {/* Summary */}
                        {group.summary && (
                            <div className="mb-3">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-lg">📊</span>
                                <span className="text-xs font-medium text-gray-600">Summary</span>
                            </div>
                            <p className="text-sm text-gray-700 leading-relaxed ml-6 line-clamp-2">
                                {group.summary.content}
                            </p>
                            </div>
                        )}
                        
                        {/* Trends - Show first 2 */}
                        {group.trends && group.trends.length > 0 && (
                            <div className="mb-3">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-lg">📈</span>
                                <span className="text-xs font-medium text-gray-600">
                                Key Insights ({group.trends.length})
                                </span>
                            </div>
                            <ul className="ml-6 space-y-1">
                                {group.trends.slice(0, 2).map((trend: any, idx: number) => (
                                <li key={idx} className="text-sm text-gray-700 leading-relaxed flex gap-2">
                                    <span className="text-[#ABE7B2]">•</span>
                                    <span className="line-clamp-2">{trend.content}</span>
                                </li>
                                ))}
                                {group.trends.length > 2 && (
                                <li className="text-xs text-gray-500 ml-3">
                                    +{group.trends.length - 2} more
                                </li>
                                )}
                            </ul>
                            </div>
                        )}
                        
                        {/* Advice - Show first 2 */}
                        {group.advice && group.advice.length > 0 && (
                            <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-lg">💡</span>
                                <span className="text-xs font-medium text-gray-600">
                                Recommendations ({group.advice.length})
                                </span>
                            </div>
                            <ul className="ml-6 space-y-1">
                                {group.advice.slice(0, 2).map((advice: any, idx: number) => (
                                <li key={idx} className="text-sm text-gray-700 leading-relaxed flex gap-2">
                                    <span className="text-[#CBF3BB]">•</span>
                                    <span className="line-clamp-2">{advice.content}</span>
                                </li>
                                ))}
                                {group.advice.length > 2 && (
                                <li className="text-xs text-gray-500 ml-3">
                                    +{group.advice.length - 2} more
                                </li>
                                )}
                            </ul>
                            </div>
                        )}
                        </div>
                    ))}
                    </div>
                </div>
                </div>
            )}

        </AppLayout>
    )
}