'use client';

import { ReactNode } from 'react';
import NavBar from './NavBar';
import PageHeader from './PageHeader';

interface AppLayoutProps {
  children: ReactNode;
  title: string;
  description: string;
  actions?: ReactNode;
}

export default function AppLayout({ children, title, description, actions }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#ECF4E8] to-[#CBF3BB]">
      <NavBar />
      <PageHeader title={title} description={description} actions={actions} />

      <br />
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-8">
        {children}
      </main>
    </div>
  );
}
