import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { BookingStatus, PaymentMethod, PaymentStatus, Role } from '@prisma/client';
import { app } from '../index';
import { prisma } from '../shared/services/prisma.service';
import * as cloudinaryService from '../shared/services/cloudinary.service';
import { signToken } from '../shared/services/token.service';
import { autoCompleteFinishedBookings } from '../modules/booking/booking-cron.service';

vi.mock('../shared/services/prisma.service', () => ({
  prisma: {
    $transaction: vi.fn(), $queryRaw: vi.fn(),
    user: { findUnique: vi.fn() },
    room: { findUnique: vi.fn() },
    roomUnavailability: { count: vi.fn() },
    roomPriceModifier: { findMany: vi.fn() },
    property: { findUnique: vi.fn() },
    booking: { findUnique: vi.fn(), findMany: vi.fn(), count: vi.fn(), create: vi.fn(), update: vi.fn(), updateMany: vi.fn() },
    review: { create: vi.fn(), findMany: vi.fn(), count: vi.fn(), aggregate: vi.fn(), findUnique: vi.fn() },
  },
}));

vi.mock('../shared/services/cloudinary.service', () => ({
  uploadToCloudinary: vi.fn(), deleteFromCloudinary: vi.fn(),
}));

vi.mock('../shared/services/mail.service', () => ({
  sendBookingVoucherEmail: vi.fn(), sendEmergencyCancellationEmail: vi.fn(),
}));

interface TestContext {
  userId: string; tenantId: string; propertyId: string; roomId: string; bookingId: string;
}

function createMockState(ctx: TestContext) {
  let bState: any = null;
  let rState: any = null;
  const getBooking = () => bState ? {
    ...bState, property: { id: ctx.propertyId, tenantId: ctx.tenantId, title: 'Villa Bali' },
    room: { id: ctx.roomId, name: 'Deluxe' }, user: { id: ctx.userId, email: 'guest@test.com', name: 'Guest' },
    review: rState,
  } : null;
  return {
    getBooking,
    setBooking: (b: any) => { bState = b; },
    getReview: () => rState,
    setReview: (r: any) => { rState = r; },
  };
}

function buildTxMockClient(ctx: TestContext, s: ReturnType<typeof createMockState>) {
  return {
    $queryRaw: vi.fn().mockResolvedValue([]),
    user: { findUnique: vi.fn().mockResolvedValue({ id: ctx.userId, isVerified: true }) },
    room: { findUnique: vi.fn().mockResolvedValue({ id: ctx.roomId, propertyId: ctx.propertyId, capacity: 2, totalUnits: 1 }) },
    roomUnavailability: { count: vi.fn().mockResolvedValue(0) },
    booking: {
      count: vi.fn().mockResolvedValue(0),
      create: vi.fn().mockImplementation(async ({ data }: any) => {
        const c = { id: ctx.bookingId, ...data, payment: { ...data.payment?.create } };
        s.setBooking(c); return c;
      }),
      update: vi.fn().mockImplementation(async ({ data }: any) => {
        const curr = s.getBooking();
        const u = { ...curr, ...data, payment: { ...curr?.payment, ...data.payment?.update } };
        s.setBooking(u); return u;
      }),
    },
  };
}

function configurePrismaFinders(ctx: TestContext, s: ReturnType<typeof createMockState>) {
  vi.mocked(prisma.room.findUnique).mockResolvedValue({ id: ctx.roomId, basePrice: 500000, weekendRatePercent: 0 } as any);
  vi.mocked(prisma.roomPriceModifier.findMany).mockResolvedValue([]);
  vi.mocked(prisma.property.findUnique).mockResolvedValue({ id: ctx.propertyId, title: 'Villa Bali' } as any);
  vi.mocked(prisma.booking.findUnique).mockImplementation(async () => s.getBooking());
  vi.mocked(prisma.booking.findMany).mockImplementation(async (args: any) => {
    const b = s.getBooking();
    return b && b.status === args?.where?.status ? [{ id: b.id }] as any : [];
  });
  vi.mocked(prisma.booking.updateMany).mockImplementation(async ({ data }: any) => {
    const curr = s.getBooking();
    if (curr && data.status) s.setBooking({ ...curr, status: data.status });
    return { count: 1 };
  });
}

function configurePrismaReviews(ctx: TestContext, s: ReturnType<typeof createMockState>) {
  vi.mocked(prisma.review.create).mockImplementation(async ({ data }: any) => {
    const rev = { id: 'rev-1', ...data, createdAt: new Date(), user: { id: ctx.userId, name: 'Guest', avatarUrl: null } };
    s.setReview(rev); return rev;
  });
  vi.mocked(prisma.review.findMany).mockImplementation(async () => s.getReview() ? [s.getReview()] : []);
  vi.mocked(prisma.review.count).mockImplementation(async () => s.getReview() ? 1 : 0);
  vi.mocked(prisma.review.aggregate).mockImplementation(async () => ({ _avg: { rating: s.getReview()?.rating || 0 } } as any));
}

function configurePrismaMock(ctx: TestContext, s: ReturnType<typeof createMockState>) {
  vi.mocked(prisma.$transaction).mockImplementation(async (cb: any) => cb(buildTxMockClient(ctx, s)));
  configurePrismaFinders(ctx, s);
  configurePrismaReviews(ctx, s);
}

describe('End-to-end integration test (Reserve → Pay → Verify → Checkout → Review)', () => {
  const ctx: TestContext = {
    userId: 'clhuser123456789012345678', tenantId: 'clhtenant12345678901234567',
    propertyId: 'clhprop123456789012345678', roomId: 'clhroom123456789012345678', bookingId: 'clhbook123456789012345678',
  };
  const userToken = signToken({ userId: ctx.userId, email: 'guest@test.com', role: Role.USER });
  const tenantToken = signToken({ userId: ctx.tenantId, email: 'tenant@test.com', role: Role.TENANT });
  const validJpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]);

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(cloudinaryService.uploadToCloudinary).mockResolvedValue({ secureUrl: 'https://cdn/p.webp', publicId: 'p1' });
  });

  async function stepReserve() {
    const res = await request(app).post('/api/v1/bookings').set('Authorization', `Bearer ${userToken}`).send({
      roomId: ctx.roomId, checkInDate: '2026-12-01', checkOutDate: '2026-12-03', guestCount: 2, paymentMethod: PaymentMethod.MANUAL_TRANSFER,
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe(BookingStatus.WAITING_PAYMENT);
    expect(res.body.data.bookingId).toBe(ctx.bookingId);
  }

  async function stepPay() {
    const res = await request(app).post(`/api/v1/payments/${ctx.bookingId}/proof`).set('Authorization', `Bearer ${userToken}`).attach('proof', validJpeg, 'proof.jpg');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.bookingStatus).toBe(BookingStatus.WAITING_CONFIRMATION);
  }

  async function stepVerify() {
    const res = await request(app).post(`/api/v1/payments/${ctx.bookingId}/approve`).set('Authorization', `Bearer ${tenantToken}`).send({});
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.bookingStatus).toBe(BookingStatus.PROCESSED);
  }

  async function stepPrematureReviewCheck() {
    const res = await request(app).post('/api/v1/reviews').set('Authorization', `Bearer ${userToken}`).send({ bookingId: ctx.bookingId, rating: 5, comment: 'Bagus' });
    expect(res.status).toBe(400);
    expect(res.body.message).toContain('setelah masa menginap selesai');
  }

  async function stepCheckout() {
    const cronRes = await autoCompleteFinishedBookings(new Date('2026-12-04T12:00:00Z'));
    expect(cronRes.completedCount).toBe(1);
    const res = await request(app).get(`/api/v1/bookings/${ctx.bookingId}`).set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe(BookingStatus.COMPLETED);
  }

  async function stepReview() {
    const res = await request(app).post('/api/v1/reviews').set('Authorization', `Bearer ${userToken}`).send({
      bookingId: ctx.bookingId, rating: 5, comment: 'Pengalaman menginap yang sangat luar biasa dan bersih!',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.rating).toBe(5);

    const propRes = await request(app).get(`/api/v1/reviews/property/${ctx.propertyId}`);
    expect(propRes.status).toBe(200);
    expect(propRes.body.data.totalReviews).toBe(1);
    expect(propRes.body.data.averageRating).toBe(5);
  }

  it('completes the full booking lifecycle: Reserve -> Pay -> Verify -> Checkout -> Review', async () => {
    const state = createMockState(ctx);
    configurePrismaMock(ctx, state);

    await stepReserve();
    await stepPay();
    await stepVerify();
    await stepPrematureReviewCheck();
    await stepCheckout();
    await stepReview();
  });
});
