import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { BookingStatus, PaymentMethod, Role } from '@prisma/client';
import { app } from '../index';
import { prisma } from '../shared/services/prisma.service';
import { signToken } from '../shared/services/token.service';

vi.mock('../shared/services/prisma.service', () => ({
  prisma: {
    $transaction: vi.fn(), user: { findUnique: vi.fn() }, room: { findUnique: vi.fn() },
    roomUnavailability: { count: vi.fn(), findMany: vi.fn() }, roomPriceModifier: { findMany: vi.fn() },
    booking: { findUnique: vi.fn(), findMany: vi.fn(), count: vi.fn(), create: vi.fn(), update: vi.fn() },
  },
}));

describe('Booking HTTP Integration Tests', () => {
  const userId = 'clhuser123456789012345678';
  const tenantId = 'clhtenant12345678901234567';
  const roomId = 'clhroom123456789012345678';
  const bookingId = 'clhbook123456789012345678';
  const userToken = signToken({ userId, email: 'user@test.com', role: Role.USER });
  const tenantToken = signToken({ userId: tenantId, email: 'tenant@test.com', role: Role.TENANT });

  beforeEach(() => { vi.clearAllMocks(); });

  function setupSuccessBookingMock() {
    vi.mocked(prisma.room.findUnique).mockResolvedValueOnce({ id: roomId, basePrice: 500000, weekendRatePercent: 0 } as any);
    vi.mocked(prisma.roomPriceModifier.findMany).mockResolvedValueOnce([]);
    const b = { id: bookingId, bookingCode: 'SGH-20261201-ABCD', status: BookingStatus.WAITING_PAYMENT, totalPrice: 1000000, expiresAt: new Date('2026-12-01T12:00:00Z') };
    const txMock = {
      $queryRaw: vi.fn().mockResolvedValueOnce([]),
      user: { findUnique: vi.fn().mockResolvedValue({ id: userId, isVerified: true }) },
      room: { findUnique: vi.fn().mockResolvedValue({ id: roomId, propertyId: 'prop-1', capacity: 2, totalUnits: 1 }) },
      roomUnavailability: { count: vi.fn().mockResolvedValue(0) },
      booking: { count: vi.fn().mockResolvedValue(0), create: vi.fn().mockResolvedValue(b) },
    };
    vi.mocked(prisma.$transaction).mockImplementation(async (cb: any) => cb(txMock));
  }

  function setupCancelMock() {
    const bookingData = { id: bookingId, userId, status: BookingStatus.WAITING_PAYMENT };
    const txMock = {
      booking: {
        findUnique: vi.fn().mockResolvedValue(bookingData),
        update: vi.fn().mockResolvedValue({ ...bookingData, status: BookingStatus.CANCELLED }),
      },
    };
    vi.mocked(prisma.$transaction).mockImplementation(async (cb: any) => cb(txMock));
  }

  describe('POST /api/v1/bookings', () => {
    const validPayload = {
      roomId, checkInDate: '2026-12-01', checkOutDate: '2026-12-03',
      guestCount: 2, paymentMethod: PaymentMethod.MANUAL_TRANSFER,
    };

    it('returns 401 when unauthenticated', async () => {
      const res = await request(app).post('/api/v1/bookings').send(validPayload);
      expect(res.status).toBe(401);
    });

    it('returns 403 when user is TENANT', async () => {
      const res = await request(app).post('/api/v1/bookings').set('Authorization', `Bearer ${tenantToken}`).send(validPayload);
      expect(res.status).toBe(403);
    });

    it('returns 400 when date is invalid', async () => {
      const res = await request(app).post('/api/v1/bookings').set('Authorization', `Bearer ${userToken}`)
        .send({ ...validPayload, checkInDate: 'invalid-date' });
      expect(res.status).toBe(400);
    });

    it('returns 201 on successful booking reservation', async () => {
      setupSuccessBookingMock();
      const res = await request(app).post('/api/v1/bookings').set('Authorization', `Bearer ${userToken}`).send(validPayload);
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.bookingId).toBe(bookingId);
      expect(res.body.data.status).toBe(BookingStatus.WAITING_PAYMENT);
    });
  });

  describe('POST /api/v1/bookings/:id/cancel', () => {
    it('returns 401 when unauthenticated', async () => {
      const res = await request(app).post(`/api/v1/bookings/${bookingId}/cancel`).send({});
      expect(res.status).toBe(401);
    });

    it('returns 400 when booking id is not a CUID', async () => {
      const res = await request(app).post('/api/v1/bookings/invalid-id/cancel').set('Authorization', `Bearer ${userToken}`).send({});
      expect(res.status).toBe(400);
    });

    it('returns 200 when cancellation succeeds', async () => {
      setupCancelMock();
      const res = await request(app).post(`/api/v1/bookings/${bookingId}/cancel`).set('Authorization', `Bearer ${userToken}`).send({ reason: 'Batal' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe(BookingStatus.CANCELLED);
    });
  });

  describe('GET /api/v1/bookings/:id', () => {
    it('returns 401 when unauthenticated', async () => {
      const res = await request(app).get(`/api/v1/bookings/${bookingId}`);
      expect(res.status).toBe(401);
    });

    it('returns 200 with booking detail', async () => {
      vi.mocked(prisma.booking.findUnique).mockResolvedValueOnce({
        id: bookingId, userId, property: { id: 'p1', tenantId }, room: { id: roomId, name: 'Deluxe' },
      } as any);
      const res = await request(app).get(`/api/v1/bookings/${bookingId}`).set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(bookingId);
    });
  });

  describe('GET /api/v1/bookings', () => {
    it('returns 401 when unauthenticated', async () => {
      const res = await request(app).get('/api/v1/bookings');
      expect(res.status).toBe(401);
    });

    it('returns 200 with paginated bookings', async () => {
      vi.mocked(prisma.booking.findMany).mockResolvedValueOnce([{ id: bookingId }] as any);
      vi.mocked(prisma.booking.count).mockResolvedValueOnce(1);
      const res = await request(app).get('/api/v1/bookings?page=1&limit=10').set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.meta.page).toBe(1);
    });
  });

  describe('GET /api/v1/bookings/tenant', () => {
    it('returns 403 when user is not a TENANT', async () => {
      const res = await request(app).get('/api/v1/bookings/tenant').set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(403);
    });

    it('returns 200 with tenant property bookings', async () => {
      vi.mocked(prisma.booking.findMany).mockResolvedValueOnce([{ id: bookingId }] as any);
      vi.mocked(prisma.booking.count).mockResolvedValueOnce(1);
      const res = await request(app).get('/api/v1/bookings/tenant?page=1&limit=10').set('Authorization', `Bearer ${tenantToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
    });
  });
});

