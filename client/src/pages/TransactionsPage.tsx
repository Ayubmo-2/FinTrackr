import { useState } from 'react';
import { FilterBar } from '../components/transactions/FilterBar';
import { TransactionTable } from '../components/transactions/TransactionTable';
import { TransactionForm } from '../components/transactions/TransactionForm';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { Plus } from 'lucide-react';

export default function TransactionsPage() {
  const [open, setOpen] = useState(false);
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">All Transactions</h2>
        <Button onClick={() => setOpen(true)}><Plus size={16} className="mr-1" />Add Transaction</Button>
      </div>
      <FilterBar />
      <TransactionTable />
      <Modal open={open} onClose={() => setOpen(false)} title="New Transaction">
        <TransactionForm onSuccess={() => setOpen(false)} />
      </Modal>
    </div>
  );
}
