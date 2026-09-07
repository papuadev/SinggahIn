import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/app-error';
import { sendError } from '../utils/response.util';
import { FieldError } from '../types/api.types';

function formatZodErrors(error: ZodError): FieldError[] {
  return error.issues.map((issue) => ({
    field: issue.path.join('.'),
    message: issue.message
  }));
}

function handleZodError(res: Response, err: ZodError): void {
  const fieldErrors = formatZodErrors(err);
  sendError(res, 'Validasi data gagal.', 400, fieldErrors);
}

function handleAppError(res: Response, err: AppError): void {
  sendError(res, err.message, err.statusCode, err.errors);
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof ZodError) {
    handleZodError(res, err);
    return;
  }
  if (err instanceof AppError) {
    handleAppError(res, err);
    return;
  }
  sendError(res, 'Terjadi kesalahan internal pada server.', 500);
}
