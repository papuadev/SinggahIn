import { prisma } from '../../shared/services/prisma.service';
import { AppError } from '../../shared/utils/app-error';
import { PaginationMeta } from '../../shared/types/api.types';
import { PropertyResponseDto, PropertyListItemDto, PropertyCategoryDto } from './property.types';
import { CreatePropertyInput, UpdatePropertyInput, GetTenantPropertiesQueryInput } from './property.schema';
import { deleteFromCloudinary } from '../../shared/services/cloudinary.service';
import { buildTenantPropertyWhere, buildTenantPropertyOrderBy } from './property-query.helper';

export async function getPropertyCategories(): Promise<PropertyCategoryDto[]> {
  return prisma.propertyCategory.findMany({
    select: { id: true, name: true, slug: true, description: true },
    orderBy: { name: 'asc' },
  });
}

export async function verifyCategoryExists(categoryId: string): Promise<void> {
  const category = await prisma.propertyCategory.findUnique({ where: { id: categoryId } });
  if (!category) throw AppError.notFound('Kategori properti tidak ditemukan.');
}

export async function verifyPropertyOwnership(propertyId: string, tenantId: string) {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    include: { images: true },
  });
  if (!property) throw AppError.notFound('Properti tidak ditemukan.');
  if (property.tenantId !== tenantId) throw AppError.forbidden('Anda tidak memiliki akses ke properti ini.');
  return property;
}

export async function createProperty(tenantId: string, input: CreatePropertyInput): Promise<PropertyResponseDto> {
  await verifyCategoryExists(input.categoryId);
  return prisma.property.create({
    data: { tenantId, ...input },
    include: { category: true, images: true },
  });
}

type PropertyWithImages = {
  id: string; title: string; city: string; address: string; createdAt: Date;
  category: PropertyCategoryDto; images: { imageUrl: string; isCover: boolean }[];
};

function mapPropertyListItem(prop: PropertyWithImages): PropertyListItemDto {
  const cover = prop.images.find((img) => img.isCover) || prop.images[0];
  const coverImage = cover ? cover.imageUrl : null;
  return {
    id: prop.id, title: prop.title, city: prop.city, address: prop.address,
    category: prop.category, coverImage, createdAt: prop.createdAt,
  };
}

export async function getTenantProperties(
  tenantId: string,
  query?: GetTenantPropertiesQueryInput
): Promise<PropertyListItemDto[] | { data: PropertyListItemDto[]; meta: PaginationMeta }> {
  const where = buildTenantPropertyWhere(tenantId, query);
  const orderBy = buildTenantPropertyOrderBy(query?.sortBy);

  if (query?.page || query?.limit) {
    const page = query.page || 1;
    const limit = query.limit || 6;
    const skip = (page - 1) * limit;
    const [totalItems, properties] = await Promise.all([
      prisma.property.count({ where }),
      prisma.property.findMany({ where, include: { category: true, images: true }, orderBy, skip, take: limit }),
    ]);
    return {
      data: properties.map(mapPropertyListItem),
      meta: { page, limit, totalItems, totalPages: Math.ceil(totalItems / limit) },
    };
  }

  const properties = await prisma.property.findMany({ where, include: { category: true, images: true }, orderBy });
  return properties.map(mapPropertyListItem);
}

export const getPropertyTenant = getTenantProperties;

function computeRatingSummary(reviews: { rating: number }[]) {
  const total = reviews.length;
  if (total === 0) return { averageRating: 0, totalReviews: 0 };
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return { averageRating: Math.round((sum / total) * 10) / 10, totalReviews: total };
}

export async function getPropertyById(id: string): Promise<PropertyResponseDto> {
  const query = {
    where: { id },
    include: {
      category: true,
      images: { orderBy: [{ order: 'asc' as const }, { createdAt: 'asc' as const }] },
      rooms: {
        orderBy: { basePrice: 'asc' as const },
        include: { images: { orderBy: [{ order: 'asc' as const }, { createdAt: 'asc' as const }] } },
      },
      reviews: { select: { rating: true } },
    },
  };
  const property = await prisma.property.findUnique(query);
  if (!property) throw AppError.notFound('Properti tidak ditemukan.');
  const ratingInfo = computeRatingSummary((property as any).reviews || []);
  return { ...(property as any), ...ratingInfo };
}

export async function updateProperty(propertyId: string, tenantId: string, input: UpdatePropertyInput): Promise<PropertyResponseDto> {
  await verifyPropertyOwnership(propertyId, tenantId);
  if (input.categoryId) await verifyCategoryExists(input.categoryId);
  return prisma.property.update({
    where: { id: propertyId },
    data: input,
    include: { category: true, images: true },
  });
}

async function cleanupPropertyImages(images: { publicId: string }[]): Promise<void> {
  await Promise.all(images.map((img) => deleteFromCloudinary(img.publicId)));
}

async function assertCanDeleteProperty(propertyId: string): Promise<void> {
  const totalBookings = await prisma.booking.count({ where: { propertyId } });
  if (totalBookings === 0) return;
  const activeBookings = await prisma.booking.count({
    where: {
      propertyId,
      status: { in: ['WAITING_PAYMENT', 'WAITING_CONFIRMATION', 'PROCESSED'] },
    },
  });
  if (activeBookings > 0) {
    throw AppError.badRequest('Properti tidak dapat dihapus karena masih memiliki pesanan aktif.');
  }
  throw AppError.badRequest('Properti tidak dapat dihapus karena sudah memiliki riwayat pemesanan.');
}

export async function deleteProperty(propertyId: string, tenantId: string): Promise<void> {
  const property = await verifyPropertyOwnership(propertyId, tenantId);
  await assertCanDeleteProperty(propertyId);
  if (property.images.length > 0) {
    await cleanupPropertyImages(property.images);
  }
  await prisma.property.delete({ where: { id: propertyId } });
}
