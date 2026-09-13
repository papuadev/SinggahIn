import { BookingStatus } from '@prisma/client';
import { prisma } from '../../shared/services/prisma.service';
import { AppError } from '../../shared/utils/app-error';
import { verifyPropertyOwnership } from '../property/property.service';
import { CreateRoomInput, UpdateRoomInput } from './room.schema';
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
  propertyId: string
): Promise<RoomResponseDto[]> {
  return prisma.room.findMany({
    where: { propertyId },
    orderBy: { basePrice: 'asc' },
  });
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

async function checkActiveBookings(roomId: string): Promise<void> {
  const activeCount = await prisma.booking.count({
    where: {
      roomId,
      status: {
        in: [
          BookingStatus.WAITING_PAYMENT,
          BookingStatus.WAITING_CONFIRMATION,
          BookingStatus.PROCESSED,
        ],
      },
    },
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
