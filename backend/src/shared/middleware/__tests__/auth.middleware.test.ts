import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { authenticate, requireRole } from '../auth.middleware';
import * as tokenService from '../../services/token.service';

describe('Auth Middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = { cookies: {}, headers: {} };
    res = {};
    next = vi.fn();
  });

  describe('authenticate', () => {
    it('should authenticate user from cookie token', () => {
      req.cookies = { token: 'valid-jwt' };
      vi.spyOn(tokenService, 'verifyToken').mockReturnValue({
        userId: 'u1',
        email: 'u1@example.com',
        role: Role.USER
      });

      authenticate(req as Request, res as Response, next);

      expect(req.user).toEqual({
        userId: 'u1',
        email: 'u1@example.com',
        role: Role.USER
      });
      expect(next).toHaveBeenCalledWith();
    });

    it('should authenticate user from Bearer authorization header', () => {
      req.headers = { authorization: 'Bearer header-jwt' };
      vi.spyOn(tokenService, 'verifyToken').mockReturnValue({
        userId: 'u2',
        email: 'u2@example.com',
        role: Role.TENANT
      });

      authenticate(req as Request, res as Response, next);

      expect(req.user?.role).toBe(Role.TENANT);
      expect(next).toHaveBeenCalledWith();
    });

    it('should call next with 401 when token is missing', () => {
      authenticate(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 401 })
      );
    });
  });

  describe('requireRole', () => {
    it('should allow access when user role matches allowed roles', () => {
      req.user = { userId: 'u1', email: 'u@e.com', role: Role.TENANT };
      const guard = requireRole(Role.TENANT);

      guard(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith();
    });

    it('should call next with 403 when user role is not allowed', () => {
      req.user = { userId: 'u1', email: 'u@e.com', role: Role.USER };
      const guard = requireRole(Role.TENANT);

      guard(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 403 })
      );
    });
  });
});
