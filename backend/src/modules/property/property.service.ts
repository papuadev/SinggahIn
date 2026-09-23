import {prisma} from '../../shared/services/prisma.service';
import {AppError} from '../../shared/utils/app-error';
import {PropertyResponseDto, PropertyListItemDto, PropertyCategoryDto} from './property.types';
import {CreatePropertyInput, UpdatePropertyInput} from './property.schema';
import {deleteFromCloudinary} from '../../shared/services/cloudinary.service';

export async function getPropertyCategories(): Promise<PropertyCategoryDto[]> {
    return prisma.propertyCategory.findMany({
        select : {
            id : true,
            name : true,
            slug : true,
            description : true
        },
        orderBy : {
            name : 'asc'
        }
    })
}

export async function verifyCategoryExists(categoryId: string): Promise<void> {
  const category = await prisma.propertyCategory.findUnique({
    where: { id: categoryId },
  });
  if (!category) {
    throw AppError.notFound('Kategori properti tidak ditemukan.');
  }
}

export async function verifyPropertyOwnership(
  propertyId: string,
  tenantId: string
) {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    include: { images: true },
  });
  if (!property) {
    throw AppError.notFound('Properti tidak ditemukan.');
  }
  if (property.tenantId !== tenantId) {
    throw AppError.forbidden('Anda tidak memiliki akses ke properti ini.');
  }
  return property;
}

export async function createProperty(
  tenantId: string,
  input: CreatePropertyInput
): Promise<PropertyResponseDto> {
  await verifyCategoryExists(input.categoryId);
  return prisma.property.create({
    data: {
      tenantId,
      ...input,
    },
    include: { category: true, images: true },
  });
}

function mapPropertyListItem(prop: {
  id: string;
  title: string;
  city: string;
  address: string;
  createdAt: Date;
  category: PropertyCategoryDto;
  images: { imageUrl: string; isCover: boolean }[];
}): PropertyListItemDto {
  const cover = prop.images.find((img) => img.isCover) || prop.images[0];
  return {
    id: prop.id,
    title: prop.title,
    city: prop.city,
    address: prop.address,
    category: prop.category,
    coverImage: cover ? cover.imageUrl : null,
    createdAt: prop.createdAt,
  };
}

export async function getTenantProperties(
  tenantId: string
): Promise<PropertyListItemDto[]> {
  const properties = await prisma.property.findMany({
    where: { tenantId },
    include: { category: true, images: true },
    orderBy: { createdAt: 'desc' },
  });
  return properties.map(mapPropertyListItem);
}

export const getPropertyTenant = getTenantProperties;

export async function getPropertyById(
  id: string
): Promise<PropertyResponseDto> {
  const property = await prisma.property.findUnique({
    where: { id },
    include: {
      category: true,
      images: { orderBy: { createdAt: 'asc' } },
      rooms: { orderBy: { basePrice: 'asc' } },
    },
  });
  if (!property) {
    throw AppError.notFound('Properti tidak ditemukan.');
  }
  return property;
}

export async function updateProperty(
  propertyId: string,
  tenantId: string,
  input: UpdatePropertyInput
): Promise<PropertyResponseDto> {
  await verifyPropertyOwnership(propertyId, tenantId);
  if (input.categoryId) {
    await verifyCategoryExists(input.categoryId);
  }
  return prisma.property.update({
    where: { id: propertyId },
    data: input,
    include: { category: true, images: true },
  });
}

async function cleanupPropertyImages(
  images: { publicId: string }[]
): Promise<void> {
  await Promise.all(images.map((img) => deleteFromCloudinary(img.publicId)));
}

export async function deleteProperty(
  propertyId: string,
  tenantId: string
): Promise<void> {
  const property = await verifyPropertyOwnership(propertyId, tenantId);
  if (property.images.length > 0) {
    await cleanupPropertyImages(property.images);
  }
  await prisma.property.delete({ where: { id: propertyId } });
}
