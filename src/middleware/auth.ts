import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';

export interface AuthRequest extends Request {
  userId?: number;
  username?: string;
}

export function authMiddleware(
  req: AuthRequest, 
  res: Response, 
  next: NextFunction
): void {
  try {
    const token = req.cookies.token || 
                  req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const decoded = AuthService.verifyToken(token);
    req.userId = decoded.userId;
    req.username = decoded.username;

    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

