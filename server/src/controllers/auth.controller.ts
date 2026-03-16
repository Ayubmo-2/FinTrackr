import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken,
} from '../services/token.service';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/email.service';

const registerSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/, 'Must contain uppercase')
    .regex(/[0-9]/, 'Must contain number'),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function register(req: Request, res: Response) {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors });
  }
  const { email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ error: 'Email already in use' });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { email, passwordHash, tier: 'FREE', emailVerified: false },
  });

  const verifyToken = jwt.sign({ userId: user.id }, process.env.ACCESS_TOKEN_SECRET!, { expiresIn: '24h' });
  await sendVerificationEmail(email, verifyToken).catch(console.error);

  return res.status(201).json({ message: 'Check your email to verify your account' });
}

export async function verifyEmail(req: Request, res: Response) {
  const { token } = req.query as { token: string };
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as { userId: string };
    await prisma.user.update({ where: { id: decoded.userId }, data: { emailVerified: true } });
    return res.json({ message: 'Email verified successfully' });
  } catch {
    return res.status(400).json({ error: 'Invalid or expired verification token' });
  }
}

export async function login(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Validation failed' });
  }
  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: 'Invalid email or password' });

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ error: 'Invalid email or password' });

  if (!user.emailVerified) {
    return res.status(403).json({ error: 'Please verify your email first' });
  }

  const accessToken = signAccessToken({ userId: user.id, tier: user.tier });
  const refreshToken = signRefreshToken({ userId: user.id });
  const tokenHash = hashToken(refreshToken);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await prisma.refreshToken.create({ data: { userId: user.id, tokenHash, expiresAt } });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.json({ accessToken, user: { id: user.id, email: user.email, tier: user.tier } });
}

export async function refresh(req: Request, res: Response) {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) return res.status(401).json({ error: 'No refresh token' });

    try {
      verifyRefreshToken(token);
    } catch {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    const tokenHash = hashToken(token);
    const stored = await prisma.refreshToken.findUnique({ where: { tokenHash } });

    if (!stored || stored.revoked || stored.expiresAt < new Date()) {
      return res.status(401).json({ error: 'Refresh token expired or revoked' });
    }

    await prisma.refreshToken.update({ where: { id: stored.id }, data: { revoked: true } });

    const user = await prisma.user.findUnique({ where: { id: stored.userId } });
    if (!user) return res.status(401).json({ error: 'User not found' });

    const newAccessToken = signAccessToken({ userId: user.id, tier: user.tier });
    const newRefreshToken = signRefreshToken({ userId: user.id });
    const newHash = hashToken(newRefreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.refreshToken.create({ data: { userId: user.id, tokenHash: newHash, expiresAt } });

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({ accessToken: newAccessToken });
  } catch (err) {
    console.error('Refresh error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function logout(req: Request, res: Response) {
  const token = req.cookies?.refreshToken;
  if (token) {
    const tokenHash = hashToken(token);
    await prisma.refreshToken.updateMany({ where: { tokenHash }, data: { revoked: true } });
  }
  res.clearCookie('refreshToken');
  return res.status(204).send();
}

export async function forgotPassword(req: Request, res: Response) {
  const { email } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.json({ message: 'If that email exists, a reset link was sent' });

  const resetToken = jwt.sign({ userId: user.id }, process.env.ACCESS_TOKEN_SECRET!, { expiresIn: '1h' });
  await sendPasswordResetEmail(email, resetToken).catch(console.error);

  return res.json({ message: 'If that email exists, a reset link was sent' });
}

export async function resetPassword(req: Request, res: Response) {
  const { token, password } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as { userId: string };
    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.user.update({ where: { id: decoded.userId }, data: { passwordHash } });
    await prisma.refreshToken.updateMany({ where: { userId: decoded.userId }, data: { revoked: true } });
    return res.json({ message: 'Password reset successfully' });
  } catch {
    return res.status(400).json({ error: 'Invalid or expired token' });
  }
}
