import { prisma } from '../../shared/services/prisma.service';
import { AppError } from '../../shared/utils/app-error';
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from '../../shared/services/cloudinary.service';
import { verifyPropertyOwnership } from './property.service';
import { PropertyImageDto } from './property.types';

async function validateImageLimit(
  propertyId: string,
  additionalCount: number
): Promise<boolean> {
  const count = await prisma.propertyImage.count({ where: { propertyId } });
  if (count + additionalCount > 6) {
    throw AppError.badRequest('Total foto properti tidak boleh melebihi 6 gambar.');
  }
  const coverCount = await prisma.propertyImage.count({
    where: { propertyId, isCover: true },
  });
  return coverCount > 0;
}

async function uploadSingleFile(
  file: Express.Multer.File,
  isCover: boolean,
  propertyId: string
): Promise<PropertyImageDto> {
  const uploaded = await uploadToCloudinary(file.buffer, 'singgahin/properties');
  return prisma.propertyImage.create({
    data: {
      propertyId,
      imageUrl: uploaded.secureUrl,
      publicId: uploaded.publicId,
      isCover,
    },
  });
}

export async function uploadPropertyImages(
  propertyId: string,
  tenantId: string,
  files: Express.Multer.File[]
): Promise<PropertyImageDto[]> {
  await verifyPropertyOwnership(propertyId, tenantId);
  const hasCover = await validateImageLimit(propertyId, files.length);
  const results: PropertyImageDto[] = [];
  for (let i = 0; i < files.length; i++) {
    const isCover = !hasCover && i === 0;
    const created = await uploadSingleFile(files[i], isCover, propertyId);
    results.push(created);
  }
  return results;
}

async function reassignCoverIfDeleted(
  propertyId: string,
  wasCover: boolean
): Promise<void> {
  if (!wasCover) return;
  const firstRemaining = await prisma.propertyImage.findFirst({
    where: { propertyId },
    orderBy: { createdAt: 'asc' },
  });
  if (firstRemaining) {
    await prisma.propertyImage.update({
      where: { id: firstRemaining.id },
      data: { isCover: true },
    });
  }
}

export async function deletePropertyImage(
  propertyId: string,
  imageId: string,
  tenantId: string
): Promise<void> {
  await verifyPropertyOwnership(propertyId, tenantId);
  const image = await prisma.propertyImage.findUnique({
    where: { id: imageId },
  });
  if (!image || image.propertyId !== propertyId) {
    throw AppError.notFound('Foto properti tidak ditemukan.');
  }
  await deleteFromCloudinary(image.publicId);
  await prisma.propertyImage.delete({ where: { id: imageId } });
  await reassignCoverIfDeleted(propertyId, image.isCover);
}

export async function setCoverImage(
  propertyId: string,
  imageId: string,
  tenantId: string
): Promise<PropertyImageDto[]> {
  await verifyPropertyOwnership(propertyId, tenantId);
  const targetImage = await prisma.propertyImage.findUnique({
    where: { id: imageId },
  });
  if (!targetImage || targetImage.propertyId !== propertyId) {
    throw AppError.notFound('Foto properti tidak ditemukan.');
  }
  await prisma.$transaction([
    prisma.propertyImage.updateMany({
      where: { propertyId },
      data: { isCover: false },
    }),
    prisma.propertyImage.update({
      where: { id: imageId },
      data: { isCover: true },
    }),
  ]);
  return prisma.propertyImage.findMany({
    where: { propertyId },
    orderBy: { createdAt: 'asc' },
  });
}
