import { describe, it, expect, vi, beforeEach } from 'vitest';
import crypto from 'crypto';
import { BookingStatus, PaymentMethod, PaymentStatus } from '@prisma/client';
import { prisma } from '../../../shared/services/prisma.service';
import * as mailService from '../../../shared/services/mail.service';
import {
  snapClient,
  createSnapTransaction,
  verifyMidtransSignature,
  handleMidtransWebhook,
} from '../midtrans.service';

vi.mock('../../../shared/services/prisma.service', () => ({
  prisma: {
    $transaction: vi.fn(),
    booking: { findUnique: vi.fn(), update: vi.fn() },
    payment: { update: vi.fn() },
  },
}));

vi.mock('../../../shared/services/mail.service', () => ({
  sendBookingVoucherEmail: vi.fn(),
}));

describe('Midtrans Service', () => {
  const userId = 'usr-123';
  const bookingId = 'bk-123';
  const bookingCode = 'SGH-20261010-ABCD';

  beforeEach(() => { vi.clearAllMocks(); });

  describe('createSnapTransaction', () => {
    it('creates Snap token and updates gatewayOrderId', async () => {
      const b = {
        id: bookingId, userId, bookingCode, totalPrice: 1000000, status: BookingStatus.WAITING_PAYMENT,
        expiresAt: new Date(Date.now() + 3600000), payment: { paymentMethod: PaymentMethod.PAYMENT_GATEWAY },
        user: { name: 'Ali', email: 'ali@test.com', phoneNumber: '08123456789' },
      };
      vi.mocked(prisma.booking.findUnique).mockResolvedValueOnce(b as any);
      vi.spyOn(snapClient, 'createTransaction').mockResolvedValueOnce({ token: 'snap-tok-123', redirect_url: 'https://midtrans/pay' });

      const res = await createSnapTransaction(userId, bookingId);
      expect(res.snapToken).toBe('snap-tok-123');
      expect(prisma.payment.update).toHaveBeenCalledWith({ where: { bookingId }, data: { gatewayOrderId: bookingCode } });
    });

    it('rejects if payment method is not PAYMENT_GATEWAY', async () => {
      const b = {
        id: bookingId, userId, bookingCode, status: BookingStatus.WAITING_PAYMENT,
        expiresAt: new Date(Date.now() + 3600000), payment: { paymentMethod: PaymentMethod.MANUAL_TRANSFER },
        user: { email: 'ali@test.com' },
      };
      vi.mocked(prisma.booking.findUnique).mockResolvedValueOnce(b as any);
      await expect(createSnapTransaction(userId, bookingId)).rejects.toThrow('bukan payment gateway');
    });
  });

  describe('verifyMidtransSignature', () => {
    const serverKey = process.env.MIDTRANS_SERVER_KEY || 'SB-Mid-server-default';

    it('validates authentic signature key', () => {
      const payload = { order_id: 'SGH-01', status_code: '200', gross_amount: '500000.00', transaction_status: 'settlement' };
      const raw = `SGH-01200500000.00${serverKey}`;
      const signature_key = crypto.createHash('sha512').update(raw).digest('hex');
      expect(verifyMidtransSignature({ ...payload, signature_key })).toBe(true);
    });

    it('rejects invalid signature key of different length', () => {
      const p = { order_id: 'SGH-01', status_code: '200', gross_amount: '500000.00', signature_key: 'fake', transaction_status: 'settlement' };
      expect(verifyMidtransSignature(p)).toBe(false);
    });

    it('rejects signature key with same length but mismatched content', () => {
      const payload = { order_id: 'SGH-01', status_code: '200', gross_amount: '500000.00', transaction_status: 'settlement' };
      const raw = `SGH-01200500000.00${serverKey}`;
      const validSig = crypto.createHash('sha512').update(raw).digest('hex');
      const tampered = validSig.slice(0, -1) + (validSig.endsWith('a') ? 'b' : 'a');
      expect(verifyMidtransSignature({ ...payload, signature_key: tampered })).toBe(false);
    });

    it('rejects when signature key is undefined or empty', () => {
      const p1 = { order_id: 'SGH-01', status_code: '200', gross_amount: '500000.00', signature_key: '', transaction_status: 'settlement' };
      const p2 = { order_id: 'SGH-01', status_code: '200', gross_amount: '500000.00', signature_key: undefined as any, transaction_status: 'settlement' };
      expect(verifyMidtransSignature(p1)).toBe(false);
      expect(verifyMidtransSignature(p2)).toBe(false);
    });
  });

  describe('handleMidtransWebhook', () => {
    const serverKey = process.env.MIDTRANS_SERVER_KEY || 'SB-Mid-server-default';
    function makePayload(status: string) {
      const raw = `${bookingCode}2001000000.00${serverKey}`;
      const sig = crypto.createHash('sha512').update(raw).digest('hex');
      return { order_id: bookingCode, status_code: '200', gross_amount: '1000000.00', signature_key: sig, transaction_status: status };
    }

    it('marks booking PROCESSED and sends voucher on settlement', async () => {
      const b = {
        id: bookingId, bookingCode, status: BookingStatus.WAITING_PAYMENT, totalPrice: 1000000, guestCount: 2,
        checkInDate: new Date('2026-10-10'), checkOutDate: new Date('2026-10-12'),
        property: { title: 'Villa' }, room: { name: 'Deluxe' }, user: { email: 'guest@test.com' },
      };
      vi.mocked(prisma.booking.findUnique).mockResolvedValueOnce(b as any);
      vi.mocked(prisma.$transaction).mockImplementation(async (cb: any) => cb({
        booking: { update: vi.fn().mockResolvedValue(b) },
        payment: { update: vi.fn().mockResolvedValue({}) },
      }));
      const res = await handleMidtransWebhook(makePayload('settlement'));
      expect(res.status).toBe('settlement');
      expect(mailService.sendBookingVoucherEmail).toHaveBeenCalled();
    });

    it('marks booking CANCELLED and payment EXPIRED on expire notification', async () => {
      const b = { id: bookingId, bookingCode, status: BookingStatus.WAITING_PAYMENT };
      vi.mocked(prisma.booking.findUnique).mockResolvedValueOnce(b as any);
      vi.mocked(prisma.$transaction).mockImplementation(async (cb: any) => cb({
        booking: { update: vi.fn().mockResolvedValue({}) },
        payment: { update: vi.fn().mockResolvedValue({}) },
      }));

      const res = await handleMidtransWebhook(makePayload('expire'));
      expect(res.status).toBe('expire');
    });
  });
});
