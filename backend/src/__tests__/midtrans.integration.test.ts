import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import crypto from 'crypto';
import { BookingStatus, PaymentMethod, Role } from '@prisma/client';
import { app } from '../index';
import { prisma } from '../shared/services/prisma.service';
import { snapClient } from '../modules/payment/midtrans.service';
import { signToken } from '../shared/services/token.service';

vi.mock('../shared/services/prisma.service', () => ({
  prisma: {
    $transaction: vi.fn(),
    booking: { findUnique: vi.fn(), update: vi.fn() },
    payment: { update: vi.fn() },
  },
}));

vi.mock('../shared/services/mail.service', () => ({
  sendBookingVoucherEmail: vi.fn(),
}));

describe('Midtrans HTTP Integration Tests', () => {
  const userId = 'clhuser123456789012345678';
  const tenantId = 'clhtenant12345678901234567';
  const bookingId = 'clhbook123456789012345678';
  const userToken = signToken({ userId, email: 'user@test.com', role: Role.USER });
  const tenantToken = signToken({ userId: tenantId, email: 'tenant@test.com', role: Role.TENANT });
  const serverKey = process.env.MIDTRANS_SERVER_KEY || 'SB-Mid-server-default';

  beforeEach(() => { vi.clearAllMocks(); });

  function getSignature(orderId: string, status: string, amount: string) {
    return crypto.createHash('sha512').update(`${orderId}${status}${amount}${serverKey}`).digest('hex');
  }

  function setupSnapMock() {
    const b = {
      id: bookingId, userId, bookingCode: 'SGH-ABCD', totalPrice: 1000000,
      status: BookingStatus.WAITING_PAYMENT, expiresAt: new Date(Date.now() + 3600000),
      payment: { paymentMethod: PaymentMethod.PAYMENT_GATEWAY },
      user: { name: 'Ali', email: 'ali@test.com', phoneNumber: '08123' },
    };
    vi.mocked(prisma.booking.findUnique).mockResolvedValueOnce(b as any);
    vi.spyOn(snapClient, 'createTransaction').mockResolvedValueOnce({
      token: 'snap-token-xyz', redirect_url: 'https://midtrans/pay',
    });
    vi.mocked(prisma.payment.update).mockResolvedValueOnce({} as any);
  }

  function setupWebhookMock(status: BookingStatus) {
    const b = {
      id: bookingId, bookingCode: 'SGH-ABCD', totalPrice: 1000000, guestCount: 2, status,
      property: { title: 'Villa Indah' }, room: { name: 'Deluxe Suite' },
      user: { email: 'ali@test.com' }, checkInDate: new Date('2026-10-10'), checkOutDate: new Date('2026-10-12'),
    };
    vi.mocked(prisma.booking.findUnique).mockResolvedValueOnce(b as any);
    vi.mocked(prisma.$transaction).mockImplementation(async (cb: any) => cb({
      booking: { update: vi.fn().mockResolvedValue(b) },
      payment: { update: vi.fn().mockResolvedValue({}) },
    }));
  }

  describe('POST /api/v1/payments/midtrans-charge', () => {
    it('returns 401 when unauthenticated', async () => {
      const res = await request(app).post('/api/v1/payments/midtrans-charge').send({ bookingId });
      expect(res.status).toBe(401);
    });

    it('returns 403 when user is TENANT', async () => {
      const res = await request(app).post('/api/v1/payments/midtrans-charge')
        .set('Authorization', `Bearer ${tenantToken}`).send({ bookingId });
      expect(res.status).toBe(403);
    });

    it('returns 400 when bookingId is invalid cuid', async () => {
      const res = await request(app).post('/api/v1/payments/midtrans-charge')
        .set('Authorization', `Bearer ${userToken}`).send({ bookingId: 'invalid-cuid' });
      expect(res.status).toBe(400);
    });

    it('returns 200 with snapToken on success', async () => {
      setupSnapMock();
      const res = await request(app).post('/api/v1/payments/midtrans-charge')
        .set('Authorization', `Bearer ${userToken}`).send({ bookingId });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.snapToken).toBe('snap-token-xyz');
    });
  });

  describe('POST /api/v1/payments/midtrans-webhook', () => {
    it('returns 400 when required fields missing', async () => {
      const res = await request(app).post('/api/v1/payments/midtrans-webhook').send({});
      expect(res.status).toBe(400);
    });

    it('returns 401 when signature_key is invalid', async () => {
      const res = await request(app).post('/api/v1/payments/midtrans-webhook').send({
        order_id: 'SGH-ABCD', status_code: '200', gross_amount: '1000000.00',
        signature_key: 'invalid-sig', transaction_status: 'settlement',
      });
      expect(res.status).toBe(401);
    });

    it('returns 200 and processes settlement notification', async () => {
      setupWebhookMock(BookingStatus.WAITING_PAYMENT);
      const signature_key = getSignature('SGH-ABCD', '200', '1000000.00');
      const res = await request(app).post('/api/v1/payments/midtrans-webhook').send({
        order_id: 'SGH-ABCD', status_code: '200', gross_amount: '1000000.00',
        signature_key, transaction_status: 'settlement', transaction_id: 'tx-123',
      });
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('settlement');
    });

    it('returns 200 and processes expire notification', async () => {
      setupWebhookMock(BookingStatus.WAITING_PAYMENT);
      const signature_key = getSignature('SGH-ABCD', '202', '1000000.00');
      const res = await request(app).post('/api/v1/payments/midtrans-webhook').send({
        order_id: 'SGH-ABCD', status_code: '202', gross_amount: '1000000.00',
        signature_key, transaction_status: 'expire', transaction_id: 'tx-456',
      });
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('expire');
    });
  });
});
