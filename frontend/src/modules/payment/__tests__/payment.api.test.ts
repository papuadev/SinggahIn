import { describe, it, expect, vi, beforeEach } from 'vitest';
import { paymentApi } from '../services/payment.api';
import { apiClient } from '../../../libs/axios';

vi.mock('../../../libs/axios', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('paymentApi', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('uploadPaymentProof posts FormData to /payments/:bookingId/proof', async () => {
    const file = new File(['proof'], 'proof.png', { type: 'image/png' });
    vi.mocked(apiClient.post).mockResolvedValueOnce({ data: { success: true, data: { bookingId: 'b1' } } });
    const res = await paymentApi.uploadPaymentProof('b1', file);
    expect(apiClient.post).toHaveBeenCalledWith(
      '/payments/b1/proof',
      expect.any(FormData),
      expect.objectContaining({ headers: { 'Content-Type': 'multipart/form-data' } })
    );
    expect(res.data.bookingId).toBe('b1');
  });

  it('createSnapCharge posts bookingId to /payments/midtrans-charge', async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({ data: { success: true, data: { snapToken: 'tok123' } } });
    const res = await paymentApi.createSnapCharge('b1');
    expect(apiClient.post).toHaveBeenCalledWith('/payments/midtrans-charge', { bookingId: 'b1' });
    expect(res.data.snapToken).toBe('tok123');
  });

  it('approvePaymentProof posts to /payments/:bookingId/approve', async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({ data: { success: true, data: { bookingId: 'b1' } } });
    await paymentApi.approvePaymentProof('b1');
    expect(apiClient.post).toHaveBeenCalledWith('/payments/b1/approve');
  });

  it('rejectPaymentProof posts reason to /payments/:bookingId/reject', async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({ data: { success: true, data: { bookingId: 'b1' } } });
    await paymentApi.rejectPaymentProof('b1', { reason: 'Bukti palsu' });
    expect(apiClient.post).toHaveBeenCalledWith('/payments/b1/reject', { reason: 'Bukti palsu' });
  });

  it('emergencyCancel posts payload to /payments/:bookingId/emergency-cancel', async () => {
    const payload = { reason: 'Bencana banjir', refundContact: '0812345678', isForceMajeure: true };
    vi.mocked(apiClient.post).mockResolvedValueOnce({ data: { success: true, data: { bookingId: 'b1' } } });
    await paymentApi.emergencyCancel('b1', payload);
    expect(apiClient.post).toHaveBeenCalledWith('/payments/b1/emergency-cancel', {
      cancellationReason: 'Bencana banjir',
      refundContact: '0812345678',
      isForceMajeure: true,
    });
  });
});
