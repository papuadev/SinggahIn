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
