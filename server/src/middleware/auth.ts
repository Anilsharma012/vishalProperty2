import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export type JwtPayload = { id: string; role: 'admin'|'user'; email: string };

export function signToken(payload: JwtPayload, expiresIn = process.env.TOKEN_EXPIRES || '7d') {
  return jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, process.env.JWT_SECRET || 'secret') as JwtPayload;
}

export interface AuthedRequest extends Request { user?: JwtPayload }

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.get('authorization');
  const bearer = header?.startsWith('Bearer ') ? header.slice(7) : null;
  const token = bearer || req.cookies?.token;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  try {
    req.user = verifyToken(token);
    next();
  } catch {
    return res.status(401).json({ message: 'Unauthorized' });
  }
}

export function requireRole(...roles: Array<'admin'|'user'>) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    if (!roles.includes(req.user.role)) return res.status(403).json({ message: 'Forbidden' });
    next();
  };
}
