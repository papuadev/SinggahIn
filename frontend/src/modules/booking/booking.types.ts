export type BookingStatus =
  | 'WAITING_PAYMENT'
  | 'WAITING_CONFIRMATION'
  | 'PROCESSED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REJECTED';

export type PaymentMethod = 'MANUAL_TRANSFER' | 'PAYMENT_GATEWAY';

export type PaymentStatus =
  | 'PENDING'
  | 'WAITING_CONFIRMATION'
  | 'SETTLEMENT'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'REJECTED';

export interface BookingPayment {
  id: string;
  bookingId: string;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  paymentProofUrl?: string | null;
  proofImageUrl?: string | null;
  gatewayOrderId?: string | null;
  gatewayTransactionId?: string | null;
  paidAt?: string | null;
  confirmedAt?: string | null;
  createdAt: string;
}

export interface BookingProperty {
  id: string;
  title: string;
  city: string;
  address: string;
  tenantId?: string;
}

export interface BookingRoom {
  id: string;
  name: string;
  basePrice: number;
}

export interface BookingUser {
  id: string;
  name: string | null;
  email: string;
  phoneNumber?: string | null;
}

export interface Booking {
  id: string;
  bookingCode: string;
  userId: string;
  roomId: string;
  propertyId: string;
  checkInDate: string;
  checkOutDate: string;
  guestCount: number;
  totalPrice: number;
  status: BookingStatus;
  cancellationReason?: string | null;
  isForceMajeure: boolean;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  property: BookingProperty;
  room: BookingRoom;
  payment?: BookingPayment | null;
  user?: BookingUser;
}

export interface CreateBookingPayload {
  roomId: string;
  checkInDate: string;
  checkOutDate: string;
  guestCount: number;
  paymentMethod: PaymentMethod;
}

export interface BookingListQuery {
  status?: BookingStatus;
  page?: number;
  limit?: number;
}

export interface BookingPaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}
