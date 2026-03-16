import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Transaction } from '../../../../shared/types';
import { useCreateTransactionMutation, useUpdateTransactionMutation } from '../../store/transactionsApi';
import { CATEGORIES } from '../../utils/categories';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

const schema = z.object({
  type: z.enum(['INCOME', 'EXPENSE']),
  category: z.string().min(1, 'Category required'),
  amount: z.coerce.number().positive('Amount must be positive'),
  date: z.string().min(1, 'Date required'),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  transaction?: Transaction;
  onSuccess: () => void;
}

export function TransactionForm({ transaction, onSuccess }: Props) {
  const [create, { isLoading: creating }] = useCreateTransactionMutation();
  const [update, { isLoading: updating }] = useUpdateTransactionMutation();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: transaction
      ? { ...transaction, amount: Number(transaction.amount), date: transaction.date.split('T')[0] }
      : { type: 'EXPENSE', date: new Date().toISOString().split('T')[0] },
  });

  const onSubmit = async (data: FormData) => {
    try {
      if (transaction) {
        await update({ id: transaction.id, ...data, date: new Date(data.date).toISOString() }).unwrap();
      } else {
        await create({ ...data, date: new Date(data.date).toISOString() }).unwrap();
      }
      onSuccess();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="text-sm font-medium text-gray-700">Type</label>
        <div className="mt-1 flex gap-4">
          {(['INCOME', 'EXPENSE'] as const).map((t) => (
            <label key={t} className="flex items-center gap-2 cursor-pointer">
              <input type="radio" value={t} {...register('type')} />
              <span className={`text-sm font-medium ${t === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>{t}</span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700">Category</label>
        <select
          {...register('category')}
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select category</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category.message}</p>}
      </div>
      <Input label="Amount ($)" type="number" step="0.01" {...register('amount')} error={errors.amount?.message} />
      <Input label="Date" type="date" {...register('date')} error={errors.date?.message} />
      <div>
        <label className="text-sm font-medium text-gray-700">Notes (optional)</label>
        <textarea
          {...register('notes')}
          rows={3}
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <Button type="submit" loading={creating || updating} className="w-full">
        {transaction ? 'Update' : 'Add'} Transaction
      </Button>
    </form>
  );
}
