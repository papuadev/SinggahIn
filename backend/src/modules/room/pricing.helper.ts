import { AdjustmentType } from '@prisma/client';
import {
  RoomPriceModifierDto,
  DailyPriceDto,
  StayPricingCalculationDto,
} from './pricing.types';

export function toUtcDate(dateInput: string | Date): Date {
  if (typeof dateInput === 'string') {
    return new Date(`${dateInput.slice(0, 10)}T00:00:00.000Z`);
  }
  return new Date(`${dateInput.toISOString().slice(0, 10)}T00:00:00.000Z`);
}

export function getDaysDifference(start: Date, end: Date): number {
  const diffMs = Math.abs(end.getTime() - start.getTime());
  return Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1;
}

export function computeAdjustedPrice(
  basePrice: number,
  type: AdjustmentType,
  value: number
): number {
  if (type === AdjustmentType.PERCENTAGE) {
    const raw = basePrice * (1 + value / 100);
    return Math.max(0, Math.round(raw));
  }
  return Math.max(0, basePrice + value);
}

export function isDateWithinRange(date: Date, start: Date, end: Date): boolean {
  const d = toUtcDate(date).getTime();
  const s = toUtcDate(start).getTime();
  const e = toUtcDate(end).getTime();
  return d >= s && d <= e;
}

export function compareModifiers(
  a: RoomPriceModifierDto,
  b: RoomPriceModifierDto,
  basePrice: number
): number {
  const durA = getDaysDifference(toUtcDate(a.startDate), toUtcDate(a.endDate));
  const durB = getDaysDifference(toUtcDate(b.startDate), toUtcDate(b.endDate));
  if (durA !== durB) return durA - durB;
  const priceA = computeAdjustedPrice(basePrice, a.adjustmentType, a.adjustmentValue);
  const priceB = computeAdjustedPrice(basePrice, b.adjustmentType, b.adjustmentValue);
  if (priceA !== priceB) return priceB - priceA;
  return b.createdAt.getTime() - a.createdAt.getTime();
}

export function resolveModifierForDate(
  modifiers: RoomPriceModifierDto[],
  date: Date,
  basePrice: number
): RoomPriceModifierDto | null {
  const matching = modifiers.filter((m) =>
    isDateWithinRange(date, m.startDate, m.endDate)
  );
  if (matching.length === 0) return null;
  matching.sort((a, b) => compareModifiers(a, b, basePrice));
  return matching[0];
}

function isWeekendDay(date: Date): boolean {
  const day = toUtcDate(date).getUTCDay();
  return day === 0 || day === 6;
}

function resolveEffectivePrice(
  basePrice: number,
  mod: RoomPriceModifierDto | null,
  isWeekend: boolean,
  weekendRatePercent?: number | null
): { price: number; type: AdjustmentType | null; value: number | null; reason: string | null } {
  if (mod) {
    return {
      price: computeAdjustedPrice(basePrice, mod.adjustmentType, mod.adjustmentValue),
      type: mod.adjustmentType,
      value: mod.adjustmentValue,
      reason: mod.reason,
    };
  }
  if (isWeekend && weekendRatePercent && weekendRatePercent > 0) {
    return {
      price: computeAdjustedPrice(basePrice, AdjustmentType.PERCENTAGE, weekendRatePercent),
      type: AdjustmentType.PERCENTAGE,
      value: weekendRatePercent,
      reason: `Tarif Akhir Pekan (+${weekendRatePercent}%)`,
    };
  }
  return { price: basePrice, type: null, value: null, reason: null };
}

export function buildDailyPrice(
  date: Date,
  basePrice: number,
  mod: RoomPriceModifierDto | null,
  weekendRatePercent?: number | null
): DailyPriceDto {
  const isWeekend = isWeekendDay(date);
  const resolved = resolveEffectivePrice(basePrice, mod, isWeekend, weekendRatePercent);
  return {
    date: toUtcDate(date).toISOString().slice(0, 10),
    basePrice,
    effectivePrice: resolved.price,
    modifierId: mod?.id ?? null,
    adjustmentType: resolved.type,
    adjustmentValue: resolved.value,
    reason: resolved.reason,
  };
}

export function generateDateRange(checkIn: Date, checkOut: Date): Date[] {
  const dates: Date[] = [];
  const curr = toUtcDate(checkIn);
  const stop = toUtcDate(checkOut);
  while (curr.getTime() < stop.getTime()) {
    dates.push(new Date(curr.getTime()));
    curr.setUTCDate(curr.getUTCDate() + 1);
  }
  return dates;
}

function computeAverageRate(total: number, nights: number, basePrice: number) {
  return nights > 0 ? Math.round(total / nights) : basePrice;
}

export function aggregateStayPricing(
  roomId: string, checkInStr: string, checkOutStr: string,
  basePrice: number, dailyBreakdown: DailyPriceDto[]
): StayPricingCalculationDto {
  const totalNights = dailyBreakdown.length;
  const totalStayPrice = dailyBreakdown.reduce((s, d) => s + d.effectivePrice, 0);
  const averageNightRate = computeAverageRate(totalStayPrice, totalNights, basePrice);
  return {
    roomId, checkInDate: checkInStr, checkOutDate: checkOutStr,
    totalNights, basePrice, averageNightRate, totalStayPrice, dailyBreakdown,
  };
}
