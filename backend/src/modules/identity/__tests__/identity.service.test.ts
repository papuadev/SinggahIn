import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Role, TokenType } from '@prisma/client';
import * as identityService from '../identity.service';
import { prisma } from '../../../shared/services/prisma.service';
import * as mailService from '../../../shared/services/mail.service';
import * as tokenService from '../../../shared/services/token.service';
import bcrypt from 'bcryptjs';

vi.mock('../../../shared/services/prisma.service', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn()
    },
    verificationToken: {
      create: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn()
    },
    $transaction: vi.fn()
  }
}));

describe('Identity Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(mailService, 'sendVerificationEmail').mockResolvedValue();
    vi.spyOn(tokenService, 'signToken').mockReturnValue('mock-jwt-token');
  });

  describe('register', () => {
    it('should register new user and dispatch 1h verification token', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.user.create).mockResolvedValue({
        id: 'u1',
        email: 'test@example.com',
        role: Role.USER,
        isVerified: false,
        passwordHash: null,
        name: null,
        avatarUrl: null,
        avatarPublicId: null,
        phoneNumber: null,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const result = await identityService.register({
        email: 'test@example.com',
        role: Role.USER
      });

      expect(result.email).toBe('test@example.com');
      expect(prisma.verificationToken.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 'u1',
            type: TokenType.ACCOUNT_VERIFICATION
          })
        })
      );
      expect(mailService.sendVerificationEmail).toHaveBeenCalled();
    });

    it('should throw 409 conflict if email is already verified', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'u2',
        email: 'verified@example.com',
        isVerified: true
      } as any);

      await expect(
        identityService.register({
          email: 'verified@example.com',
          role: Role.USER
        })
      ).rejects.toThrow('Email sudah terdaftar. Silakan login.');
    });
  });

  describe('verifyAccount', () => {
    it('should reject expired verification token with 400', async () => {
      vi.mocked(prisma.verificationToken.findFirst).mockResolvedValue({
        id: 't1',
        token: 'expired-tok',
        expiresAt: new Date(Date.now() - 1000)
      } as any);

      await expect(
        identityService.verifyAccount({
          token: 'expired-tok',
          name: 'User',
          password: 'password123'
        })
      ).rejects.toThrow('Token verifikasi tidak valid atau telah kedaluwarsa.');
    });

    it('should hash password and verify account successfully', async () => {
      vi.mocked(prisma.verificationToken.findFirst).mockResolvedValue({
        id: 't2',
        userId: 'u3',
        token: 'valid-tok',
        expiresAt: new Date(Date.now() + 3600000)
      } as any);
      vi.mocked(prisma.$transaction).mockImplementation(async (cb: any) => {
        return cb({
          verificationToken: { update: vi.fn() },
          user: {
            update: vi.fn().mockResolvedValue({
              id: 'u3',
              email: 'valid@example.com',
              name: 'Valid User',
              role: Role.USER,
              isVerified: true,
              avatarUrl: null
            })
          }
        });
      });

      const res = await identityService.verifyAccount({
        token: 'valid-tok',
        name: 'Valid User',
        password: 'password123'
      });

      expect(res.user.name).toBe('Valid User');
      expect(res.token).toBe('mock-jwt-token');
    });
  });

  describe('login', () => {
    it('should throw 400 if user role does not match input role', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'u4',
        email: 'tenant@example.com',
        passwordHash: 'hash',
        isVerified: true,
        role: Role.TENANT
      } as any);

      await expect(
        identityService.login({
          email: 'tenant@example.com',
          password: 'pass',
          role: Role.USER
        })
      ).rejects.toThrow(/Akun ini terdaftar sebagai TENANT/);
    });

    it('should throw 401 on incorrect password', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'u5',
        email: 'user@example.com',
        passwordHash: 'hash',
        isVerified: true,
        role: Role.USER
      } as any);
      vi.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      await expect(
        identityService.login({
          email: 'user@example.com',
          password: 'wrongpassword',
          role: Role.USER
        })
      ).rejects.toThrow('Kombinasi email dan password salah.');
    });

    it('should succeed on valid credentials', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'u6',
        email: 'ok@example.com',
        name: 'Ok User',
        passwordHash: 'valid-hash',
        isVerified: true,
        role: Role.USER,
        avatarUrl: null
      } as any);
      vi.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      const res = await identityService.login({
        email: 'ok@example.com',
        password: 'correctpassword',
        role: Role.USER
      });

      expect(res.user.email).toBe('ok@example.com');
      expect(res.token).toBe('mock-jwt-token');
    });
  });
});
