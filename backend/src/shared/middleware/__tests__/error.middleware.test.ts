import { describe, it, expect, vi } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { errorHandler } from '../error.middleware';
import { AppError } from '../../utils/app-error';

describe('Error Middleware', () => {
  const mockResponse = () => {
    const res = {} as Response;
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
  };

  it('should format AppError correctly', () => {
    const res = mockResponse();
    const err = AppError.notFound('Data tidak ditemukan');

    errorHandler(err, {} as Request, res, vi.fn() as NextFunction);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Data tidak ditemukan',
      statusCode: 404
    });
  });

  it('should format ZodError with field errors array', () => {
    const res = mockResponse();
    const schema = z.object({ code: z.string().min(3, 'Minimal 3 karakter') });
    const parseResult = schema.safeParse({ code: 'a' });

    if (!parseResult.success) {
      errorHandler(parseResult.error, {} as Request, res, vi.fn() as NextFunction);
    }

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'Validasi data gagal.',
        statusCode: 400
      })
    );
  });

  it('should fallback to 500 for generic unhandled errors', () => {
    const res = mockResponse();
    const err = new Error('Unexpected crash');

    errorHandler(err, {} as Request, res, vi.fn() as NextFunction);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Terjadi kesalahan internal pada server.',
      statusCode: 500
    });
  });
});
