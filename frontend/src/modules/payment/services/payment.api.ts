import { apiClient } from '../../../libs/axios';
import { ApiResponse } from '../../../types/api.types';
import {
  PaymentActionResponse,
  SnapTokenResponse,
  RejectPaymentPayload,
  EmergencyCancelPayload,
} from '../payment.types';

export const paymentApi = {
  async uploadPaymentProof(bookingId: string, file: File): Promise<ApiResponse<PaymentActionResponse>> {
    const formData = new FormData();
    formData.append('proof', file);
    const res = await apiClient.post<ApiResponse<PaymentActionResponse>>(
      `/payments/${bookingId}/proof`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return res.data;
  },

  async createSnapCharge(bookingId: string): Promise<ApiResponse<SnapTokenResponse>> {
    const res = await apiClient.post<ApiResponse<SnapTokenResponse>>('/payments/midtrans-charge', {
      bookingId,
    });
    return res.data;
  },

  async approvePaymentProof(bookingId: string): Promise<ApiResponse<PaymentActionResponse>> {
    const res = await apiClient.post<ApiResponse<PaymentActionResponse>>(`/payments/${bookingId}/approve`);
    return res.data;
  },

  async rejectPaymentProof(bookingId: string, payload?: RejectPaymentPayload): Promise<ApiResponse<PaymentActionResponse>> {
    const res = await apiClient.post<ApiResponse<PaymentActionResponse>>(`/payments/${bookingId}/reject`, payload);
    return res.data;
  },

  async emergencyCancel(bookingId: string, payload: EmergencyCancelPayload): Promise<ApiResponse<PaymentActionResponse>> {
    const body = {
      cancellationReason: payload.cancellationReason || payload.reason || '',
      refundContact: payload.refundContact,
      isForceMajeure: Boolean(payload.isForceMajeure),
    };
    const res = await apiClient.post<ApiResponse<PaymentActionResponse>>(`/payments/${bookingId}/emergency-cancel`, body);
    return res.data;
  },

  async syncMidtransStatus(bookingId: string): Promise<ApiResponse<any>> {
    const res = await apiClient.post<ApiResponse<any>>(`/payments/${bookingId}/midtrans-sync`);
    return res.data;
  },

  async changePaymentMethod(bookingId: string, paymentMethod: string): Promise<ApiResponse<PaymentActionResponse>> {
    const res = await apiClient.patch<ApiResponse<PaymentActionResponse>>(`/payments/${bookingId}/method`, {
      paymentMethod,
    });
    return res.data;
  },

  async resetSnapCharge(bookingId: string): Promise<ApiResponse<SnapTokenResponse>> {
    const res = await apiClient.post<ApiResponse<SnapTokenResponse>>(`/payments/${bookingId}/midtrans-reset`);
    return res.data;
  },
};


