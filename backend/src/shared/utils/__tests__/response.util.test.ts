import { describe, it, expect, vi } from 'vitest';
import { Response } from 'express';
import { sendSuccess, sendError } from '../response.util';

describe('Response Utilities', () => {
  const mockResponse = () => {
    const res = {} as Response;
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
  };

  it('should format sendSuccess response correctly with default status 200', () => {
    const res = mockResponse();
    const data = { id: 'cuid123', name: 'Test User' };

    sendSuccess(res, data, 'Success test');

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Success test',
      data
    });
  });

  it('should include pagination meta when provided to sendSuccess', () => {
    const res = mockResponse();
    const meta = { page: 1, limit: 10, totalItems: 50, totalPages: 5 };

    sendSuccess(res, [], 'List items', 200, meta);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'List items',
      data: [],
      meta
    });
  });

  it('should format sendError response correctly with default status 500', () => {
    const res = mockResponse();

    sendError(res, 'Internal error');

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Internal error',
      statusCode: 500
    });
  });

  it('should include field errors in sendError if provided', () => {
    const res = mockResponse();
    const errors = [{ field: 'email', message: 'Email tidak valid' }];

    sendError(res, 'Validasi gagal', 400, errors);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Validasi gagal',
      statusCode: 400,
      errors
    });
  });
});
