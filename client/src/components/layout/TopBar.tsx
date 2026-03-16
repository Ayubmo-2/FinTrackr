import { useLocation } from 'react-router-dom';

const titles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/transactions': 'Transactions',
  '/budgets': 'Budgets',
  '/settings': 'Settings',
  '/upgrade': 'Upgrade to Pro',
};

export function TopBar() {
  const { pathname } = useLocation();
  return (
    <header className="flex items-center justify-between border-b bg-white px-6 py-4">
      <h1 className="text-lg font-semibold text-gray-800">{titles[pathname] || 'FinTrackr'}</h1>
      <p className="text-sm text-gray-500">{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
    </header>
  );
}
