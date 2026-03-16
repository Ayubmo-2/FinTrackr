import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { CATEGORY_COLORS } from '../../utils/categories';
import { formatCurrency } from '../../utils/formatCurrency';

interface Props {
  data: { category: string; total: number }[];
}

export function CategoryPieChart({ data }: Props) {
  const navigate = useNavigate();
  const total = data.reduce((sum, d) => sum + d.total, 0);
  const chartData = data.map((d) => ({ ...d, percent: total > 0 ? Math.round((d.total / total) * 100) : 0 }));

  return (
    <div className="rounded-xl border bg-white p-6">
      <h3 className="mb-4 text-sm font-semibold text-gray-600 uppercase tracking-wide">Spending by Category</h3>
      {data.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-400">No expense data yet</p>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="total"
              nameKey="category"
              cx="50%"
              cy="50%"
              outerRadius={80}
              onClick={(d) => navigate(`/transactions?category=${d.category}`)}
              label={({ category, percent }) => `${category} ${percent}%`}
              labelLine={false}
            >
              {chartData.map((entry) => (
                <Cell key={entry.category} fill={CATEGORY_COLORS[entry.category] || '#94a3b8'} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => [formatCurrency(value)]} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
