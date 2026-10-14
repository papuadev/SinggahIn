import { prisma } from '../../shared/services/prisma.service';
import { generateRefreshTokenString, signAccessToken } from '../../shared/services/token.service';
import { AppError } from '../../shared/utils/app-error';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export async function createRefreshToken(userId: string): Promise<string> {
  const token = generateRefreshTokenString();
  const expiresAt = new Date(Date.now() + SEVEN_DAYS_MS);
  await prisma.refreshToken.create({
    data: { userId, token, expiresAt },
  });
  return token;
}

export async function revokeRefreshToken(token: string): Promise<void> {
  await prisma.refreshToken.updateMany({
    where: { token, isRevoked: false },
    data: { isRevoked: true },
  });
}

export async function revokeAllUserTokens(userId: string): Promise<void> {
  await prisma.refreshToken.updateMany({
    where: { userId, isRevoked: false },
    data: { isRevoked: true },
  });
}

async function validateTokenRecord(token: string) {
  const record = await prisma.refreshToken.findUnique({
    where: { token },
    include: { user: true },
  });
  if (!record) throw AppError.unauthorized('Sesi login tidak valid.');
  if (record.isRevoked) {
    await revokeAllUserTokens(record.userId);
    throw AppError.unauthorized('Sesi login telah dibatalkan karena aktivitas mencurigakan.');
  }
  if (record.expiresAt < new Date()) {
    throw AppError.unauthorized('Sesi login telah berakhir.');
  }
  return record;
}

export async function rotateRefreshToken(oldToken: string) {
  const record = await validateTokenRecord(oldToken);
  await revokeRefreshToken(oldToken);
  const newRefreshToken = await createRefreshToken(record.userId);
  const newAccessToken = signAccessToken({
    userId: record.user.id,
    email: record.user.email,
    role: record.user.role,
  });
  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    user: record.user,
  };
}
