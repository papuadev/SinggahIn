import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { TokenType } from '@prisma/client';
import { prisma } from '../../shared/services/prisma.service';
import { sendPasswordResetEmail } from '../../shared/services/mail.service';
import { AppError } from '../../shared/utils/app-error';
import { ForgotPasswordInput, ResetPasswordInput } from './identity.types';

const GENERIC_MSG = 'Jika alamat email terdaftar di SinggahIn, tautan reset password telah dikirim ke email Anda.';

async function createResetToken(userId: string, email: string): Promise<string> {
  await prisma.verificationToken.updateMany({
    where: { userId, type: TokenType.PASSWORD_RESET, isUsed: false },
    data: { isUsed: true },
  });
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
  await prisma.verificationToken.create({
    data: { userId, email, token, type: TokenType.PASSWORD_RESET, expiresAt },
  });
  return token;
}

export async function requestPasswordReset(input: ForgotPasswordInput): Promise<{ message: string }> {
  const user = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } });
  if (!user || !user.isVerified) return { message: GENERIC_MSG };
  const token = await createResetToken(user.id, user.email);
  await sendPasswordResetEmail(user.email, token);
  return { message: GENERIC_MSG };
}

async function findValidResetToken(token: string) {
  const record = await prisma.verificationToken.findFirst({
    where: { token, type: TokenType.PASSWORD_RESET, isUsed: false },
  });
  if (!record || record.expiresAt < new Date()) {
    throw AppError.badRequest('Token reset password tidak valid atau telah kedaluwarsa.');
  }
  return record;
}

async function executePasswordReset(tokenId: string, userId: string, hash: string): Promise<void> {
  await prisma.$transaction(async (tx) => {
    await tx.verificationToken.update({ where: { id: tokenId }, data: { isUsed: true } });
    await tx.user.update({ where: { id: userId }, data: { passwordHash: hash } });
  });
}

export async function resetPassword(input: ResetPasswordInput): Promise<{ message: string }> {
  const record = await findValidResetToken(input.token);
  const hash = await bcrypt.hash(input.password, 10);
  await executePasswordReset(record.id, record.userId, hash);
  return { message: 'Password berhasil diatur ulang. Silakan masuk menggunakan password baru Anda.' };
}
