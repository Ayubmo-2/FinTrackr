import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ArrowLeftRight, PiggyBank, Settings, LogOut, TrendingUp } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/transactions', icon: ArrowLeftRight, label: 'Transactions' },
  { to: '/budgets', icon: PiggyBank, label: 'Budgets' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar() {
  const { user, logout } = useAuth();
  return (
    <aside className="flex h-full w-60 flex-col bg-slate-900 text-white">
      <div className="flex items-center gap-2 px-6 py-5 border-b border-slate-700">
        <TrendingUp className="text-blue-400" size={24} />
        <span className="text-xl font-bold">FinTrackr</span>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="px-4 py-4 border-t border-slate-700">
        <div className="mb-3">
          <p className="text-xs text-slate-400 truncate">{user?.email}</p>
          <span className={`text-xs font-medium ${user?.tier === 'PRO' ? 'text-yellow-400' : 'text-slate-400'}`}>
            {user?.tier === 'PRO' ? '★ Pro' : 'Free'}
          </span>
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded-lg"
        >
          <LogOut size={16} /> Sign out
        </button>
      </div>
    </aside>
  );
}
