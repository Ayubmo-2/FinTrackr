import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { Button } from '../components/ui/Button';
import { useState } from 'react';

export default function SettingsPage() {
  const user = useSelector((state: RootState) => state.auth.user);
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const [loading, setLoading] = useState(false);

  const handlePortal = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/stripe/portal`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        credentials: 'include',
      });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch { setLoading(false); }
  };

  return (
    <div className="max-w-lg space-y-6">
      <div className="rounded-xl border bg-white p-6">
        <h3 className="font-semibold text-gray-800 mb-4">Account</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Email</span>
            <span className="font-medium">{user?.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Plan</span>
            <span className={`font-medium ${user?.tier === 'PRO' ? 'text-yellow-600' : 'text-gray-700'}`}>
              {user?.tier === 'PRO' ? '★ Pro' : 'Free'}
            </span>
          </div>
        </div>
      </div>
      {user?.tier === 'PRO' && (
        <div className="rounded-xl border bg-white p-6">
          <h3 className="font-semibold text-gray-800 mb-2">Subscription</h3>
          <p className="text-sm text-gray-500 mb-4">Manage your billing, update payment method, or cancel.</p>
          <Button onClick={handlePortal} loading={loading} variant="secondary">Manage Subscription</Button>
        </div>
      )}
    </div>
  );
}
