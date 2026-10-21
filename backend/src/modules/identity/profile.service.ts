import bcrypt from 'bcryptjs';
import { prisma } from '../../shared/services/prisma.service';
import { uploadToCloudinary, deleteFromCloudinary } from '../../shared/services/cloudinary.service';
import { AppError } from '../../shared/utils/app-error';
import {
  UpdateProfileInput,
  ChangePasswordInput,
  UserResponseDto,
} from './identity.types';
import { User } from '@prisma/client';

export function toUserDto(user: User): UserResponseDto {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    avatarUrl: user.avatarUrl,
    phoneNumber: user.phoneNumber,
  };
}

export async function findUserOrThrow(userId: string): Promise<User> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw AppError.notFound('Pengguna tidak ditemukan.');
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

async function assertPasswordChangeValid(currentPassword: string, newPassword: string, hash: string | null): Promise<void> {
  if (!hash) throw AppError.badRequest('Akun Anda belum memiliki kata sandi.');
  if (!(await bcrypt.compare(currentPassword, hash))) {
    throw AppError.badRequest('Password saat ini salah.');
  }
  if (await bcrypt.compare(newPassword, hash)) {
    throw AppError.badRequest('Password baru harus berbeda dari password saat ini.');
  }
}

export async function changePassword(
  userId: string,
  input: ChangePasswordInput
): Promise<{ message: string }> {
  const user = await findUserOrThrow(userId);
  await assertPasswordChangeValid(input.currentPassword, input.newPassword, user.passwordHash);
  const newHash = await bcrypt.hash(input.newPassword, 10);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash: newHash } });
  return { message: 'Password berhasil diperbarui.' };
}

export { requestEmailChange, verifyEmailChange } from './email-change.service';

