export type SalesGroupBy = 'PROPERTY' | 'TRANSACTION' | 'USER';
export type SortOrder = 'asc' | 'desc';

export interface PropertySalesBreakdown {
  id: string;
  name: string;
  totalTransactions: number;
  revenue: number;
}

export interface TransactionSalesBreakdown {
  id: string;
  bookingCode: string;
  propertyName: string;
  roomName: string;
  userName: string;
  userEmail: string;
  checkInDate: string;
  checkOutDate: string;
  totalPrice: number;
  paymentMethod: string;
  status: string;
  createdAt: string;
}

export interface UserSalesBreakdown {
  id: string;
  name: string;
  email: string;
  totalBookings: number;
  totalSpent: number;
}

export type SalesBreakdownItem = PropertySalesBreakdown | TransactionSalesBreakdown | UserSalesBreakdown;

export interface SalesReportResponseDto {
  totalRevenue: number;
  totalBookings: number;
  breakdown: SalesBreakdownItem[];
}

export type DayOccupancyStatus = 'AVAILABLE' | 'BOOKED' | 'BLOCKED';

export interface DayOccupancyDto {
  date: string;
  day: number;
  status: DayOccupancyStatus;
  bookedUnits: number;
  blockedUnits: number;
  availableUnits: number;
  reason?: string | null;
}

export interface RoomOccupancyDto {
  propertyId: string;
  propertyName: string;
  roomId: string;
  roomName: string;
  totalUnits: number;
  days: DayOccupancyDto[];
}

export interface OccupancyMatrixResponseDto {
  month: number;
  year: number;
  totalDays: number;
  occupancyRate: number;
  matrix: RoomOccupancyDto[];
}
