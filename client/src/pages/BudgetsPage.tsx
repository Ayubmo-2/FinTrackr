import { useState } from 'react';
import { useGetBudgetsQuery } from '../store/budgetsApi';
import { BudgetCard } from '../components/budgets/BudgetCard';
import { BudgetForm } from '../components/budgets/BudgetForm';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { Plus } from 'lucide-react';
import { Budget } from '../../../shared/types';

interface BudgetWithStats extends Budget { spent: number; percent: number; }

export default function BudgetsPage() {
  const { data, isLoading } = useGetBudgetsQuery({});
  const [editBudget, setEditBudget] = useState<BudgetWithStats | null>(null);
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">Monthly Budgets</h2>
        <Button onClick={() => setOpen(true)}><Plus size={16} className="mr-1" />New Budget</Button>
      </div>
      {isLoading && <p className="text-sm text-gray-400">Loading...</p>}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data?.budgets.map((b) => (
          <BudgetCard key={b.id} budget={b as BudgetWithStats} onEdit={(b) => { setEditBudget(b); setOpen(true); }} />
        ))}
        {!isLoading && data?.budgets.length === 0 && (
          <p className="col-span-3 text-center py-8 text-sm text-gray-400">No budgets set for this month.</p>
        )}
      </div>
      <Modal open={open} onClose={() => { setOpen(false); setEditBudget(null); }} title={editBudget ? 'Edit Budget' : 'New Budget'}>
        <BudgetForm budget={editBudget || undefined} onSuccess={() => { setOpen(false); setEditBudget(null); }} />
      </Modal>
    </div>
  );
}
