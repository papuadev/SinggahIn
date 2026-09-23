import { BookingStatus, Prisma } from '@prisma/client';
import { prisma } from '../../shared/services/prisma.service';
import { PaginationMeta } from '../../shared/types/api.types';
import { toUtcDate } from '../room/pricing.helper';
import { CatalogQueryInput } from './catalog.schema';
import { CatalogPropertyItemDto } from './catalog.types';
import {
  RawPropertyRecord,
  findBestRoomPricing,
  formatCatalogProperty,
} from './catalog.helper';

function buildCatalogWhere(query: CatalogQueryInput): Prisma.PropertyWhereInput {
  return {
    city: query.city ? { contains: query.city, mode: 'insensitive' } : undefined,
    title: query.name ? { contains: query.name, mode: 'insensitive' } : undefined,
    category: query.category ? { slug: query.category } : undefined,
    rooms: {
      some: query.guests ? { capacity: { gte: query.guests } } : {},
    },
  };
}

function buildEmptyRoomRelations() {
  return {
    modifiers: { where: { id: '__none__' } },
    unavailabilities: { where: { id: '__none__' } },
    bookings: { where: { id: '__none__' } },
  };
}

function buildDateFilterRoomRelations(checkIn: string, checkOut: string) {
  const inDate = toUtcDate(checkIn);
  const outDate = toUtcDate(checkOut);
  const dateRange = { startDate: { lt: outDate }, endDate: { gte: inDate } };
  return {
    modifiers: { where: dateRange },
    unavailabilities: { where: dateRange },
    bookings: {
      where: {
        status: { not: BookingStatus.CANCELLED },
        checkInDate: { lt: outDate },
        checkOutDate: { gt: inDate },
      },
      select: { id: true },
    },
  };
}

function buildRoomRelations(checkIn?: string, checkOut?: string) {
  if (!checkIn || !checkOut) return buildEmptyRoomRelations();
  return buildDateFilterRoomRelations(checkIn, checkOut);
}

function sortCatalogItems(
  items: CatalogPropertyItemDto[],
  sortBy: 'price' | 'name' = 'price',
  sortOrder: 'asc' | 'desc' = 'asc'
): CatalogPropertyItemDto[] {
  return [...items].sort((a, b) => {
    if (sortBy === 'name') {
      return sortOrder === 'asc'
        ? a.title.localeCompare(b.title)
        : b.title.localeCompare(a.title);
    }
    return sortOrder === 'asc'
      ? a.pricing.averageNightRate - b.pricing.averageNightRate
      : b.pricing.averageNightRate - a.pricing.averageNightRate;
  });
}

function paginateCatalogItems(
  items: CatalogPropertyItemDto[],
  page: number,
  limit: number
): { data: CatalogPropertyItemDto[]; meta: PaginationMeta } {
  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / limit);
  const start = (page - 1) * limit;
  return {
    data: items.slice(start, start + limit),
    meta: { page, limit, totalItems, totalPages },
  };
}

function processProperties(
  properties: RawPropertyRecord[],
  query: CatalogQueryInput
): CatalogPropertyItemDto[] {
  const results: CatalogPropertyItemDto[] = [];
  for (const prop of properties) {
    const best = findBestRoomPricing(prop.rooms, query.checkIn, query.checkOut, query.guests);
    if (best) {
      results.push(formatCatalogProperty(prop, best));
    }
  }
  return results;
}

function executePropertyQuery(where: Prisma.PropertyWhereInput, roomInclude: unknown) {
  return prisma.property.findMany({
    where,
    include: {
      category: { select: { name: true, slug: true } },
      images: { select: { imageUrl: true, isCover: true, createdAt: true }, orderBy: { createdAt: 'asc' } },
      reviews: { select: { rating: true } },
      rooms: { include: roomInclude as any },
    },
  });
}

export async function getCatalogProperties(
  query: CatalogQueryInput
): Promise<{ data: CatalogPropertyItemDto[]; meta: PaginationMeta }> {
  const where = buildCatalogWhere(query);
  const roomInclude = buildRoomRelations(query.checkIn, query.checkOut);
  const properties = await executePropertyQuery(where, roomInclude);
  const formatted = processProperties(properties as any, query);
  const sorted = sortCatalogItems(formatted, query.sortBy, query.sortOrder);
  return paginateCatalogItems(sorted, query.page, query.limit);
}
