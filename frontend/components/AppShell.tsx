'use client';

import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { usePathname } from 'next/navigation';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Public portfolio routes do not show the internal dashboard chrome
  const isPublicRoute = pathname.startsWith('/alex-mercer') || pathname.startsWith('/public');

  if (isPublicRoute) {
    return <main>{children}</main>;
  }

  return (
    <div className="min-h-screen bg-[#0a0d14] text-slate-100 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
