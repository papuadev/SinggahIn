export interface Room {
  id: string;
  propertyId: string;
  name: string;
  basePrice: number;
  weekendRatePercent?: number | null;
  holidayRatePercent?: number | null;
  capacity: number;
  totalUnits: number;
  description?: string | null;
  images?: any[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateRoomPayload {
  name: string;
  basePrice: number;
  weekendRatePercent?: number;
  holidayRatePercent?: number;
  capacity: number;
  totalUnits: number;
  description?: string;
}

export interface UpdateRoomPayload {
  name?: string;
  basePrice?: number;
  weekendRatePercent?: number;
  holidayRatePercent?: number;
  capacity?: number;
  totalUnits?: number;
  description?: string;
}
