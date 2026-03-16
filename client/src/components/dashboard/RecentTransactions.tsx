import { Link } from 'react-router-dom';
import { Transaction } from '../../../../shared/types';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import { Badge } from '../ui/Badge';

interface Props {
  transactions: Transaction[];
}

export function RecentTransactions({ transactions }: Props) {
  return (
    <div className="rounded-xl border bg-white p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Recent Transactions</h3>
        <Link to="/transactions" className="text-xs text-blue-600 hover:underline">View All</Link>
      </div>
      <div className="space-y-3">
        {transactions.length === 0 ? (
          <p className="py-4 text-center text-sm text-gray-400">No transactions yet</p>
        ) : (
          transactions.map((t) => (
            <div key={t.id} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-800">{t.category}</p>
                <p className="text-xs text-gray-400">{formatDate(t.date)}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={t.type === 'INCOME' ? 'green' : 'red'}>{t.type}</Badge>
                <span className={`text-sm font-semibold ${t.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                  {t.type === 'INCOME' ? '+' : '-'}{formatCurrency(Number(t.amount))}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
