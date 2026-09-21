export interface Room {
  id: string;
  propertyId: string;
  name: string;
  basePrice: number;
  weekendRatePercent?: number | null;
  capacity: number;
  totalUnits: number;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateRoomPayload {
  name: string;
  basePrice: number;
  weekendRatePercent?: number;
  capacity: number;
  totalUnits: number;
  description?: string;
}

export interface UpdateRoomPayload {
  name?: string;
  basePrice?: number;
  weekendRatePercent?: number;
  capacity?: number;
  totalUnits?: number;
  description?: string;
}
