import { BookingStatus, PaymentStatus } from '@prisma/client';

export interface RejectPaymentInput {
  reason?: string;
}

export interface EmergencyCancelInput {
  cancellationReason: string;
  refundContact: string;
}

export interface PaymentActionResponse {
  bookingId: string;
  bookingCode: string;
  bookingStatus: BookingStatus;
  paymentStatus: PaymentStatus;
  expiresAt?: string;
  proofImageUrl?: string | null;
}
