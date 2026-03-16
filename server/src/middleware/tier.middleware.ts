import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';

export function requirePro(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.tier !== 'PRO') {
    return res.status(403).json({
      error: 'Pro subscription required',
      upgradeUrl: '/upgrade',
    });
  }
  next();
}
