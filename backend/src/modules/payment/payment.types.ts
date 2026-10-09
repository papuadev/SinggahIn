import { BookingStatus, PaymentMethod, PaymentStatus } from '@prisma/client';

export interface RejectPaymentInput {
  reason?: string;
}

export interface EmergencyCancelInput {
  cancellationReason: string;
  refundContact: string;
  isForceMajeure?: boolean;
}

export interface PaymentActionResponse {
  bookingId: string;
  bookingCode: string;
  bookingStatus: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  expiresAt?: string;
  proofImageUrl?: string | null;
  cancellationReason?: string | null;
  refundContact?: string | null;
  isForceMajeure?: boolean;
}

