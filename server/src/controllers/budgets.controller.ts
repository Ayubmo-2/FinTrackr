import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

const budgetSchema = z.object({
  category: z.string().min(1),
  limitAmount: z.number().positive(),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020),
});

export async function getBudgets(req: AuthRequest, res: Response) {
  const now = new Date();
  const month = parseInt((req.query.month as string) || String(now.getMonth() + 1));
  const year = parseInt((req.query.year as string) || String(now.getFullYear()));

  const budgets = await prisma.budget.findMany({ where: { userId: req.userId!, month, year } });

  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59);

  const spending = await prisma.transaction.groupBy({
    by: ['category'],
    where: { userId: req.userId!, type: 'EXPENSE', date: { gte: start, lte: end } },
    _sum: { amount: true },
  });

  type SpendRow = (typeof spending)[number];
  const spendMap = new Map<string, number>(
    spending.map((s: SpendRow) => [s.category, Number(s._sum.amount ?? 0)] as [string, number])
  );

  type BudgetRow = (typeof budgets)[number];
  const result = budgets.map((b: BudgetRow) => {
    const spent: number = spendMap.get(b.category) ?? 0;
    const limit = Number(b.limitAmount);
    return { ...b, limitAmount: limit, spent, percent: limit > 0 ? Math.round((spent / limit) * 100) : 0 };
  });

  return res.json({ budgets: result });
}

export async function upsertBudget(req: AuthRequest, res: Response) {
  const parsed = budgetSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors });
  }

  const { category, limitAmount, month, year } = parsed.data;
  const budget = await prisma.budget.upsert({
    where: { userId_category_month_year: { userId: req.userId!, category, month, year } },
    update: { limitAmount },
    create: { userId: req.userId!, category, limitAmount, month, year },
  });

  return res.status(201).json(budget);
}

export async function deleteBudget(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const existing = await prisma.budget.findUnique({ where: { id } });
  if (!existing || existing.userId !== req.userId) {
    return res.status(404).json({ error: 'Budget not found' });
  }
  await prisma.budget.delete({ where: { id } });
  return res.status(204).send();
}
