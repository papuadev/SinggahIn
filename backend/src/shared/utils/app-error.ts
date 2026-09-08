import { FieldError } from '../types/api.types';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errors?: FieldError[];
  public readonly isOperational: boolean;

  constructor(message: string, statusCode = 500, errors?: FieldError[]) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;
    Object.setPrototypeOf(this, new.target.prototype);
  }

  static badRequest(message: string, errors?: FieldError[]): AppError {
    return new AppError(message, 400, errors);
  }

  static unauthorized(
    message = 'Akses ditolak. Silakan login terlebih dahulu.'
  ): AppError {
    return new AppError(message, 401);
  }

  static forbidden(
    message = 'Anda tidak memiliki izin untuk mengakses resource ini.'
  ): AppError {
    return new AppError(message, 403);
  }

  static notFound(message = 'Resource tidak ditemukan.'): AppError {
    return new AppError(message, 404);
  }

  static conflict(message: string): AppError {
    return new AppError(message, 409);
  }

  static internal(
    message = 'Terjadi kesalahan internal pada server.'
  ): AppError {
    return new AppError(message, 500);
  }
}
