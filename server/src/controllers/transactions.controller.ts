import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

const createSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE']),
  category: z.string().min(1),
  amount: z.number().positive(),
  date: z.string().datetime(),
  notes: z.string().optional(),
});

const updateSchema = createSchema.partial();

export async function getTransactions(req: AuthRequest, res: Response) {
  const { page = '1', limit = '20', startDate, endDate, category, type } = req.query as Record<string, string>;
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
  const skip = (pageNum - 1) * limitNum;

  const where: any = { userId: req.userId };
  if (startDate) where.date = { ...where.date, gte: new Date(startDate) };
  if (endDate) where.date = { ...where.date, lte: new Date(endDate) };
  if (category) where.category = category;
  if (type) where.type = type;

  const [data, total] = await Promise.all([
    prisma.transaction.findMany({ where, orderBy: { date: 'desc' }, skip, take: limitNum }),
    prisma.transaction.count({ where }),
  ]);

  return res.json({ data, total, page: pageNum, totalPages: Math.ceil(total / limitNum) });
}

export async function createTransaction(req: AuthRequest, res: Response) {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors });
  }

  if (req.tier === 'FREE') {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    const count = await prisma.transaction.count({
      where: { userId: req.userId!, date: { gte: start, lte: end } },
    });
    if (count >= 50) {
      return res.status(403).json({ error: 'Free tier limit reached (50/month)', upgradeUrl: '/upgrade' });
    }
  }

  const tx = await prisma.transaction.create({
    data: { ...parsed.data, date: new Date(parsed.data.date), userId: req.userId! },
  });

  return res.status(201).json(tx);
}

export async function updateTransaction(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const existing = await prisma.transaction.findUnique({ where: { id } });
  if (!existing || existing.userId !== req.userId) {
    return res.status(404).json({ error: 'Transaction not found' });
  }

  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors });
  }

  const data: any = { ...parsed.data };
  if (data.date) data.date = new Date(data.date);

  const updated = await prisma.transaction.update({ where: { id }, data });
  return res.json(updated);
}

export async function deleteTransaction(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const existing = await prisma.transaction.findUnique({ where: { id } });
  if (!existing || existing.userId !== req.userId) {
    return res.status(404).json({ error: 'Transaction not found' });
  }
  await prisma.transaction.delete({ where: { id } });
  return res.status(204).send();
}

export async function exportTransactions(req: AuthRequest, res: Response) {
  const transactions = await prisma.transaction.findMany({
    where: { userId: req.userId },
    orderBy: { date: 'desc' },
  });

  const header = 'Date,Type,Category,Amount,Notes\n';
  type TxRow = (typeof transactions)[number];
  const rows = transactions.map(
    (t: TxRow) => `${t.date.toISOString().split('T')[0]},${t.type},${t.category},${t.amount},${t.notes || ''}`
  );
  const csv = header + rows.join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv');
  return res.send(csv);
}
