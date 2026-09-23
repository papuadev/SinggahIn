import { AdjustmentType } from '@prisma/client';
import {
  computeAdjustedPrice,
  resolveModifierForDate,
} from '../room/pricing.helper';
import { RoomPriceModifierDto } from '../room/pricing.types';
import { CalendarDayItemDto } from './calendar.types';

export function getDaysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export function formatDateString(year: number, month: number, day: number): string {
  const m = String(month).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
}

export function checkDateUnavailability(
  dateStr: string,
  unavailabilities: { startDate: Date; endDate: Date; reason?: string | null }[]
): { isBlocked: boolean; reason: string | null } {
  const t = new Date(`${dateStr}T00:00:00.000Z`).getTime();
  const found = unavailabilities.find(
    (u) => u.startDate.getTime() <= t && u.endDate.getTime() >= t
  );
  if (found) return { isBlocked: true, reason: found.reason || 'Unavailable' };
  return { isBlocked: false, reason: null };
}

export function countBookingsForDate(
  dateStr: string,
  bookings: { checkInDate: Date; checkOutDate: Date }[]
): number {
  const t = new Date(`${dateStr}T00:00:00.000Z`).getTime();
  return bookings.filter(
    (b) => b.checkInDate.getTime() <= t && b.checkOutDate.getTime() > t
  ).length;
}

export function isDateWeekend(dateStr: string): boolean {
  const day = new Date(`${dateStr}T00:00:00.000Z`).getUTCDay();
  return day === 0 || day === 6;
}

export function calculateDayPrice(
  dateStr: string,
  basePrice: number,
  weekendPercent: number | null | undefined,
  modifiers: RoomPriceModifierDto[]
): { price: number; reason: string | null } {
  const dateObj = new Date(`${dateStr}T00:00:00.000Z`);
  const mod = resolveModifierForDate(modifiers, dateObj, basePrice);
  if (mod) {
    const price = computeAdjustedPrice(basePrice, mod.adjustmentType, mod.adjustmentValue);
    return { price, reason: mod.reason || 'Peak Season Rate' };
  }
  if (isDateWeekend(dateStr) && weekendPercent && weekendPercent > 0) {
    const price = computeAdjustedPrice(basePrice, AdjustmentType.PERCENTAGE, weekendPercent);
    return { price, reason: 'Weekend Rate' };
  }
  return { price: basePrice, reason: null };
}

export function buildCalendarDay(
  dateStr: string,
  room: { basePrice: number; weekendRatePercent?: number | null; totalUnits: number },
  modifiers: RoomPriceModifierDto[],
  unavailabilities: { startDate: Date; endDate: Date; reason?: string | null }[],
  bookings: { checkInDate: Date; checkOutDate: Date }[]
): CalendarDayItemDto {
  const block = checkDateUnavailability(dateStr, unavailabilities);
  if (block.isBlocked) {
    return { date: dateStr, price: 0, isAvailable: false, reason: block.reason };
  }
  const bookedCount = countBookingsForDate(dateStr, bookings);
  if (bookedCount >= room.totalUnits) {
    return { date: dateStr, price: 0, isAvailable: false, reason: 'Sold Out' };
  }
  const pricing = calculateDayPrice(dateStr, room.basePrice, room.weekendRatePercent, modifiers);
  return { date: dateStr, price: pricing.price, isAvailable: true, reason: pricing.reason };
}
