import { useSearchParams } from 'react-router-dom';
import { CATEGORIES } from '../../utils/categories';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

export function FilterBar() {
  const [params, setParams] = useSearchParams();
  const user = useSelector((state: RootState) => state.auth.user);
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

  const set = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    next.set('page', '1');
    setParams(next);
  };

  const handleExport = () => {
    fetch('/api/transactions/export', {
      headers: { Authorization: `Bearer ${accessToken}` },
      credentials: 'include',
    }).then((r) => r.blob()).then((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'transactions.csv';
      a.click();
    });
  };

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-xl border bg-white p-4">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-600">Type</label>
        <select
          value={params.get('type') || ''}
          onChange={(e) => set('type', e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All</option>
          <option value="INCOME">Income</option>
          <option value="EXPENSE">Expense</option>
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-600">Category</label>
        <select
          value={params.get('category') || ''}
          onChange={(e) => set('category', e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-600">From</label>
        <input
          type="date"
          value={params.get('startDate') || ''}
          onChange={(e) => set('startDate', e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-600">To</label>
        <input
          type="date"
          value={params.get('endDate') || ''}
          onChange={(e) => set('endDate', e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      {user?.tier === 'PRO' && (
        <button
          onClick={handleExport}
          className="ml-auto rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
        >
          Export CSV
        </button>
      )}
    </div>
  );
}
