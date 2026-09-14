import { prisma } from '../../shared/services/prisma.service';
import { AppError } from '../../shared/utils/app-error';
import { verifyRoomOwnership, getRoomById } from './room.service';
import { verifyPropertyOwnership } from '../property/property.service';
import { CreatePeakRateInput } from './room.schema';
import {
  RoomPriceModifierDto,
  StayPricingCalculationDto,
} from './pricing.types';
import {
  toUtcDate,
  resolveModifierForDate,
  buildDailyPrice,
  generateDateRange,
  aggregateStayPricing,
} from './pricing.helper';

export async function createRoomRate(
  tenantId: string, roomId: string, input: CreatePeakRateInput
): Promise<RoomPriceModifierDto> {
  await verifyRoomOwnership(roomId, tenantId);
  return prisma.roomPriceModifier.create({
    data: {
      roomId,
      startDate: toUtcDate(input.startDate),
      endDate: toUtcDate(input.endDate),
      adjustmentType: input.adjustmentType,
      adjustmentValue: input.adjustmentValue,
      reason: input.reason,
    },
  });
}

export async function getRoomRates(
  tenantId: string, roomId: string
): Promise<RoomPriceModifierDto[]> {
  await verifyRoomOwnership(roomId, tenantId);
  return prisma.roomPriceModifier.findMany({
    where: { roomId },
    orderBy: { startDate: 'asc' },
  });
}

export async function deleteRoomRate(
  tenantId: string, roomId: string, rateId: string
): Promise<void> {
  await verifyRoomOwnership(roomId, tenantId);
  const record = await prisma.roomPriceModifier.findUnique({ where: { id: rateId } });
  if (!record || record.roomId !== roomId) {
    throw AppError.notFound('Data penyesuaian tarif tidak ditemukan.');
  }
  await prisma.roomPriceModifier.delete({ where: { id: rateId } });
}

function buildModifierRecords(roomIds: string[], input: CreatePeakRateInput) {
  return roomIds.map((roomId) => ({
    roomId,
    startDate: toUtcDate(input.startDate),
    endDate: toUtcDate(input.endDate),
    adjustmentType: input.adjustmentType,
    adjustmentValue: input.adjustmentValue,
    reason: input.reason,
  }));
}

export async function bulkCreatePropertyRates(
  tenantId: string, propertyId: string, input: CreatePeakRateInput
): Promise<{ count: number }> {
  await verifyPropertyOwnership(propertyId, tenantId);
  const rooms = await prisma.room.findMany({
    where: { propertyId }, select: { id: true },
  });
  if (rooms.length === 0) return { count: 0 };
  const data = buildModifierRecords(rooms.map((r) => r.id), input);
  const result = await prisma.roomPriceModifier.createMany({ data });
  return { count: result.count };
}

async function fetchActiveModifiers(
  roomId: string, checkIn: Date, checkOut: Date
): Promise<RoomPriceModifierDto[]> {
  return prisma.roomPriceModifier.findMany({
    where: {
      roomId,
      startDate: { lt: checkOut },
      endDate: { gte: checkIn },
    },
    orderBy: { startDate: 'asc' },
  });
}

function computeDailyBreakdown(
  dates: Date[], modifiers: RoomPriceModifierDto[], basePrice: number
) {
  return dates.map((d) => {
    const mod = resolveModifierForDate(modifiers, d, basePrice);
    return buildDailyPrice(d, basePrice, mod);
  });
}

export async function calculateStayPricing(
  roomId: string, checkInStr: string, checkOutStr: string
): Promise<StayPricingCalculationDto> {
  const room = await getRoomById(roomId);
  const checkIn = toUtcDate(checkInStr);
  const checkOut = toUtcDate(checkOutStr);
  const modifiers = await fetchActiveModifiers(roomId, checkIn, checkOut);
  const dates = generateDateRange(checkIn, checkOut);
  const breakdown = computeDailyBreakdown(dates, modifiers, room.basePrice);
  return aggregateStayPricing(roomId, checkInStr, checkOutStr, room.basePrice, breakdown);
}
