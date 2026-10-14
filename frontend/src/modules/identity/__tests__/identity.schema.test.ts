import { describe, it, expect } from 'vitest';
import {
  registerSchema,
  verifySchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  requestEmailChangeSchema,
} from '../schemas/identity.schema';

describe('Identity Zod Schemas', () => {
  describe('registerSchema', () => {
    it('should validate correct user registration payload', () => {
      const result = registerSchema.safeParse({
        email: 'user@example.com',
        role: 'USER',
      });
      expect(result.success).toBe(true);
    });

    it('should validate correct tenant registration payload', () => {
      const result = registerSchema.safeParse({
        email: 'tenant@example.com',
        role: 'TENANT',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid email format', () => {
      const result = registerSchema.safeParse({
        email: 'invalid-email',
        role: 'USER',
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid role enum', () => {
      const result = registerSchema.safeParse({
        email: 'user@example.com',
        role: 'ADMIN',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('verifySchema', () => {
    it('should validate valid account activation input', () => {
      const result = verifySchema.safeParse({
        token: 'token-uuid-123',
        name: 'Rian Pratama',
        password: 'password123',
        confirmPassword: 'password123',
      });
      expect(result.success).toBe(true);
    });

    it('should reject mismatched passwords', () => {
      const result = verifySchema.safeParse({
        token: 'token-uuid-123',
        name: 'Rian Pratama',
        password: 'password123',
        confirmPassword: 'differentpassword',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Konfirmasi password tidak cocok');
      }
    });

    it('should reject password shorter than 8 chars', () => {
      const result = verifySchema.safeParse({
        token: 'token-uuid-123',
        name: 'Rian Pratama',
        password: 'short',
        confirmPassword: 'short',
      });
      expect(result.success).toBe(false);
    });

    it('should reject empty token or name shorter than 2 chars', () => {
      const result = verifySchema.safeParse({
        token: '',
        name: 'R',
        password: 'password123',
        confirmPassword: 'password123',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('loginSchema', () => {
    it('should validate valid login credentials', () => {
      const result = loginSchema.safeParse({
        email: 'user@example.com',
        password: 'password123',
        role: 'USER',
      });
      expect(result.success).toBe(true);
    });

    it('should reject empty password on login', () => {
      const result = loginSchema.safeParse({
        email: 'user@example.com',
        password: '',
        role: 'USER',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('forgotPasswordSchema', () => {
    it('should validate valid email', () => {
      const result = forgotPasswordSchema.safeParse({ email: 'user@example.com' });
      expect(result.success).toBe(true);
    });

    it('should reject invalid email format', () => {
      const result = forgotPasswordSchema.safeParse({ email: 'not-an-email' });
      expect(result.success).toBe(false);
    });
  });

  describe('resetPasswordSchema', () => {
    it('should validate matching passwords >= 8 chars and token', () => {
      const result = resetPasswordSchema.safeParse({
        token: 'reset-token-abc',
        password: 'newPassword123',
        confirmPassword: 'newPassword123',
      });
      expect(result.success).toBe(true);
    });

    it('should reject mismatched passwords', () => {
      const result = resetPasswordSchema.safeParse({
        token: 'reset-token-abc',
        password: 'newPassword123',
        confirmPassword: 'differentPassword123',
      });
      expect(result.success).toBe(false);
    });

    it('should reject short passwords', () => {
      const result = resetPasswordSchema.safeParse({
        token: 'reset-token-abc',
        password: 'short',
        confirmPassword: 'short',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('changePasswordSchema', () => {
    it('should validate valid password change', () => {
      const res = changePasswordSchema.safeParse({ currentPassword: 'oldPassword123', newPassword: 'newPassword123', confirmPassword: 'newPassword123' });
      expect(res.success).toBe(true);
    });

    it('should reject same new password as current password', () => {
      const res = changePasswordSchema.safeParse({ currentPassword: 'samePassword123', newPassword: 'samePassword123', confirmPassword: 'samePassword123' });
      expect(res.success).toBe(false);
    });

    it('should reject mismatched new password confirmation', () => {
      const res = changePasswordSchema.safeParse({ currentPassword: 'oldPassword123', newPassword: 'newPassword123', confirmPassword: 'wrongPassword123' });
      expect(res.success).toBe(false);
    });
  });

  describe('requestEmailChangeSchema', () => {
    it('should validate valid email change request', () => {
      const res = requestEmailChangeSchema.safeParse({ newEmail: 'newemail@example.com', password: 'currentPassword123' });
      expect(res.success).toBe(true);
    });

    it('should reject invalid new email format', () => {
      const res = requestEmailChangeSchema.safeParse({ newEmail: 'invalid-email', password: 'currentPassword123' });
      expect(res.success).toBe(false);
    });

    it('should reject empty password', () => {
      const res = requestEmailChangeSchema.safeParse({ newEmail: 'newemail@example.com', password: '' });
      expect(res.success).toBe(false);
    });
  });
});
