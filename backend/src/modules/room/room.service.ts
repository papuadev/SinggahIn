import { BookingStatus, Prisma } from '@prisma/client';
import { prisma } from '../../shared/services/prisma.service';
import { AppError } from '../../shared/utils/app-error';
import { PaginationMeta } from '../../shared/types/api.types';
import { verifyPropertyOwnership } from '../property/property.service';
import { CreateRoomInput, UpdateRoomInput, GetRoomsQueryInput } from './room.schema';
import { RoomResponseDto } from './room.types';

export async function verifyRoomOwnership(roomId: string, tenantId: string) {
  const room = await prisma.room.findUnique({
    where: { id: roomId },
    include: { property: true },
  });
  if (!room) {
    throw AppError.notFound('Tipe kamar tidak ditemukan.');
  }
  if (room.property.tenantId !== tenantId) {
    throw AppError.forbidden('Anda tidak memiliki akses ke tipe kamar ini.');
  }
  return room;
}

export async function createRoom(
  tenantId: string,
  propertyId: string,
  input: CreateRoomInput
): Promise<RoomResponseDto> {
  await verifyPropertyOwnership(propertyId, tenantId);
  return prisma.room.create({
    data: {
      propertyId,
      ...input,
    },
  });
}

export async function getRoomsByProperty(
  propertyId: string,
  query?: GetRoomsQueryInput
): Promise<{ data: RoomResponseDto[]; meta?: PaginationMeta }> {
  const where: Prisma.RoomWhereInput = { propertyId };

  if (query?.search?.trim()) {
    const s = query.search.trim();
    where.OR = [
      { name: { contains: s, mode: 'insensitive' } },
      { description: { contains: s, mode: 'insensitive' } },
    ];
  }

  let orderBy: Prisma.RoomOrderByWithRelationInput = { basePrice: 'asc' };
  switch (query?.sortBy) {
    case 'price_desc':
      orderBy = { basePrice: 'desc' };
      break;
    case 'name_asc':
      orderBy = { name: 'asc' };
      break;
    case 'name_desc':
      orderBy = { name: 'desc' };
      break;
    case 'units_desc':
      orderBy = { totalUnits: 'desc' };
      break;
    case 'price_asc':
    default:
      orderBy = { basePrice: 'asc' };
      break;
  }

  if (query?.page || query?.limit) {
    const page = query.page || 1;
    const limit = query.limit || 5;
    const skip = (page - 1) * limit;

    const [totalItems, data] = await Promise.all([
      prisma.room.count({ where }),
      prisma.room.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: { images: { orderBy: [{ order: 'asc' }, { createdAt: 'asc' }] } },
      }),
    ]);

    const totalPages = Math.ceil(totalItems / limit);
    return {
      data,
      meta: {
        page,
        limit,
        totalItems,
        totalPages,
      },
    };
  }

  const data = await prisma.room.findMany({
    where,
    orderBy,
    include: { images: { orderBy: [{ order: 'asc' }, { createdAt: 'asc' }] } },
  });
  return { data };
}

export async function getRoomById(roomId: string): Promise<RoomResponseDto> {
  const room = await prisma.room.findUnique({
    where: { id: roomId },
  });
  if (!room) {
    throw AppError.notFound('Tipe kamar tidak ditemukan.');
  }
  return room;
}

export async function updateRoom(
  tenantId: string,
  roomId: string,
  input: UpdateRoomInput
): Promise<RoomResponseDto> {
  await verifyRoomOwnership(roomId, tenantId);
  return prisma.room.update({
    where: { id: roomId },
    data: input,
  });
}

const ACTIVE_BOOKING_STATUSES = [
  BookingStatus.WAITING_PAYMENT,
  BookingStatus.WAITING_CONFIRMATION,
  BookingStatus.PROCESSED,
];

async function checkActiveBookings(roomId: string): Promise<void> {
  const activeCount = await prisma.booking.count({
    where: { roomId, status: { in: ACTIVE_BOOKING_STATUSES } },
  });
  if (activeCount > 0) {
    throw AppError.badRequest('Tidak dapat menghapus kamar dengan pesanan aktif.');
  }
}

export async function deleteRoom(
  tenantId: string,
  roomId: string
): Promise<void> {
  await verifyRoomOwnership(roomId, tenantId);
  await checkActiveBookings(roomId);
  await prisma.room.delete({
    where: { id: roomId },
  });
}
