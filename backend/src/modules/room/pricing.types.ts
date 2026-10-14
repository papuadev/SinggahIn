import { AdjustmentType } from '@prisma/client';

export interface RoomPriceModifierDto {
  id: string;
  roomId: string;
  startDate: Date;
  endDate: Date;
  adjustmentType: AdjustmentType;
  adjustmentValue: number;
  reason: string | null;
  createdAt: Date;
}

export interface DailyPriceDto {
  date: string;
  basePrice: number;
  effectivePrice: number;
  modifierId: string | null;
  adjustmentType: AdjustmentType | null;
  adjustmentValue: number | null;
  reason: string | null;
}

export interface StayPricingCalculationDto {
  roomId: string;
  checkInDate: string;
  checkOutDate: string;
  totalNights: number;
  basePrice: number;
  averageNightRate: number;
  totalStayPrice: number;
  dailyBreakdown: DailyPriceDto[];
}
