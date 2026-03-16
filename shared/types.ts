export type TransactionType = 'INCOME' | 'EXPENSE';
export type Tier = 'FREE' | 'PRO';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  category: string;
  amount: number;
  date: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  id: string;
  category: string;
  limitAmount: number;
  month: number;
  year: number;
  spent?: number;
  percent?: number;
}

export interface User {
  id: string;
  email: string;
  tier: Tier;
  emailVerified: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface SummaryStats {
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  transactionCount: number;
  dailySpend: { date: string; amount: number }[];
  categoryBreakdown: { category: string; total: number }[];
}
