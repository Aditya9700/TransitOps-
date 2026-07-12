import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Truck,
  Users,
  Route,
  Wrench,
  Wallet,
  BarChart3,
  Settings,
  LogOut,
  Compass,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Fleet', path: '/fleet', icon: Truck },
    { name: 'Drivers', path: '/drivers', icon: Users },
    { name: 'Trips', path: '/trips', icon: Route },
    { name: 'Maintenance', path: '/maintenance', icon: Wrench },
    { name: 'Fuel & Expenses', path: '/fuel-expenses', icon: Wallet },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside className="fixed bottom-0 left-0 top-0 flex w-[260px] flex-col border-r border-slate-800 bg-slate-900 text-slate-300">
      {/* Brand Logo Header */}
      <div className="flex h-[70px] items-center border-b border-slate-800 px-6">
        <div className="flex items-center space-x-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white shadow-xs">
            <Compass className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white leading-none">TransitOps</h1>
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest leading-none block mt-0.5">Platform</span>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1.5">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center space-x-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'hover:bg-slate-800/50 hover:text-slate-200'
              }`
            }
          >
            <item.icon className="h-4 w-4 shrink-0" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* User Information Footer Block */}
      {user && (
        <div className="border-t border-slate-800 p-4 bg-slate-900/50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-800 font-bold text-white text-sm">
                {user.name.split(' ').map((n) => n[0]).join('')}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate leading-none mb-1">{user.name}</p>
                <span className="text-[10px] font-semibold uppercase text-slate-400 block truncate leading-none">
                  {user.role}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center space-x-2 rounded-lg border border-slate-800 bg-slate-800/40 hover:bg-slate-800 hover:text-white px-3 py-2 text-xs font-medium text-slate-400 transition-all duration-200 cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </aside>
  );
};
