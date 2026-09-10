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
  },
}));

vi.mock('../../../shared/services/cloudinary.service', () => ({
  uploadToCloudinary: vi.fn(),
  deleteFromCloudinary: vi.fn(),
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
});
