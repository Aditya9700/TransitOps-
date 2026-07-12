import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Search, Bell } from 'lucide-react';
import { Badge } from '../ui/Badge';

export const Navbar: React.FC = () => {
  const { user } = useAuth();

  const getRoleBadgeVariant = (role?: string) => {
    switch (role) {
      case 'Fleet Manager':
        return 'primary';
      case 'Dispatcher':
        return 'success';
      case 'Safety Officer':
        return 'warning';
      case 'Financial Analyst':
        return 'info';
      default:
        return 'secondary';
    }
  };

  return (
    <header className="fixed top-0 right-0 left-[260px] z-10 flex h-[70px] items-center justify-between border-b border-slate-200 bg-white px-8 shadow-xs">
      {/* Search Input Bar */}
      <div className="relative w-72">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
          <Search className="h-4 w-4" />
        </span>
        <input
          type="text"
          placeholder="Quick search (e.g. vehicles, drivers, trips)..."
          className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50/50 pl-9 pr-3 text-sm placeholder:text-slate-400 focus:border-slate-300 focus:bg-white focus:outline-hidden transition-all duration-200"
        />
      </div>

      {/* Right Side Controls */}
      <div className="flex items-center space-x-6">
        {/* Mock Notifications */}
        <button className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors duration-200 cursor-pointer">
          <Bell className="h-4.5 w-4.5" />
          <span className="absolute top-1.5 right-1.5 flex h-2 w-2 rounded-full bg-danger"></span>
        </button>

        {/* User Badge Profile info */}
        {user && (
          <div className="flex items-center space-x-3.5 border-l border-slate-200 pl-6">
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-900 leading-none mb-1">{user.name}</p>
              <Badge variant={getRoleBadgeVariant(user.role)} className="text-[10px]">
                {user.role}
              </Badge>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-800 border border-slate-200 text-sm shadow-xs">
              {user.name.split(' ').map((n) => n[0]).join('')}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
