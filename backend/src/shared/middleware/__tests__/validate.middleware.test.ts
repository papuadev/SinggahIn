import { describe, it, expect, vi } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validateRequest } from '../validate.middleware';

describe('Validate Middleware', () => {
  it('should call next without error when payload satisfies schema', () => {
    const schema = {
      body: z.object({
        email: z.string().email()
      })
    };

    const req = {
      body: { email: 'user@example.com' }
    } as Request;
    const res = {} as Response;
    const next = vi.fn() as NextFunction;

    const middleware = validateRequest(schema);
    middleware(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });

  it('should forward ZodError to next when payload is invalid', () => {
    const schema = {
      body: z.object({
        email: z.string().email()
      })
    };

    const req = {
      body: { email: 'not-an-email' }
    } as Request;
    const res = {} as Response;
    const next = vi.fn() as NextFunction;

    const middleware = validateRequest(schema);
    middleware(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(z.ZodError));
  });
});
