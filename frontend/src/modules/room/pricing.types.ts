export type AdjustmentType = 'NOMINAL' | 'PERCENTAGE';

export interface RoomPriceModifier {
  id: string;
  roomId: string;
  startDate: string;
  endDate: string;
  adjustmentType: AdjustmentType;
  adjustmentValue: number;
  reason?: string | null;
  createdAt?: string;
}

export interface CreatePeakRatePayload {
  startDate: string;
  endDate: string;
  adjustmentType: AdjustmentType;
  adjustmentValue: number;
  reason?: string;
}

export interface RoomUnavailability {
  id: string;
  roomId: string;
  startDate: string;
  endDate: string;
  reason?: string | null;
  createdAt?: string;
}

export interface CreateRoomUnavailabilityPayload {
  startDate: string;
  endDate: string;
  reason?: string;
}

export interface DailyPrice {
  date: string;
  basePrice: number;
  effectivePrice: number;
  modifierId?: string | null;
  adjustmentType?: AdjustmentType | null;
  adjustmentValue?: number | null;
  reason?: string | null;
}

export interface StayPricingCalculation {
  roomId: string;
  checkInDate: string;
  checkOutDate: string;
  totalNights: number;
  basePrice: number;
  averageNightRate: number;
  totalStayPrice: number;
  dailyBreakdown: DailyPrice[];
}
