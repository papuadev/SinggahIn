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
): Promise<{ hasCover: boolean; currentCount: number }> {
  const count = await prisma.propertyImage.count({ where: { propertyId } });
  if (count + additionalCount > 6) {
    throw AppError.badRequest('Total foto properti tidak boleh melebihi 6 gambar.');
  }
  const coverCount = await prisma.propertyImage.count({
    where: { propertyId, isCover: true },
  });
  return { hasCover: coverCount > 0, currentCount: count };
}

async function uploadSingleFile(
  file: Express.Multer.File, isCover: boolean, order: number, propertyId: string
): Promise<PropertyImageDto> {
  const uploaded = await uploadToCloudinary(file.buffer, 'singgahin/properties');
  const data = { propertyId, imageUrl: uploaded.secureUrl, publicId: uploaded.publicId, isCover, order };
  return prisma.propertyImage.create({ data });
}

export async function uploadPropertyImages(
  propertyId: string,
  tenantId: string,
  files: Express.Multer.File[]
): Promise<PropertyImageDto[]> {
  await verifyPropertyOwnership(propertyId, tenantId);
  const { hasCover, currentCount } = await validateImageLimit(propertyId, files.length);
  const results: PropertyImageDto[] = [];
  for (let i = 0; i < files.length; i++) {
    const isCover = !hasCover && i === 0;
    const created = await uploadSingleFile(files[i], isCover, currentCount + i, propertyId);
    results.push(created);
  }
  return results;
}

async function reassignCoverIfDeleted(propertyId: string, wasCover: boolean): Promise<void> {
  if (!wasCover) return;
  const first = await prisma.propertyImage.findFirst({
    where: { propertyId },
    orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
  });
  if (first) await prisma.propertyImage.update({ where: { id: first.id }, data: { isCover: true } });
}

async function findImageOrThrow(propertyId: string, imageId: string) {
  const image = await prisma.propertyImage.findUnique({ where: { id: imageId } });
  if (!image || image.propertyId !== propertyId) {
    throw AppError.notFound('Foto properti tidak ditemukan.');
  }
  return image;
}

export async function deletePropertyImage(
  propertyId: string, imageId: string, tenantId: string
): Promise<void> {
  await verifyPropertyOwnership(propertyId, tenantId);
  const image = await findImageOrThrow(propertyId, imageId);
  await deleteFromCloudinary(image.publicId);
  await prisma.propertyImage.delete({ where: { id: imageId } });
  await reassignCoverIfDeleted(propertyId, image.isCover);
}

export async function setCoverImage(
  propertyId: string, imageId: string, tenantId: string
): Promise<PropertyImageDto[]> {
  await verifyPropertyOwnership(propertyId, tenantId);
  await findImageOrThrow(propertyId, imageId);
  await prisma.$transaction([
    prisma.propertyImage.updateMany({ where: { propertyId }, data: { isCover: false } }),
    prisma.propertyImage.update({ where: { id: imageId }, data: { isCover: true } }),
  ]);
  return prisma.propertyImage.findMany({
    where: { propertyId },
    orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
  });
}

function validateReorderImageIds(existingImages: { id: string }[], imageIds: string[]): void {
  if (existingImages.length !== imageIds.length) {
    throw AppError.badRequest('Jumlah gambar tidak sesuai dengan data yang tersimpan.');
  }
  const existingIds = new Set(existingImages.map((img) => img.id));
  if (imageIds.some((id) => !existingIds.has(id))) {
    throw AppError.badRequest('ID gambar tidak valid atau bukan milik properti ini.');
  }
}

async function executeReorderTransaction(propertyId: string, imageIds: string[]): Promise<PropertyImageDto[]> {
  const updates = imageIds.map((id, index) =>
    prisma.propertyImage.update({ where: { id }, data: { order: index } })
  );
  await prisma.$transaction(updates);
  return prisma.propertyImage.findMany({
    where: { propertyId },
    orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
  });
}

export async function reorderPropertyImages(
  propertyId: string, tenantId: string, imageIds: string[]
): Promise<PropertyImageDto[]> {
  await verifyPropertyOwnership(propertyId, tenantId);
  const existingImages = await prisma.propertyImage.findMany({ where: { propertyId } });
  validateReorderImageIds(existingImages, imageIds);
  return executeReorderTransaction(propertyId, imageIds);
}
