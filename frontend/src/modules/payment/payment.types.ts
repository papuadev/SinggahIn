export interface PaymentActionResponse {
  bookingId: string;
  status: string;
  paymentStatus: string;
  expiresAt?: string;
  isForceMajeure?: boolean;
}

export interface SnapTokenResponse {
  snapToken: string;
  redirectUrl: string;
}

export interface RejectPaymentPayload {
  reason?: string;
}

export interface EmergencyCancelPayload {
  cancellationReason?: string;
  reason?: string;
  refundContact: string;
  isForceMajeure?: boolean;
}

export interface MidtransSnapResult {
  status_code: string;
  status_message: string;
  transaction_id: string;
  order_id: string;
  gross_amount: string;
  payment_type: string;
  transaction_time: string;
  transaction_status: string;
  fraud_status?: string;
}
