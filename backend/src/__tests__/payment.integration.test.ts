import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { BookingStatus, PaymentMethod, PaymentStatus, Role } from '@prisma/client';
import { app } from '../index';
import { prisma } from '../shared/services/prisma.service';
import * as cloudinaryService from '../shared/services/cloudinary.service';
import { signToken } from '../shared/services/token.service';

vi.mock('../shared/services/prisma.service', () => ({
  prisma: { $transaction: vi.fn(), booking: { findUnique: vi.fn(), update: vi.fn() } },
}));
vi.mock('../shared/services/cloudinary.service', () => ({
  uploadToCloudinary: vi.fn(), deleteFromCloudinary: vi.fn(),
}));
vi.mock('../shared/services/mail.service', () => ({
  sendBookingVoucherEmail: vi.fn(), sendEmergencyCancellationEmail: vi.fn(),
}));

describe('Payment HTTP Integration Tests', () => {
  const userId = 'clhuser123456789012345678';
  const tenantId = 'clhtenant12345678901234567';
  const bookingId = 'clhbook123456789012345678';
  const userToken = signToken({ userId, email: 'user@test.com', role: Role.USER });
  const tenantToken = signToken({ userId: tenantId, email: 'tenant@test.com', role: Role.TENANT });
  const validJpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]);

  beforeEach(() => { vi.clearAllMocks(); });

  function setupProofMock() {
    const b = { id: bookingId, userId, bookingCode: 'SGH-ABCD', status: BookingStatus.WAITING_PAYMENT, expiresAt: new Date(Date.now() + 3600000), payment: { paymentMethod: PaymentMethod.MANUAL_TRANSFER } };
    vi.mocked(prisma.booking.findUnique).mockResolvedValueOnce(b as any);
    vi.mocked(cloudinaryService.uploadToCloudinary).mockResolvedValueOnce({ secureUrl: 'https://cdn/p.webp', publicId: 'p1' });
    vi.mocked(prisma.$transaction).mockImplementation(async (cb: any) => cb({
      booking: { update: vi.fn().mockResolvedValue({ ...b, status: BookingStatus.WAITING_CONFIRMATION, payment: { status: PaymentStatus.WAITING_APPROVAL } }) },
    }));
  }

  function setupApproveMock() {
    const b = { id: bookingId, bookingCode: 'SGH-ABCD', status: BookingStatus.WAITING_CONFIRMATION, property: { tenantId, title: 'Villa' }, user: { email: 'guest@test.com' }, payment: { paymentMethod: PaymentMethod.MANUAL_TRANSFER }, room: { name: 'Deluxe' }, checkInDate: new Date('2026-10-10'), checkOutDate: new Date('2026-10-12'), totalPrice: 1000000, guestCount: 2 };
    vi.mocked(prisma.booking.findUnique).mockResolvedValueOnce(b as any);
    vi.mocked(prisma.$transaction).mockImplementation(async (cb: any) => cb({
      booking: { update: vi.fn().mockResolvedValue({ ...b, status: BookingStatus.PROCESSED, payment: { status: PaymentStatus.SETTLEMENT } }) },
    }));
  }

  function setupRejectMock() {
    const b = { id: bookingId, bookingCode: 'SGH-ABCD', status: BookingStatus.WAITING_CONFIRMATION, property: { tenantId }, payment: { paymentMethod: PaymentMethod.MANUAL_TRANSFER } };
    vi.mocked(prisma.booking.findUnique).mockResolvedValueOnce(b as any);
    vi.mocked(prisma.$transaction).mockImplementation(async (cb: any) => cb({
      booking: { update: vi.fn().mockImplementation(({ data }) => Promise.resolve({ ...b, status: BookingStatus.REJECTED, payment: { status: PaymentStatus.REJECTED }, cancellationReason: data.cancellationReason })) },
    }));
  }

  function setupEmergencyMock() {
    const b = { id: bookingId, bookingCode: 'SGH-ABCD', status: BookingStatus.PROCESSED, property: { tenantId, title: 'Villa' }, user: { email: 'guest@test.com' } };
    vi.mocked(prisma.booking.findUnique).mockResolvedValueOnce(b as any);
    vi.mocked(prisma.$transaction).mockImplementation(async (cb: any) => cb({
      booking: { update: vi.fn().mockImplementation(({ data }) => Promise.resolve({ ...b, status: BookingStatus.CANCELLED, isForceMajeure: data.isForceMajeure, payment: { status: PaymentStatus.CANCELLED } })) },
    }));
  }

  describe('POST /api/v1/payments/:bookingId/proof', () => {
    it('returns 401 when unauthenticated', async () => {
      const res = await request(app).post(`/api/v1/payments/${bookingId}/proof`);
      expect(res.status).toBe(401);
    });

    it('returns 403 when role is TENANT', async () => {
      const res = await request(app).post(`/api/v1/payments/${bookingId}/proof`).set('Authorization', `Bearer ${tenantToken}`);
      expect(res.status).toBe(403);
    });

    it('returns 400 when no file is uploaded', async () => {
      const res = await request(app).post(`/api/v1/payments/${bookingId}/proof`).set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(400);
    });

    it('returns 200 on successful proof upload', async () => {
      setupProofMock();
      const res = await request(app).post(`/api/v1/payments/${bookingId}/proof`).set('Authorization', `Bearer ${userToken}`).attach('proof', validJpeg, 'proof.jpg');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.bookingStatus).toBe(BookingStatus.WAITING_CONFIRMATION);
    });
  });

  describe('POST /api/v1/payments/:bookingId/approve', () => {
    it('returns 403 when role is USER', async () => {
      const res = await request(app).post(`/api/v1/payments/${bookingId}/approve`).set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(403);
    });

    it('returns 200 when tenant approves payment', async () => {
      setupApproveMock();
      const res = await request(app).post(`/api/v1/payments/${bookingId}/approve`).set('Authorization', `Bearer ${tenantToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.bookingStatus).toBe(BookingStatus.PROCESSED);
    });
  });

  describe('POST /api/v1/payments/:bookingId/reject', () => {
    it('returns 200 and sets status to REJECTED when tenant rejects proof', async () => {
      setupRejectMock();
      const res = await request(app).post(`/api/v1/payments/${bookingId}/reject`).set('Authorization', `Bearer ${tenantToken}`).send({ reason: 'Buram' });
      expect(res.status).toBe(200);
      expect(res.body.data.bookingStatus).toBe(BookingStatus.REJECTED);
      expect(res.body.data.paymentStatus).toBe(PaymentStatus.REJECTED);
    });
  });

  describe('POST /api/v1/payments/:bookingId/emergency-cancel', () => {
    it('returns 400 when required fields are missing', async () => {
      const res = await request(app).post(`/api/v1/payments/${bookingId}/emergency-cancel`).set('Authorization', `Bearer ${tenantToken}`).send({});
      expect(res.status).toBe(400);
    });

    it('returns 200 on valid emergency cancellation with force majeure', async () => {
      setupEmergencyMock();
      const payload = { cancellationReason: 'Bencana gempa bumi', refundContact: '081234567890', isForceMajeure: true };
      const res = await request(app).post(`/api/v1/payments/${bookingId}/emergency-cancel`).set('Authorization', `Bearer ${tenantToken}`).send(payload);
      expect(res.status).toBe(200);
      expect(res.body.data.bookingStatus).toBe(BookingStatus.CANCELLED);
      expect(res.body.data.isForceMajeure).toBe(true);
    });
  });

  describe('PATCH /api/v1/payments/:bookingId/method', () => {
    it('returns 200 and updates paymentMethod when user changes method', async () => {
      const b = {
        id: bookingId, userId, bookingCode: 'SGH-ABCD', status: BookingStatus.WAITING_PAYMENT,
        expiresAt: new Date(Date.now() + 3600000), payment: { paymentMethod: PaymentMethod.MANUAL_TRANSFER },
      };
      vi.mocked(prisma.booking.findUnique).mockResolvedValueOnce(b as any);
      vi.mocked(prisma.$transaction).mockImplementation(async (cb: any) => cb({
        booking: { update: vi.fn().mockResolvedValue({ ...b, payment: { paymentMethod: PaymentMethod.PAYMENT_GATEWAY, status: PaymentStatus.PENDING } }) },
      }));
      const res = await request(app)
        .patch(`/api/v1/payments/${bookingId}/method`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ paymentMethod: 'PAYMENT_GATEWAY' });
      expect(res.status).toBe(200);
      expect(res.body.data.paymentMethod).toBe(PaymentMethod.PAYMENT_GATEWAY);
    });

    it('returns 400 when invalid payment method is provided', async () => {
      const res = await request(app)
        .patch(`/api/v1/payments/${bookingId}/method`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ paymentMethod: 'CRYPTO' });
      expect(res.status).toBe(400);
    });
  });
});

