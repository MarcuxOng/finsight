'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Insight, InsightsResponse } from '@/types';
import AppLayout from '@/components/AppLayout';
import Loading from '@/components/Loading';

export default function InsightsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [period, setPeriod] = useState('month');
  const [latestGeneration, setLatestGeneration] = useState<InsightsResponse | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }
    if (user) {
      fetchInsights();
    }
  }, [user, authLoading]);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.getInsights(20) as Insight[];
      setInsights(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load insights');
      console.error('Error fetching insights:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateInsights = async () => {
    try {
      setGenerating(true);
      setError('');
      const response = await api.generateInsights(period) as InsightsResponse;
      setLatestGeneration(response);
      // Refresh insights list
      await fetchInsights();
    } catch (err: any) {
      setError(err.message || 'Failed to generate insights');
      console.error('Error generating insights:', err);
    } finally {
      setGenerating(false);
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'summary':
        return '📊';
      case 'trend':
        return '📈';
      case 'advice':
        return '💡';
      case 'alert':
        return '⚠️';
      default:
        return '📝';
    }
  };

  const getInsightBadgeColor = (type: string) => {
    switch (type) {
      case 'summary':
        return 'bg-[#93BFC7] text-white';
      case 'trend':
        return 'bg-[#ABE7B2] text-gray-700';
      case 'advice':
        return 'bg-[#CBF3BB] text-gray-700';
      case 'alert':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (authLoading) {
    return <Loading />;
  }

  if (!user) return null;

  return (
    <AppLayout
      title="Financial Insights"
      description="AI-powered analysis of your spending patterns and personalized recommendations"
      actions={
        <button
          onClick={handleGenerateInsights}
          disabled={generating}
          className="px-6 py-3 bg-white text-[#93BFC7] font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {generating ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            </>
          ) : (
            '✨ Generate Insights'
          )}
        </button>
      }
    >

      <br />

      {/* Generate Insights Section */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Generate New Insights
              </h2>
              <p className="text-gray-600">
                Get AI-powered analysis of your financial data and personalized recommendations
              </p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#93BFC7] text-gray-900"
                disabled={generating}
              >
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="quarter">Last Quarter</option>
                <option value="year">Last Year</option>
                <option value="total">Total (All Time)</option>
              </select>
              <button
                onClick={handleGenerateInsights}
                disabled={generating}
                className="px-6 py-2 bg-[#93BFC7] text-white rounded-lg hover:bg-[#7da8b0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {generating ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    <span>✨</span>
                    Generate Insights
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Latest Generation Results */}
        {latestGeneration && (
          <div className="mb-8 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Latest Analysis</h3>
            
            {/* Summary Card */}
            <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-[#93BFC7]">
              <div className="flex items-start gap-3">
                <span className="text-3xl">📊</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-1 bg-[#93BFC7] text-white text-sm font-medium rounded-full">
                      Summary
                    </span>
                    <span className="text-sm text-gray-500">
                      {formatDate(latestGeneration.generated_at)}
                    </span>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{latestGeneration.summary}</p>
                </div>
              </div>
            </div>

            {/* Key Insights */}
            {latestGeneration.insights && latestGeneration.insights.length > 0 && (
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-3">Key Insights</h4>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {latestGeneration.insights.map((insight, index) => (
                    <div key={index} className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-[#ABE7B2]">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">📈</span>
                        <p className="text-gray-700 text-sm leading-relaxed">{insight}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {latestGeneration.recommendations && latestGeneration.recommendations.length > 0 && (
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-3">Recommendations</h4>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {latestGeneration.recommendations.map((recommendation, index) => (
                    <div key={index} className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-[#CBF3BB]">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">💡</span>
                        <p className="text-gray-700 text-sm leading-relaxed">{recommendation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Anomalies */}
            {latestGeneration.anomalies && latestGeneration.anomalies.length > 0 && (
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-3">Unusual Transactions</h4>
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {latestGeneration.anomalies.map((anomaly, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {new Date(anomaly.transaction.date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {anomaly.transaction.description}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                              ${anomaly.transaction.amount.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {anomaly.reason}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Insights History */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Insights History</h3>
          
          {loading ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <svg className="animate-spin h-8 w-8 mx-auto text-[#93BFC7]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-gray-600 mt-4">Loading insights...</p>
            </div>
          ) : insights.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <span className="text-6xl mb-4 block">💡</span>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Insights Yet</h3>
              <p className="text-gray-600 mb-6">
                Generate your first AI-powered financial insights to get started
              </p>
              <button
                onClick={handleGenerateInsights}
                disabled={generating}
                className="px-6 py-2 bg-[#93BFC7] text-white rounded-lg hover:bg-[#7da8b0] transition-colors inline-flex items-center gap-2"
              >
                <span>✨</span>
                Generate Insights
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {insights.map((group: any, groupIndex: number) => (
                <div key={groupIndex} className="bg-white rounded-xl shadow-sm p-6">
                  <div className="text-sm text-gray-500 mb-4">
                    {formatDate(group.timestamp)}
                  </div>
                  
                  {/* Summary */}
                  {group.summary && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">📊</span>
                        <span className="px-3 py-1 bg-[#93BFC7] text-white text-sm font-medium rounded-full">
                          Summary
                        </span>
                      </div>
                      <p className="text-gray-700 leading-relaxed ml-9">
                        {group.summary.content}
                      </p>
                    </div>
                  )}
                  
                  {/* Trends */}
                  {group.trends && group.trends.length > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-2xl">📈</span>
                        <span className="px-3 py-1 bg-[#ABE7B2] text-gray-700 text-sm font-medium rounded-full">
                          Key Insights ({group.trends.length})
                        </span>
                      </div>
                      <ul className="ml-9 space-y-2">
                        {group.trends.map((trend: any, idx: number) => (
                          <li key={idx} className="text-gray-700 leading-relaxed flex gap-2">
                            <span className="text-[#ABE7B2] font-bold">•</span>
                            <span>{trend.content}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Advice */}
                  {group.advice && group.advice.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-2xl">💡</span>
                        <span className="px-3 py-1 bg-[#CBF3BB] text-gray-700 text-sm font-medium rounded-full">
                          Recommendations ({group.advice.length})
                        </span>
                      </div>
                      <ul className="ml-9 space-y-2">
                        {group.advice.map((advice: any, idx: number) => (
                          <li key={idx} className="text-gray-700 leading-relaxed flex gap-2">
                            <span className="text-[#CBF3BB] font-bold">•</span>
                            <span>{advice.content}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
    </AppLayout>
  );
}
