import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { verifyToken } from '../services/token.service';
import { AppError } from '../utils/app-error';

function extractToken(req: Request): string | null {
  if (req.cookies?.token) return req.cookies.token;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}

export function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const token = extractToken(req);
  if (!token) {
    next(AppError.unauthorized('Sesi login tidak valid atau belum tersedia.'));
    return;
  }
  try {
    req.user = verifyToken(token);
    next();
  } catch (error) {
    next(error);
  }
}

export function requireRole(...allowedRoles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      next(AppError.forbidden('Akses ditolak untuk peran pengguna saat ini.'));
      return;
    }
    next();
  };
}
