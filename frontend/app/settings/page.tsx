'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import AppLayout from '@/components/AppLayout';
import Loading from '@/components/Loading';

export default function SettingsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'categories'>('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    username: '',
    email: '',
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Categories state
  const [categories, setCategories] = useState<string[]>([
    'Food & Dining',
    'Groceries',
    'Transportation',
    'Entertainment',
    'Shopping',
    'Bills & Utilities',
    'Healthcare',
    'Travel',
    'Education',
    'Personal Care',
    'Home',
    'Insurance',
    'Investments',
    'Other'
  ]);
  const [newCategory, setNewCategory] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      setProfileForm({
        username: user.username,
        email: user.email,
      });
    }
  }, [user]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      await api.updateProfile(profileForm);
      
      // Update local storage
      const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
      userData.username = profileForm.username;
      userData.email = profileForm.email;
      localStorage.setItem('user_data', JSON.stringify(userData));

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      setLoading(false);
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      setLoading(false);
      return;
    }

    try {
      await api.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to change password' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = () => {
    if (!newCategory.trim()) return;
    
    if (categories.includes(newCategory.trim())) {
      setMessage({ type: 'error', text: 'Category already exists' });
      return;
    }

    setCategories([...categories, newCategory.trim()]);
    setNewCategory('');
    setMessage({ type: 'success', text: 'Category added successfully!' });
  };

  const handleDeleteCategory = (category: string) => {
    // Prevent deleting default categories
    const defaultCategories = ['Food & Dining', 'Groceries', 'Transportation', 'Entertainment', 
                              'Shopping', 'Bills & Utilities', 'Healthcare'];
    
    if (defaultCategories.includes(category)) {
      setMessage({ type: 'error', text: 'Cannot delete default categories' });
      return;
    }

    setCategories(categories.filter(c => c !== category));
    setMessage({ type: 'success', text: 'Category deleted successfully!' });
  };

  if (authLoading) {
    return <Loading message="Loading settings..." />;
  }

  return (
    <AppLayout
      title="Settings"
      description="Manage your account and preferences"
    >
      <div className="max-w-4xl mx-auto">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b">
            <div className="flex space-x-8 px-6">
              <button
                onClick={() => { setActiveTab('profile'); setMessage(null); }}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'profile'
                    ? 'border-[#93BFC7] text-[#93BFC7]'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                👤 Profile
              </button>
              <button
                onClick={() => { setActiveTab('password'); setMessage(null); }}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'password'
                    ? 'border-[#93BFC7] text-[#93BFC7]'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                🔒 Password
              </button>
              <button
                onClick={() => { setActiveTab('categories'); setMessage(null); }}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'categories'
                    ? 'border-[#93BFC7] text-[#93BFC7]'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                🏷️ Categories
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Message Display */}
            {message && (
              <div
                className={`mb-6 p-4 rounded-lg ${
                  message.type === 'success'
                    ? 'bg-green-50 text-green-800 border border-green-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                {message.text}
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    value={profileForm.username}
                    onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#93BFC7] focus:border-transparent text-gray-900 placeholder:text-gray-400"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#93BFC7] focus:border-transparent text-gray-900 placeholder:text-gray-400"
                    required
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-[#93BFC7] text-white rounded-lg hover:bg-[#7da8b0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            )}

            {/* Password Tab */}
            {activeTab === 'password' && (
              <form onSubmit={handlePasswordChange} className="space-y-6">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#93BFC7] focus:border-transparent text-gray-900 placeholder:text-gray-400"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#93BFC7] focus:border-transparent text-gray-900 placeholder:text-gray-400"
                    required
                    minLength={6}
                  />
                  <p className="mt-1 text-xs text-gray-500">Minimum 6 characters</p>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#93BFC7] focus:border-transparent text-gray-900 placeholder:text-gray-400"
                    required
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-[#93BFC7] text-white rounded-lg hover:bg-[#7da8b0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Changing...' : 'Change Password'}
                  </button>
                </div>
              </form>
            )}

            {/* Categories Tab */}
            {activeTab === 'categories' && (
              <div className="space-y-6">
                {/* Add New Category */}
                <div>
                  <label htmlFor="newCategory" className="block text-sm font-medium text-gray-700 mb-2">
                    Add New Category
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      id="newCategory"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCategory())}
                      placeholder="Enter category name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#93BFC7] focus:border-transparent text-gray-900 placeholder:text-gray-400"
                    />
                    <button
                      type="button"
                      onClick={handleAddCategory}
                      className="px-6 py-2 bg-[#93BFC7] text-white rounded-lg hover:bg-[#7da8b0] transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Categories List */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Your Categories</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {categories.map((category) => {
                      const isDefault = ['Food & Dining', 'Groceries', 'Transportation', 'Entertainment', 
                                        'Shopping', 'Bills & Utilities', 'Healthcare'].includes(category);
                      
                      return (
                        <div
                          key={category}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                        >
                          <span className="text-sm text-gray-700">{category}</span>
                          {!isDefault && (
                            <button
                              onClick={() => handleDeleteCategory(category)}
                              className="text-red-600 hover:text-red-700 text-sm"
                            >
                              Delete
                            </button>
                          )}
                          {isDefault && (
                            <span className="text-xs text-gray-400">Default</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    💡 <strong>Note:</strong> Default categories cannot be deleted. You can add custom categories for your specific needs.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Account Info */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">User ID:</span>
              <span className="text-gray-900 font-mono text-xs">{user?.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Account Email:</span>
              <span className="text-gray-900">{user?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Member Since:</span>
              <span className="text-gray-900">October 2025</span>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
