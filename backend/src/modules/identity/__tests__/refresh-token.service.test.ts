import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as refreshTokenService from '../refresh-token.service';
import { prisma } from '../../../shared/services/prisma.service';

vi.mock('../../../shared/services/prisma.service', () => ({
  prisma: {
    refreshToken: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
  },
}));

describe('RefreshToken Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates refresh token with 7-day expiration', async () => {
    vi.mocked(prisma.refreshToken.create).mockResolvedValue({ id: 'rt-1' } as any);
    const token = await refreshTokenService.createRefreshToken('user-1');
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
    expect(prisma.refreshToken.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ userId: 'user-1' }),
      })
    );
  });

  it('rotates valid refresh token and revokes old one', async () => {
    const validRecord = {
      id: 'rt-old',
      userId: 'user-1',
      token: 'old-token',
      isRevoked: false,
      expiresAt: new Date(Date.now() + 1000000),
      user: { id: 'user-1', email: 'u@example.com', role: 'USER' },
    };
    vi.mocked(prisma.refreshToken.findUnique).mockResolvedValue(validRecord as any);
    vi.mocked(prisma.refreshToken.updateMany).mockResolvedValue({ count: 1 });
    vi.mocked(prisma.refreshToken.create).mockResolvedValue({ id: 'rt-new' } as any);

    const result = await refreshTokenService.rotateRefreshToken('old-token');
    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();
    expect(result.user.email).toBe('u@example.com');
    expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith({
      where: { token: 'old-token', isRevoked: false },
      data: { isRevoked: true },
    });
  });

  it('detects token reuse and revokes all user tokens', async () => {
    const reusedRecord = {
      id: 'rt-reused',
      userId: 'user-1',
      token: 'reused-token',
      isRevoked: true,
      expiresAt: new Date(Date.now() + 1000000),
      user: { id: 'user-1' },
    };
    vi.mocked(prisma.refreshToken.findUnique).mockResolvedValue(reusedRecord as any);

    await expect(refreshTokenService.rotateRefreshToken('reused-token')).rejects.toThrow(
      'Sesi login telah dibatalkan karena aktivitas mencurigakan.'
    );
    expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith({
      where: { userId: 'user-1', isRevoked: false },
      data: { isRevoked: true },
    });
  });

  it('throws 401 when token is expired', async () => {
    const expiredRecord = {
      id: 'rt-exp',
      userId: 'user-1',
      token: 'exp-token',
      isRevoked: false,
      expiresAt: new Date(Date.now() - 1000),
      user: { id: 'user-1' },
    };
    vi.mocked(prisma.refreshToken.findUnique).mockResolvedValue(expiredRecord as any);

    await expect(refreshTokenService.rotateRefreshToken('exp-token')).rejects.toThrow(
      'Sesi login telah berakhir.'
    );
  });

  it('throws 401 when token is not found', async () => {
    vi.mocked(prisma.refreshToken.findUnique).mockResolvedValue(null);
    await expect(refreshTokenService.rotateRefreshToken('none')).rejects.toThrow(
      'Sesi login tidak valid.'
    );
  });
});
