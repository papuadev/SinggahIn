import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response.util';

export function notFoundHandler(
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  sendError(
    res,
    `Rute ${req.method} ${req.originalUrl} tidak ditemukan pada server.`,
    404
  );
}
