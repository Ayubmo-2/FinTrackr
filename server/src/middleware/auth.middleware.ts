import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../services/token.service';

export interface AuthRequest extends Request {
  userId?: string;
  tier?: string;
}

export function verifyJWT(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = verifyAccessToken(token);
    req.userId = decoded.userId;
    req.tier = decoded.tier;
    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      return res.status(403).json({ error: 'Token expired' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
}
