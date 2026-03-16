import { useGetSummaryQuery } from '../store/statsApi';
import { useGetTransactionsQuery } from '../store/transactionsApi';
import { SummaryCards } from '../components/dashboard/SummaryCards';
import { SpendingLineChart } from '../components/dashboard/SpendingLineChart';
import { CategoryPieChart } from '../components/dashboard/CategoryPieChart';
import { RecentTransactions } from '../components/dashboard/RecentTransactions';

export default function DashboardPage() {
  const { data: stats, isLoading, isError } = useGetSummaryQuery({});
  const { data: recent } = useGetTransactionsQuery({ limit: 5 });

  if (isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        Failed to load dashboard data. Please refresh the page.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SummaryCards stats={stats} isLoading={isLoading} />
      {stats && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <SpendingLineChart data={stats.dailySpend} />
          <CategoryPieChart data={stats.categoryBreakdown} />
        </div>
      )}
      {recent && <RecentTransactions transactions={recent.data} />}
    </div>
  );
}
