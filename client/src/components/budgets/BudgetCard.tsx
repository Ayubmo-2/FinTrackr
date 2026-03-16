import { Budget } from '../../../../shared/types';
import { formatCurrency } from '../../utils/formatCurrency';
import { useDeleteBudgetMutation } from '../../store/budgetsApi';
import { Pencil, Trash2, AlertTriangle } from 'lucide-react';

interface BudgetWithStats extends Budget {
  spent: number;
  percent: number;
}

interface Props {
  budget: BudgetWithStats;
  onEdit: (b: BudgetWithStats) => void;
}

export function BudgetCard({ budget, onEdit }: Props) {
  const [deleteBudget] = useDeleteBudgetMutation();
  const { percent } = budget;
  const barColor = percent >= 100 ? 'bg-red-500' : percent >= 80 ? 'bg-yellow-500' : 'bg-green-500';

  return (
    <div className="rounded-xl border bg-white p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-800">{budget.category}</h3>
          {percent >= 80 && <AlertTriangle size={14} className={percent >= 100 ? 'text-red-500' : 'text-yellow-500'} />}
        </div>
        <div className="flex gap-2 text-gray-400">
          <button onClick={() => onEdit(budget)} className="hover:text-blue-600"><Pencil size={15} /></button>
          <button onClick={() => deleteBudget(budget.id)} className="hover:text-red-600"><Trash2 size={15} /></button>
        </div>
      </div>
      <div className="flex justify-between text-sm text-gray-600 mb-2">
        <span>Spent: {formatCurrency(budget.spent)}</span>
        <span>Limit: {formatCurrency(Number(budget.limitAmount))}</span>
      </div>
      <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
        <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${Math.min(percent, 100)}%` }} />
      </div>
      <p className="mt-1.5 text-xs text-gray-500">{percent}% used · {formatCurrency(Math.max(0, Number(budget.limitAmount) - budget.spent))} remaining</p>
    </div>
  );
}
