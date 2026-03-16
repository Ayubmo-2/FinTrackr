import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Budget } from '../../../../shared/types';
import { useUpsertBudgetMutation } from '../../store/budgetsApi';
import { CATEGORIES } from '../../utils/categories';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

const schema = z.object({
  category: z.string().min(1, 'Category required'),
  limitAmount: z.coerce.number().positive('Limit must be positive'),
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2020),
});

type FormData = z.infer<typeof schema>;

interface Props {
  budget?: Budget;
  onSuccess: () => void;
}

export function BudgetForm({ budget, onSuccess }: Props) {
  const [upsert, { isLoading }] = useUpsertBudgetMutation();
  const now = new Date();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: budget
      ? { ...budget, limitAmount: Number(budget.limitAmount) }
      : { month: now.getMonth() + 1, year: now.getFullYear() },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await upsert(data).unwrap();
      onSuccess();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
      <Input label="Monthly Limit ($)" type="number" step="0.01" {...register('limitAmount')} error={errors.limitAmount?.message} />
      <div className="grid grid-cols-2 gap-4">
        <Input label="Month" type="number" min="1" max="12" {...register('month')} error={errors.month?.message} />
        <Input label="Year" type="number" min="2020" {...register('year')} error={errors.year?.message} />
      </div>
      <Button type="submit" loading={isLoading} className="w-full">
        {budget ? 'Update' : 'Set'} Budget
      </Button>
    </form>
  );
}
