import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { User, TokenType, Prisma } from '@prisma/client';
import { prisma } from '../../shared/services/prisma.service';
import { sendEmailChangeVerificationEmail } from '../../shared/services/mail.service';
import { AppError } from '../../shared/utils/app-error';
import { RequestEmailChangeInput, UserResponseDto } from './identity.types';
import { findUserOrThrow, toUserDto } from './profile.service';

async function assertEmailChangeEligible(user: User, newEmail: string, password: string): Promise<void> {
  if (!user.passwordHash) throw AppError.badRequest('Kata sandi diperlukan untuk konfirmasi keamanan.');
  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) throw AppError.badRequest('Password akun salah. Konfirmasi perubahan email gagal.');
  if (newEmail === user.email.toLowerCase()) {
    throw AppError.badRequest('Email baru tidak boleh sama dengan email saat ini.');
  }
  const existing = await prisma.user.findUnique({ where: { email: newEmail } });
  if (existing) throw AppError.conflict('Email baru sudah terdaftar dan digunakan oleh akun lain.');
}

async function createVerificationToken(userId: string, newEmail: string): Promise<string> {
  await prisma.verificationToken.updateMany({
    where: { userId, type: TokenType.ACCOUNT_VERIFICATION, isUsed: false },
    data: { isUsed: true },
  });
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
  await prisma.verificationToken.create({
    data: { userId, email: newEmail, token, type: TokenType.ACCOUNT_VERIFICATION, expiresAt },
  });
  return token;
}

export async function requestEmailChange(
  userId: string,
  input: RequestEmailChangeInput
): Promise<{ message: string }> {
  const user = await findUserOrThrow(userId);
  const normalizedNewEmail = input.newEmail.trim().toLowerCase();
  await assertEmailChangeEligible(user, normalizedNewEmail, input.password);
  const token = await createVerificationToken(user.id, normalizedNewEmail);
  await sendEmailChangeVerificationEmail(normalizedNewEmail, token);
  return {
    message: `Tautan verifikasi telah dikirim ke ${normalizedNewEmail}. Silakan periksa email baru Anda untuk mengonfirmasi perubahan.`,
  };
}

async function assertTokenValid(token: string) {
  const record = await prisma.verificationToken.findFirst({
    where: { token, type: TokenType.ACCOUNT_VERIFICATION, isUsed: false },
  });
  if (!record || record.expiresAt < new Date()) {
    throw AppError.badRequest('Token verifikasi email tidak valid atau telah kedaluwarsa.');
  }
  const existing = await prisma.user.findUnique({ where: { email: record.email } });
  if (existing && existing.id !== record.userId) {
    throw AppError.conflict('Email baru sudah digunakan oleh akun lain.');
  }
  return record;
}

async function executeEmailChangeTx(record: { id: string; userId: string; email: string }) {
  return prisma.$transaction(async (tx) => {
    await tx.verificationToken.update({ where: { id: record.id }, data: { isUsed: true } });
    return tx.user.update({ where: { id: record.userId }, data: { email: record.email, isVerified: true } });
  });
}

export async function verifyEmailChange(
  token: string
): Promise<{ user: UserResponseDto; message: string }> {
  const record = await assertTokenValid(token);
  const updatedUser = await executeEmailChangeTx(record);
  return {
    user: toUserDto(updatedUser),
    message: 'Alamat email berhasil diperbarui dan diverifikasi.',
  };
}
