import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

export const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen w-full bg-slate-50 flex">
      {/* Sidebar - fixed left */}
      <Sidebar />

      {/* Main Content Area - pushed right */}
      <div className="flex-1 pl-[260px] flex flex-col min-w-0">
        {/* Top Navbar */}
        <Navbar />

        {/* Dynamic Page Content */}
        <main className="flex-1 mt-[70px] p-8 overflow-y-auto animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
