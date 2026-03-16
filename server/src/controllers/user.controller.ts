import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

export async function getMe(req: AuthRequest, res: Response) {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: { id: true, email: true, tier: true, emailVerified: true, createdAt: true },
  });
  if (!user) return res.status(404).json({ error: 'User not found' });
  return res.json(user);
}

export async function deleteAccount(req: AuthRequest, res: Response) {
  await prisma.user.delete({ where: { id: req.userId } });
  res.clearCookie('refreshToken');
  return res.status(204).send();
}
