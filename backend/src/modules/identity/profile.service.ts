import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { prisma } from '../../shared/services/prisma.service';
import { uploadToCloudinary, deleteFromCloudinary } from '../../shared/services/cloudinary.service';
import { sendEmailChangeVerificationEmail } from '../../shared/services/mail.service';
import { AppError } from '../../shared/utils/app-error';
import {
  UpdateProfileInput,
  ChangePasswordInput,
  RequestEmailChangeInput,
  UserResponseDto,
} from './identity.types';
import { User, TokenType } from '@prisma/client';

function toUserDto(user: User): UserResponseDto {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    avatarUrl: user.avatarUrl,
    phoneNumber: user.phoneNumber,
  };
}

async function findUserOrThrow(userId: string): Promise<User> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw AppError.notFound('Pengguna tidak ditemukan.');
  }
  return user;
}

export async function updateAvatar(
  userId: string,
  file: Express.Multer.File
): Promise<{ avatarUrl: string }> {
  const user = await findUserOrThrow(userId);
  const uploadResult = await uploadToCloudinary(file.buffer, 'singgahin/avatars');
  if (user.avatarPublicId) {
    await deleteFromCloudinary(user.avatarPublicId);
  }
  await prisma.user.update({
    where: { id: userId },
    data: { avatarUrl: uploadResult.secureUrl, avatarPublicId: uploadResult.publicId },
  });
  return { avatarUrl: uploadResult.secureUrl };
}

export async function updateProfile(
  userId: string,
  input: UpdateProfileInput
): Promise<UserResponseDto> {
  await findUserOrThrow(userId);
  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.phoneNumber !== undefined && { phoneNumber: input.phoneNumber }),
    },
  });
  return toUserDto(updated);
}

export async function changePassword(
  userId: string,
  input: ChangePasswordInput
): Promise<{ message: string }> {
  const user = await findUserOrThrow(userId);

  if (!user.passwordHash) {
    throw AppError.badRequest('Akun Anda belum memiliki kata sandi.');
  }

  const isMatch = await bcrypt.compare(input.currentPassword, user.passwordHash);
  if (!isMatch) {
    throw AppError.badRequest('Password saat ini salah.');
  }

  const isSame = await bcrypt.compare(input.newPassword, user.passwordHash);
  if (isSame) {
    throw AppError.badRequest('Password baru harus berbeda dari password saat ini.');
  }

  const newHash = await bcrypt.hash(input.newPassword, 10);

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: newHash },
  });

  return { message: 'Password berhasil diperbarui.' };
}

export async function requestEmailChange(
  userId: string,
  input: RequestEmailChangeInput
): Promise<{ message: string }> {
  const user = await findUserOrThrow(userId);

  if (!user.passwordHash) {
    throw AppError.badRequest('Kata sandi diperlukan untuk konfirmasi keamanan.');
  }

  const isMatch = await bcrypt.compare(input.password, user.passwordHash);
  if (!isMatch) {
    throw AppError.badRequest('Password akun salah. Konfirmasi perubahan email gagal.');
  }

  const normalizedNewEmail = input.newEmail.trim().toLowerCase();

  if (normalizedNewEmail === user.email.toLowerCase()) {
    throw AppError.badRequest('Email baru tidak boleh sama dengan email saat ini.');
  }

  const existingEmail = await prisma.user.findUnique({
    where: { email: normalizedNewEmail },
  });

  if (existingEmail) {
    throw AppError.conflict('Email baru sudah terdaftar dan digunakan oleh akun lain.');
  }

  // Invalidate any active previous unused tokens for this user
  await prisma.verificationToken.updateMany({
    where: {
      userId: user.id,
      type: TokenType.ACCOUNT_VERIFICATION,
      isUsed: false,
    },
    data: { isUsed: true },
  });

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.verificationToken.create({
    data: {
      userId: user.id,
      email: normalizedNewEmail,
      token,
      type: TokenType.ACCOUNT_VERIFICATION,
      expiresAt,
    },
  });

  await sendEmailChangeVerificationEmail(normalizedNewEmail, token);

  return {
    message: `Tautan verifikasi telah dikirim ke ${normalizedNewEmail}. Silakan periksa email baru Anda untuk mengonfirmasi perubahan.`,
  };
}

export async function verifyEmailChange(
  token: string
): Promise<{ user: UserResponseDto; message: string }> {
  const record = await prisma.verificationToken.findFirst({
    where: {
      token,
      type: TokenType.ACCOUNT_VERIFICATION,
      isUsed: false,
    },
  });

  if (!record || record.expiresAt < new Date()) {
    throw AppError.badRequest('Token verifikasi email tidak valid atau telah kedaluwarsa.');
  }

  const existing = await prisma.user.findUnique({
    where: { email: record.email },
  });
  if (existing && existing.id !== record.userId) {
    throw AppError.conflict('Email baru sudah digunakan oleh akun lain.');
  }

  const updatedUser = await prisma.$transaction(async (tx) => {
    await tx.verificationToken.update({
      where: { id: record.id },
      data: { isUsed: true },
    });
    return tx.user.update({
      where: { id: record.userId },
      data: { email: record.email, isVerified: true },
    });
  });

  return {
    user: toUserDto(updatedUser),
    message: 'Alamat email berhasil diperbarui dan diverifikasi.',
  };
}

