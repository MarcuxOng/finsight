'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function NavBar() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => router.push('/dashboard')}
          >
            <div className="bg-gradient-to-br from-[#93BFC7] to-[#ABE7B2] p-2 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-[#93BFC7] to-[#ABE7B2] bg-clip-text text-transparent">
              FinSight
            </h1>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            <button
              onClick={() => router.push('/transactions')}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-[#93BFC7] hover:bg-gray-50 rounded-lg transition-colors"
            >
              Transactions
            </button>
            <button
              onClick={() => router.push('/insights')}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-[#93BFC7] hover:bg-gray-50 rounded-lg transition-colors"
            >
              Insights
            </button>
            <button
              onClick={() => router.push('/upload')}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-[#93BFC7] hover:bg-gray-50 rounded-lg transition-colors"
            >
              Upload
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
              <div className="w-8 h-8 bg-gradient-to-br from-[#93BFC7] to-[#ABE7B2] rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-gray-700">
                {user?.name}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}