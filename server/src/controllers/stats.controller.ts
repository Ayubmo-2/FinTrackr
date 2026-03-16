import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

export async function getSummary(req: AuthRequest, res: Response) {
  const now = new Date();
  const month = parseInt((req.query.month as string) || String(now.getMonth() + 1));
  const year = parseInt((req.query.year as string) || String(now.getFullYear()));

  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59);

  const [income, expenses, transactionCount] = await Promise.all([
    prisma.transaction.aggregate({
      where: { userId: req.userId!, type: 'INCOME', date: { gte: start, lte: end } },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { userId: req.userId!, type: 'EXPENSE', date: { gte: start, lte: end } },
      _sum: { amount: true },
    }),
    prisma.transaction.count({ where: { userId: req.userId!, date: { gte: start, lte: end } } }),
  ]);

  const totalIncome = Number(income._sum.amount || 0);
  const totalExpenses = Number(expenses._sum.amount || 0);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const dailyData = await prisma.transaction.groupBy({
    by: ['date'],
    where: { userId: req.userId!, type: 'EXPENSE', date: { gte: thirtyDaysAgo } },
    _sum: { amount: true },
    orderBy: { date: 'asc' },
  });

  type DailyRow = (typeof dailyData)[number];
  const dailySpend = dailyData.map((d: DailyRow) => ({
    date: (d.date as Date).toISOString().split('T')[0],
    amount: Number(d._sum.amount || 0),
  }));

  const categoryData = await prisma.transaction.groupBy({
    by: ['category'],
    where: { userId: req.userId!, type: 'EXPENSE', date: { gte: start, lte: end } },
    _sum: { amount: true },
    orderBy: { _sum: { amount: 'desc' } },
  });

  type CategoryRow = (typeof categoryData)[number];
  const categoryBreakdown = categoryData.map((c: CategoryRow) => ({
    category: c.category,
    total: Number(c._sum.amount || 0),
  }));

  return res.json({
    totalIncome,
    totalExpenses,
    netSavings: totalIncome - totalExpenses,
    transactionCount,
    dailySpend,
    categoryBreakdown,
  });
}
