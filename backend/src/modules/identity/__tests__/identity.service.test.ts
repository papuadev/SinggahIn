import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Role, TokenType } from '@prisma/client';
import * as identityService from '../identity.service';
import { prisma } from '../../../shared/services/prisma.service';
import * as mailService from '../../../shared/services/mail.service';
import * as tokenService from '../../../shared/services/token.service';
import bcrypt from 'bcryptjs';

vi.mock('../../../shared/services/prisma.service', () => ({
  prisma: {
    user: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
    verificationToken: { create: vi.fn(), findFirst: vi.fn(), update: vi.fn() },
    $transaction: vi.fn()
  }
}));

const mockUser = (override = {}) => ({
  id: 'u1',
  email: 'test@example.com',
  name: 'Test',
  role: Role.USER,
  isVerified: false,
  passwordHash: null,
  avatarUrl: null,
  avatarPublicId: null,
  phoneNumber: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...override
});

describe('Identity Service (TASK-007 Verification)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(mailService, 'sendVerificationEmail').mockResolvedValue();
    vi.spyOn(tokenService, 'signToken').mockReturnValue('mock-jwt-token');
  });

  describe('register (Passwordless & 1h TTL Token)', () => {
    it('should register and dispatch token expiring in exactly 1 hour', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.user.create).mockResolvedValue(mockUser());

      const res = await identityService.register({ email: 'test@example.com', role: Role.USER });
      expect(res.email).toBe('test@example.com');

      const tokenCall = vi.mocked(prisma.verificationToken.create).mock.calls[0][0];
      const diffMs = (tokenCall.data.expiresAt as Date).getTime() - Date.now();
      expect(diffMs).toBeGreaterThan(59 * 60 * 1000);
      expect(diffMs).toBeLessThanOrEqual(60 * 60 * 1000);
      expect(tokenCall.data.type).toBe(TokenType.ACCOUNT_VERIFICATION);
      expect(mailService.sendVerificationEmail).toHaveBeenCalled();
    });

    it('should reject already verified email with 409 conflict', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser({ isVerified: true }));
      await expect(
        identityService.register({ email: 'test@example.com', role: Role.USER })
      ).rejects.toThrow('Email sudah terdaftar. Silakan login.');
    });
  });

  describe('verifyAccount (Bcrypt & Single-Use Invalidation)', () => {
    it('should reject expired token with 400 bad request', async () => {
      vi.mocked(prisma.verificationToken.findFirst).mockResolvedValue({
        id: 't1', token: 'exp', expiresAt: new Date(Date.now() - 1000)
      } as any);
      await expect(
        identityService.verifyAccount({ token: 'exp', name: 'A', password: 'password123' })
      ).rejects.toThrow('Token verifikasi tidak valid atau telah kedaluwarsa.');
    });

    it('should reject invalid or already used token (single-use check)', async () => {
      vi.mocked(prisma.verificationToken.findFirst).mockResolvedValue(null);
      await expect(
        identityService.verifyAccount({ token: 'used', name: 'A', password: 'password123' })
      ).rejects.toThrow('Token verifikasi tidak valid atau telah kedaluwarsa.');
    });

    it('should hash password with bcrypt and invalidate token to isUsed: true', async () => {
      const tokenRecord = { id: 't2', userId: 'u2', token: 'v', expiresAt: new Date(Date.now() + 3600000) };
      vi.mocked(prisma.verificationToken.findFirst).mockResolvedValue(tokenRecord as any);
      const updateTokenMock = vi.fn();
      vi.mocked(prisma.$transaction).mockImplementation(async (cb: any) =>
        cb({ verificationToken: { update: updateTokenMock }, user: { update: vi.fn().mockResolvedValue(mockUser({ name: 'Verified', isVerified: true })) } })
      );
      const hashSpy = vi.spyOn(bcrypt, 'hash');

      const res = await identityService.verifyAccount({ token: 'v', name: 'Verified', password: 'pwd' });
      expect(hashSpy).toHaveBeenCalledWith('pwd', 10);
      expect(updateTokenMock).toHaveBeenCalledWith({ where: { id: 't2' }, data: { isUsed: true } });
      expect(res.user.name).toBe('Verified');
      expect(res.token).toBe('mock-jwt-token');
    });
  });

  describe('login (Dual-Role User/Tenant & Credentials)', () => {
    it('should succeed for valid USER credentials', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser({ isVerified: true, role: Role.USER, passwordHash: 'h' }));
      vi.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      const res = await identityService.login({ email: 'test@example.com', password: 'pwd', role: Role.USER });
      expect(res.user.role).toBe(Role.USER);
      expect(res.token).toBe('mock-jwt-token');
    });

    it('should succeed for valid TENANT credentials', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser({ isVerified: true, role: Role.TENANT, passwordHash: 'h' }));
      vi.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      const res = await identityService.login({ email: 'test@example.com', password: 'pwd', role: Role.TENANT });
      expect(res.user.role).toBe(Role.TENANT);
      expect(res.token).toBe('mock-jwt-token');
    });

    it('should throw error when logging into wrong role portal', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser({ isVerified: true, role: Role.TENANT, passwordHash: 'h' }));
      await expect(
        identityService.login({ email: 'test@example.com', password: 'pwd', role: Role.USER })
      ).rejects.toThrow(/Akun ini terdaftar sebagai TENANT/);
    });

    it('should throw 401 when password does not match bcrypt hash', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser({ isVerified: true, passwordHash: 'h' }));
      vi.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);
      await expect(
        identityService.login({ email: 'test@example.com', password: 'wrong', role: Role.USER })
      ).rejects.toThrow('Kombinasi email dan password salah.');
    });
  });

  describe('getProfile', () => {
    it('should return user profile DTO when user exists', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser({ id: 'u1', name: 'Profile User' }));
      const profile = await identityService.getProfile('u1');
      expect(profile.name).toBe('Profile User');
    });

    it('should throw 404 when user profile not found', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      await expect(identityService.getProfile('none')).rejects.toThrow('Pengguna tidak ditemukan.');
    });
  });
});
