'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import PageHeader from '@/components/PageHeader';

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  source: string;
  created_at: string;
}

export default function TransactionsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState<'' | 'income' | 'expense'>('');
  
  // Edit modal
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editForm, setEditForm] = useState({
    date: '',
    description: '',
    amount: '',
    category: '',
    type: 'expense' as 'income' | 'expense',
  });
  
  // Delete confirmation
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  // Create modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: '',
    category: '',
    type: 'expense' as 'income' | 'expense',
  });
  const [suggestedCategory, setSuggestedCategory] = useState<string | null>(null);
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);
  
  // Sorting
  const [sortField, setSortField] = useState<'date' | 'amount' | 'category'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user, startDate, endDate, categoryFilter, typeFilter]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params: any = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      if (categoryFilter) params.category = categoryFilter;
      if (typeFilter) params.type = typeFilter;
      
      const data = await api.getTransactions(params) as Transaction[];
      setTransactions(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: 'date' | 'amount' | 'category') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedTransactions = [...transactions].sort((a, b) => {
    let aVal: any = a[sortField];
    let bVal: any = b[sortField];
    
    if (sortField === 'date') {
      aVal = new Date(aVal).getTime();
      bVal = new Date(bVal).getTime();
    } else if (sortField === 'amount') {
      aVal = parseFloat(aVal);
      bVal = parseFloat(bVal);
    }
    
    if (sortDirection === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setEditForm({
      date: transaction.date,
      description: transaction.description,
      amount: transaction.amount.toString(),
      category: transaction.category,
      type: transaction.type,
    });
  };

  const handleSaveEdit = async () => {
    if (!editingTransaction) return;
    
    try {
      await api.updateTransaction(editingTransaction.id, {
        date: editForm.date,
        description: editForm.description,
        amount: parseFloat(editForm.amount),
        category: editForm.category,
        type: editForm.type,
      });
      
      setEditingTransaction(null);
      fetchTransactions();
    } catch (err: any) {
      alert(`Failed to update transaction: ${err.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteTransaction(id);
      fetchTransactions();
      setDeletingId(null);
    } catch (err: any) {
      alert(`Failed to delete transaction: ${err.message}`);
    }
  };

  const handleClearFilters = () => {
    setStartDate('');
    setEndDate('');
    setCategoryFilter('');
    setTypeFilter('');
  };

  const handleSuggestCategory = async () => {
    if (!createForm.description || !createForm.amount) {
      return;
    }
    
    try {
      setLoadingSuggestion(true);
      const params = new URLSearchParams({
        description: createForm.description,
        amount: createForm.amount,
      });
      const response = await api.request<{ category: string }>(
        `/transactions/suggest-category?${params.toString()}`,
        {
          method: 'POST',
        }
      );
      setSuggestedCategory(response.category);
      setCreateForm({ ...createForm, category: response.category });
    } catch (err: any) {
      console.error('Failed to get category suggestion:', err);
    } finally {
      setLoadingSuggestion(false);
    }
  };

  const handleCreateTransaction = async () => {
    if (!createForm.date || !createForm.description || !createForm.amount) {
      alert('Please fill in all required fields');
      return;
    }
    
    try {
      await api.createTransaction({
        date: createForm.date,
        description: createForm.description,
        amount: parseFloat(createForm.amount),
        category: createForm.category || 'Uncategorized',
        type: createForm.type,
        source: 'manual',
      });
      
      // Reset form
      setCreateForm({
        date: new Date().toISOString().split('T')[0],
        description: '',
        amount: '',
        category: '',
        type: 'expense',
      });
      setSuggestedCategory(null);
      setShowCreateModal(false);
      
      // Refresh transactions
      fetchTransactions();
    } catch (err: any) {
      alert(`Failed to create transaction: ${err.message}`);
    }
  };

  const uniqueCategories = Array.from(new Set(transactions.map(t => t.category))).sort();

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading transactions...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#ECF4E8] to-[#CBF3BB]">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <PageHeader
          title="Transactions"
          description="View and manage your financial transactions"
          action={
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-[#93BFC7] text-white rounded-lg hover:bg-[#7AABB5] transition font-semibold shadow-md"
            >
              + Add Transaction
            </button>
          }
        />
          
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Total Transactions</p>
            <p className="text-2xl font-bold text-gray-800">{transactions.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Total Income</p>
            <p className="text-2xl font-bold text-green-600">${totalIncome.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Total Expenses</p>
            <p className="text-2xl font-bold text-red-600">${totalExpense.toFixed(2)}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#93BFC7] focus:border-transparent text-gray-900 placeholder:text-gray-400"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#93BFC7] focus:border-transparent text-gray-900 placeholder:text-gray-400"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#93BFC7] focus:border-transparent text-gray-900 placeholder:text-gray-400"
              >
                <option value="">All Categories</option>
                {uniqueCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as '' | 'income' | 'expense')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#93BFC7] focus:border-transparent text-gray-900 placeholder:text-gray-400"
              >
                <option value="">All Types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        {/* Transactions Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    onClick={() => handleSort('date')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    Date {sortField === 'date' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th
                    onClick={() => handleSort('category')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    Category {sortField === 'category' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    onClick={() => handleSort('amount')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    Amount {sortField === 'amount' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Source
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      No transactions found. Try adjusting your filters or upload some data.
                    </td>
                  </tr>
                ) : (
                  sortedTransactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(transaction.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {transaction.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-[#CBF3BB] text-gray-800">
                          {transaction.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <span className={transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                          {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          transaction.type === 'income' ? 'bg-[#ABE7B2] text-gray-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {transaction.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transaction.source}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleEdit(transaction)}
                          className="text-[#93BFC7] hover:text-[#7AABB5]"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeletingId(transaction.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editingTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Edit Transaction</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={editForm.date}
                  onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#93BFC7] focus:border-transparent text-gray-900 placeholder:text-gray-400"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#93BFC7] focus:border-transparent text-gray-900 placeholder:text-gray-400"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={editForm.amount}
                  onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#93BFC7] focus:border-transparent text-gray-900 placeholder:text-gray-400"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <input
                  type="text"
                  value={editForm.category}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#93BFC7] focus:border-transparent text-gray-900 placeholder:text-gray-400"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <select
                  value={editForm.type}
                  onChange={(e) => setEditForm({ ...editForm, type: e.target.value as 'income' | 'expense' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#93BFC7] focus:border-transparent text-gray-900 placeholder:text-gray-400"
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setEditingTransaction(null)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-[#93BFC7] text-white rounded-md hover:bg-[#7AABB5] transition"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Confirm Delete</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this transaction? This action cannot be undone.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deletingId)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Transaction Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Add New Transaction</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={createForm.date}
                  onChange={(e) => setCreateForm({ ...createForm, date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#93BFC7] focus:border-transparent text-gray-900 placeholder:text-gray-400"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#93BFC7] focus:border-transparent text-gray-900 placeholder:text-gray-400"
                  placeholder="e.g., Starbucks Coffee"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={createForm.amount}
                  onChange={(e) => setCreateForm({ ...createForm, amount: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#93BFC7] focus:border-transparent text-gray-900 placeholder:text-gray-400"
                  placeholder="0.00"
                  />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <select
                  value={createForm.type}
                  onChange={(e) => setCreateForm({ ...createForm, type: e.target.value as 'income' | 'expense' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#93BFC7] focus:border-transparent text-gray-900 placeholder:text-gray-400"
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={createForm.category}
                    onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#93BFC7] focus:border-transparent text-gray-900 placeholder:text-gray-400"
                    placeholder="Will be auto-categorized if empty"
                    />
                  <button
                    onClick={handleSuggestCategory}
                    disabled={!createForm.description || !createForm.amount || loadingSuggestion}
                    className="px-4 py-2 bg-[#93BFC7] text-white rounded-md hover:bg-[#7AABB5] transition disabled:bg-gray-300 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {loadingSuggestion ? (
                      <span className="flex items-center">
                        <svg className="animate-spin h-4 w-4 mr-1" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        AI
                      </span>
                    ) : (
                      '✨ AI Suggest'
                    )}
                  </button>
                </div>
                {suggestedCategory && (
                  <p className="text-sm text-green-600 mt-1">
                    ✓ Suggested: {suggestedCategory}
                  </p>
                )}
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setCreateForm({
                    date: new Date().toISOString().split('T')[0],
                    description: '',
                    amount: '',
                    category: '',
                    type: 'expense',
                  });
                  setSuggestedCategory(null);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTransaction}
                className="px-4 py-2 bg-[#93BFC7] text-white rounded-md hover:bg-[#7AABB5] transition"
              >
                Create Transaction
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
