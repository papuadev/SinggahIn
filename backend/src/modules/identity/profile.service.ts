import { prisma } from '../../shared/services/prisma.service';
import { uploadToCloudinary, deleteFromCloudinary } from '../../shared/services/cloudinary.service';
import { AppError } from '../../shared/utils/app-error';
import { UpdateProfileInput, UserResponseDto } from './identity.types';
import { User } from '@prisma/client';

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
