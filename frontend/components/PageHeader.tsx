'use client';

import { useRouter } from 'next/navigation';

interface PageHeaderProps {
  title: string;
  description?: string;
  showBackButton?: boolean;
  backTo?: string;
  action?: React.ReactNode;
}

export default function PageHeader({ 
  title, 
  description, 
  showBackButton = true,
  backTo = '/dashboard',
  action 
}: PageHeaderProps) {
  const router = useRouter();

  return (
    <div className="mb-8">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          {showBackButton && (
            <button
              onClick={() => router.push(backTo)}
              className="flex items-center justify-center w-10 h-10 rounded-lg bg-white shadow-md hover:bg-gray-50 transition-colors"
              aria-label="Go back"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                strokeWidth={2} 
                stroke="currentColor" 
                className="w-5 h-5 text-gray-700"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" 
                />
              </svg>
            </button>
          )}
          <div>
            <h1 className="text-4xl font-bold text-gray-800">{title}</h1>
            {description && (
              <p className="text-gray-600 mt-2">{description}</p>
            )}
          </div>
        </div>
        {action && (
          <div className="flex-shrink-0">
            {action}
          </div>
        )}
      </div>
    </div>
  );
}
