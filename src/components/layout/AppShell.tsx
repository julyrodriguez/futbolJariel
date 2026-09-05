'use client';

import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#0A0E17] text-slate-100">
      {/* Sidebar (Desktop fixed left, Mobile drawer) */}
      <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <Header onOpenMobile={() => setMobileOpen(true)} />
        
        <main className="flex-1 max-w-5xl w-full mx-auto px-3 sm:px-6 py-4">
          {children}
        </main>
      </div>
    </div>
  );
}
