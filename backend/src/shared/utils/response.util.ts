import { Response } from 'express';
import {
  ApiResponse,
  ApiErrorResponse,
  PaginationMeta,
  FieldError
} from '../types/api.types';

export function sendSuccess<T>(
  res: Response,
  data: T,
  message = 'Operasi berhasil.',
  statusCode = 200,
  meta?: PaginationMeta
): Response {
  const payload: ApiResponse<T> = { success: true, message, data };
  if (meta) payload.meta = meta;
  return res.status(statusCode).json(payload);
}

export function sendError(
  res: Response,
  message: string,
  statusCode = 500,
  errors?: FieldError[]
): Response {
  const payload: ApiErrorResponse = {
    success: false,
    message,
    statusCode
  };
  if (errors && errors.length > 0) payload.errors = errors;
  return res.status(statusCode).json(payload);
}
