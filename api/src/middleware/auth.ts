import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types/index.js';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function authenticateToken(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: '未提供认证令牌' });
    return;
  }

  const secret = process.env.JWT_SECRET || '';
  
  if (!secret) {
    res.status(500).json({ error: '服务器配置错误：未设置 JWT_SECRET' });
    return;
  }
  
  jwt.verify(token, secret, (err, user) => {
    if (err) {
      res.status(403).json({ error: '令牌无效或已过期' });
      return;
    }
    
    req.user = user as JwtPayload;
    next();
  });
}

export function generateToken(user: { id: number; username: string }): string {
  const secret = process.env.JWT_SECRET || '';
  if (!secret) {
    throw new Error('服务器配置错误：未设置 JWT_SECRET');
  }
  return jwt.sign(
    { id: user.id, username: user.username },
    secret,
    { expiresIn: '24h' }
  );
}
