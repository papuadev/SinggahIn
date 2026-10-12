import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as profileService from '../profile.service';
import { prisma } from '../../../shared/services/prisma.service';
import * as cloudinaryService from '../../../shared/services/cloudinary.service';
import { Role } from '@prisma/client';

vi.mock('../../../shared/services/prisma.service', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    verificationToken: {
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

import bcrypt from 'bcryptjs';
import * as mailService from '../../../shared/services/mail.service';

vi.mock('../../../shared/services/cloudinary.service', () => ({
  uploadToCloudinary: vi.fn(),
  deleteFromCloudinary: vi.fn(),
}));

vi.mock('../../../shared/services/mail.service', () => ({
  sendEmailChangeVerificationEmail: vi.fn(),
}));

describe('Profile Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockUser = {
    id: 'usr-123',
    email: 'user@test.com',
    name: 'Old Name',
    role: Role.USER,
    isVerified: true,
    avatarUrl: 'https://cloudinary.com/old.webp',
    avatarPublicId: 'singgahin/avatars/old-public-id',
    phoneNumber: '08123456789',
    createdAt: new Date(),
    updatedAt: new Date(),
    passwordHash: 'hashed',
  };

  it('updates avatar and deletes old Cloudinary image if present', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(mockUser as any);
    vi.mocked(cloudinaryService.uploadToCloudinary).mockResolvedValueOnce({
      secureUrl: 'https://cloudinary.com/new.webp',
      publicId: 'singgahin/avatars/new-public-id',
    });
    vi.mocked(prisma.user.update).mockResolvedValueOnce({
      ...mockUser,
      avatarUrl: 'https://cloudinary.com/new.webp',
      avatarPublicId: 'singgahin/avatars/new-public-id',
    } as any);

    const fakeFile = {
      buffer: Buffer.from('image-binary'),
      mimetype: 'image/png',
      originalname: 'avatar.png',
    } as Express.Multer.File;

    const result = await profileService.updateAvatar('usr-123', fakeFile);

    expect(result.avatarUrl).toBe('https://cloudinary.com/new.webp');
    expect(cloudinaryService.uploadToCloudinary).toHaveBeenCalledWith(fakeFile.buffer, 'singgahin/avatars');
    expect(cloudinaryService.deleteFromCloudinary).toHaveBeenCalledWith('singgahin/avatars/old-public-id');
  });

  it('updates profile name and phone number', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(mockUser as any);
    vi.mocked(prisma.user.update).mockResolvedValueOnce({
      ...mockUser,
      name: 'New Name',
      phoneNumber: '089988776655',
    } as any);

    const result = await profileService.updateProfile('usr-123', {
      name: 'New Name',
      phoneNumber: '089988776655',
    });

    expect(result.name).toBe('New Name');
    expect(result.phoneNumber).toBe('089988776655');
  });

  it('throws 404 if user not found when updating avatar', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null);
    const fakeFile = { buffer: Buffer.from('test') } as Express.Multer.File;

    await expect(profileService.updateAvatar('non-existent', fakeFile)).rejects.toThrow(
      'Pengguna tidak ditemukan.'
    );
  });

  describe('changePassword', () => {
    it('successfully changes password when current password matches', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(mockUser as any);
      vi.spyOn(bcrypt, 'compare')
        .mockResolvedValueOnce(true as never) // current matches
        .mockResolvedValueOnce(false as never); // new is different
      vi.mocked(prisma.user.update).mockResolvedValueOnce(mockUser as any);

      const res = await profileService.changePassword('usr-123', {
        currentPassword: 'oldpassword',
        newPassword: 'newpassword123',
      });

      expect(res.message).toBe('Password berhasil diperbarui.');
      expect(prisma.user.update).toHaveBeenCalled();
    });

    it('throws error when current password is wrong', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(mockUser as any);
      vi.spyOn(bcrypt, 'compare').mockResolvedValueOnce(false as never);

      await expect(
        profileService.changePassword('usr-123', {
          currentPassword: 'wrongpassword',
          newPassword: 'newpassword123',
        })
      ).rejects.toThrow('Password saat ini salah.');
    });
  });

  describe('requestEmailChange', () => {
    it('creates verification token and dispatches email when password is valid and new email available', async () => {
      vi.mocked(prisma.user.findUnique)
        .mockResolvedValueOnce(mockUser as any) // findUser
        .mockResolvedValueOnce(null); // existingEmail check
      vi.spyOn(bcrypt, 'compare').mockResolvedValueOnce(true as never);
      vi.mocked(prisma.verificationToken.updateMany).mockResolvedValueOnce({ count: 0 });
      vi.mocked(prisma.verificationToken.create).mockResolvedValueOnce({} as any);

      const res = await profileService.requestEmailChange('usr-123', {
        newEmail: 'newemail@example.com',
        password: 'password123',
      });

      expect(res.message).toContain('Tautan verifikasi telah dikirim ke newemail@example.com');
      expect(prisma.verificationToken.create).toHaveBeenCalled();
      expect(mailService.sendEmailChangeVerificationEmail).toHaveBeenCalled();
    });

    it('rejects email change when password is wrong', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(mockUser as any);
      vi.spyOn(bcrypt, 'compare').mockResolvedValueOnce(false as never);

      await expect(
        profileService.requestEmailChange('usr-123', {
          newEmail: 'newemail@example.com',
          password: 'wrongpassword',
        })
      ).rejects.toThrow('Password akun salah.');
    });

    it('rejects email change if new email is already taken', async () => {
      vi.mocked(prisma.user.findUnique)
        .mockResolvedValueOnce(mockUser as any) // findUser
        .mockResolvedValueOnce({ id: 'other-user', email: 'taken@example.com' } as any); // existing
      vi.spyOn(bcrypt, 'compare').mockResolvedValueOnce(true as never);

      await expect(
        profileService.requestEmailChange('usr-123', {
          newEmail: 'taken@example.com',
          password: 'password123',
        })
      ).rejects.toThrow('Email baru sudah terdaftar');
    });
  });

  describe('verifyEmailChange', () => {
    it('updates user email and marks token used', async () => {
      const tokenRecord = {
        id: 'tok-1',
        userId: 'usr-123',
        email: 'newverified@example.com',
        expiresAt: new Date(Date.now() + 100000),
        isUsed: false,
      };
      vi.mocked(prisma.verificationToken.findFirst).mockResolvedValueOnce(tokenRecord as any);
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null);
      vi.mocked(prisma.$transaction).mockImplementation(async (cb: any) =>
        cb({
          verificationToken: { update: vi.fn() },
          user: { update: vi.fn().mockResolvedValue({ ...mockUser, email: 'newverified@example.com' }) },
        })
      );

      const res = await profileService.verifyEmailChange('valid-token');
      expect(res.user.email).toBe('newverified@example.com');
      expect(res.message).toContain('berhasil diperbarui dan diverifikasi');
    });
  });
});
