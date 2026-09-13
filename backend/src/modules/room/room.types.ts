export interface RoomResponseDto {
  id: string;
  propertyId: string;
  name: string;
  basePrice: number;
  capacity: number;
  totalUnits: number;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface RoomListItemDto {
  id: string;
  propertyId: string;
  name: string;
  basePrice: number;
  capacity: number;
  totalUnits: number;
  availableUnits?: number;
  isAvailable?: boolean;
  createdAt: Date;
}

export interface RoomUnavailabilityDto {
  id: string;
  roomId: string;
  startDate: Date;
  endDate: Date;
  reason: string | null;
  createdAt: Date;
}

export interface RoomAvailabilityCalculationDto {
  roomId: string;
  totalUnits: number;
  bookedUnits: number;
  isBlockedByUnavailability: boolean;
  availableUnits: number;
  isAvailable: boolean;
}
