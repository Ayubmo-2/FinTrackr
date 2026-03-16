import { Check } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

const features = [
  'Unlimited transactions per month',
  'CSV export',
  'Advanced charts',
  'Priority support',
  'Cancel anytime',
];

export default function UpgradePage() {
  const [loading, setLoading] = useState(false);
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
        credentials: 'include',
      });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch { setLoading(false); }
  };

  return (
    <div className="flex items-center justify-center py-12">
      <div className="w-full max-w-sm rounded-2xl border bg-white p-8 shadow-lg">
        <div className="text-center mb-6">
          <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 mb-3">PRO</span>
          <p className="text-4xl font-bold text-gray-900">$5<span className="text-lg text-gray-400 font-normal">/mo</span></p>
          <p className="mt-2 text-sm text-gray-500">Unlock everything in FinTrackr</p>
        </div>
        <ul className="mb-8 space-y-3">
          {features.map((f) => (
            <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
              <Check size={16} className="text-green-500 flex-shrink-0" /> {f}
            </li>
          ))}
        </ul>
        <Button onClick={handleUpgrade} loading={loading} className="w-full" size="lg">Upgrade to Pro</Button>
      </div>
    </div>
  );
}
