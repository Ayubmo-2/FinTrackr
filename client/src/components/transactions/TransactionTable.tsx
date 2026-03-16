import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Transaction } from '../../../../shared/types';
import { useGetTransactionsQuery, useDeleteTransactionMutation } from '../../store/transactionsApi';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { TransactionForm } from './TransactionForm';
import { Pencil, Trash2 } from 'lucide-react';

export function TransactionTable() {
  const [params, setParams] = useSearchParams();
  const [editTx, setEditTx] = useState<Transaction | null>(null);
  const [deleteTx, setDeleteTx] = useState<Transaction | null>(null);

  const page = parseInt(params.get('page') || '1');
  const query = {
    page,
    limit: 20,
    type: params.get('type') || undefined,
    category: params.get('category') || undefined,
    startDate: params.get('startDate') || undefined,
    endDate: params.get('endDate') || undefined,
  };

  const { data, isLoading } = useGetTransactionsQuery(query);
  const [deleteMutation, { isLoading: deleting }] = useDeleteTransactionMutation();

  const setPage = (p: number) => {
    const next = new URLSearchParams(params);
    next.set('page', String(p));
    setParams(next);
  };

  if (isLoading) return <div className="rounded-xl border bg-white p-8 text-center text-sm text-gray-400">Loading...</div>;

  return (
    <>
      <div className="rounded-xl border bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Category</th>
              <th className="px-4 py-3 text-left">Type</th>
              <th className="px-4 py-3 text-left">Notes</th>
              <th className="px-4 py-3 text-right">Amount</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {data?.data.length === 0 && (
              <tr><td colSpan={6} className="py-8 text-center text-gray-400">No transactions found</td></tr>
            )}
            {data?.data.map((tx) => (
              <tr key={tx.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-600">{formatDate(tx.date)}</td>
                <td className="px-4 py-3 font-medium">{tx.category}</td>
                <td className="px-4 py-3"><Badge variant={tx.type === 'INCOME' ? 'green' : 'red'}>{tx.type}</Badge></td>
                <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{tx.notes || '—'}</td>
                <td className={`px-4 py-3 text-right font-semibold ${tx.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                  {tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(Number(tx.amount))}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setEditTx(tx)} className="text-gray-400 hover:text-blue-600"><Pencil size={15} /></button>
                    <button onClick={() => setDeleteTx(tx)} className="text-gray-400 hover:text-red-600"><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between border-t px-4 py-3">
            <p className="text-xs text-gray-500">Page {page} of {data.totalPages} ({data.total} total)</p>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
              <Button size="sm" variant="secondary" disabled={page >= data.totalPages} onClick={() => setPage(page + 1)}>Next</Button>
            </div>
          </div>
        )}
      </div>

      <Modal open={!!editTx} onClose={() => setEditTx(null)} title="Edit Transaction">
        {editTx && <TransactionForm transaction={editTx} onSuccess={() => setEditTx(null)} />}
      </Modal>

      <Modal open={!!deleteTx} onClose={() => setDeleteTx(null)} title="Delete Transaction">
        <p className="text-sm text-gray-600 mb-4">Are you sure you want to delete this transaction?</p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteTx(null)}>Cancel</Button>
          <Button
            variant="danger"
            loading={deleting}
            onClick={async () => {
              if (deleteTx) { await deleteMutation(deleteTx.id); setDeleteTx(null); }
            }}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </>
  );
}
