import { SummaryStats } from '../../../../shared/types';
import { formatCurrency } from '../../utils/formatCurrency';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

interface Props {
  stats: SummaryStats | undefined;
  isLoading: boolean;
}

function SkeletonCard() {
  return <div className="rounded-xl bg-gray-100 p-6 animate-pulse h-32" />;
}

export function SummaryCards({ stats, isLoading }: Props) {
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const isFree = user?.tier === 'FREE';
  const count = stats?.transactionCount || 0;

  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  const cards = [
    { label: 'Total Income', value: formatCurrency(stats.totalIncome), color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
    { label: 'Total Expenses', value: formatCurrency(stats.totalExpenses), color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
    { label: 'Net Savings', value: formatCurrency(stats.netSavings), color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
    { label: 'Transactions', value: `${count}${isFree ? '/50' : ''}`, color: 'text-gray-700', bg: 'bg-gray-50', border: 'border-gray-200' },
  ];

  return (
    <div className="space-y-4">
      {isFree && count >= 40 && count < 50 && (
        <div className="rounded-lg bg-yellow-50 border border-yellow-200 px-4 py-3 text-sm text-yellow-800">
          Warning: You have used {count}/50 free transactions this month.
        </div>
      )}
      {isFree && count >= 50 && (
        <div className="flex items-center justify-between rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
          <span>You've reached the 50 transaction limit.</span>
          <button onClick={() => navigate('/upgrade')} className="ml-4 font-semibold underline">Upgrade to Pro</button>
        </div>
      )}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className={`rounded-xl border p-5 ${card.bg} ${card.border}`}>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{card.label}</p>
            <p className={`mt-2 text-2xl font-bold ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
