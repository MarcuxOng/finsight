'use client';

import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description: string;
  actions?: ReactNode;
}

export default function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-[#93BFC7] to-[#ABE7B2] shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-4xl font-bold text-white mb-3">
              {title}
            </h2>
            <p className="text-lg text-white/90">
              {description}
            </p>
          </div>
          {actions && (
            <div className="hidden md:flex items-center gap-3">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
