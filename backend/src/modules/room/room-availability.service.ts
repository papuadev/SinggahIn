import { BookingStatus } from '@prisma/client';
import { prisma } from '../../shared/services/prisma.service';
import { AppError } from '../../shared/utils/app-error';
import { verifyRoomOwnership, getRoomById } from './room.service';
import { CreateRoomUnavailabilityInput } from './room.schema';
import {
  RoomUnavailabilityDto,
  RoomAvailabilityCalculationDto,
} from './room.types';

export async function createUnavailability(
  tenantId: string,
  roomId: string,
  input: CreateRoomUnavailabilityInput
): Promise<RoomUnavailabilityDto> {
  await verifyRoomOwnership(roomId, tenantId);
  return prisma.roomUnavailability.create({
    data: {
      roomId,
      startDate: new Date(input.startDate),
      endDate: new Date(input.endDate),
      reason: input.reason,
    },
  });
}

export async function getUnavailabilitiesByRoom(
  roomId: string
): Promise<RoomUnavailabilityDto[]> {
  return prisma.roomUnavailability.findMany({
    where: { roomId },
    orderBy: { startDate: 'asc' },
  });
}

export async function deleteUnavailability(
  tenantId: string,
  roomId: string,
  unavailabilityId: string
): Promise<void> {
  await verifyRoomOwnership(roomId, tenantId);
  const record = await prisma.roomUnavailability.findUnique({
    where: { id: unavailabilityId },
  });
  if (!record || record.roomId !== roomId) {
    throw AppError.notFound('Data pemblokiran kamar tidak ditemukan.');
  }
  await prisma.roomUnavailability.delete({
    where: { id: unavailabilityId },
  });
}

async function countOverlappingUnavailabilities(
  roomId: string,
  checkInDate: Date,
  checkOutDate: Date
): Promise<number> {
  return prisma.roomUnavailability.count({
    where: {
      roomId,
      startDate: { lt: checkOutDate },
      endDate: { gte: checkInDate },
    },
  });
}

async function countOverlappingBookings(
  roomId: string,
  checkInDate: Date,
  checkOutDate: Date
): Promise<number> {
  return prisma.booking.count({
    where: {
      roomId,
      status: { not: BookingStatus.CANCELLED },
      checkInDate: { lt: checkOutDate },
      checkOutDate: { gt: checkInDate },
    },
  });
}

export async function calculateRoomAvailability(
  roomId: string,
  checkInDate: Date,
  checkOutDate: Date
): Promise<RoomAvailabilityCalculationDto> {
  const room = await getRoomById(roomId);
  const unavailCount = await countOverlappingUnavailabilities(
    roomId,
    checkInDate,
    checkOutDate
  );
  const bookedUnits = await countOverlappingBookings(
    roomId,
    checkInDate,
    checkOutDate
  );
  const isBlocked = unavailCount > 0;
  const availableUnits = isBlocked
    ? 0
    : Math.max(0, room.totalUnits - bookedUnits);

  return {
    roomId,
    totalUnits: room.totalUnits,
    bookedUnits,
    isBlockedByUnavailability: isBlocked,
    availableUnits,
    isAvailable: availableUnits > 0,
  };
}
