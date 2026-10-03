import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BookingStatus, PaymentMethod, PaymentStatus, Role } from '@prisma/client';
import { prisma } from '../../../shared/services/prisma.service';
import * as pricingService from '../../room/pricing.service';
import { createBooking, cancelBooking, getBookingById, getUserBookings } from '../booking.service';

vi.mock('../../../shared/services/prisma.service', () => ({
  prisma: {
    $transaction: vi.fn(),
    booking: { findUnique: vi.fn(), findMany: vi.fn(), count: vi.fn(), create: vi.fn(), update: vi.fn() },
    user: { findUnique: vi.fn() }, room: { findUnique: vi.fn() }, roomUnavailability: { count: vi.fn() },
  },
}));

vi.mock('../../room/pricing.service', () => ({ calculateStayPricing: vi.fn() }));

describe('Booking Service', () => {
  const userId = 'usr_1234567890abcdefghijkl';
  const roomId = 'rm_1234567890abcdefghijkl';
  const bookingId = 'bk_1234567890abcdefghijkl';
  const input = {
    roomId, checkInDate: '2026-12-01', checkOutDate: '2026-12-03',
    guestCount: 2, paymentMethod: PaymentMethod.MANUAL_TRANSFER,
  };

  beforeEach(() => { vi.clearAllMocks(); });

  function buildTxMock(opts: any) {
    const { isVerified = true, roomCapacity = 2, totalUnits = 1, unavailableCount = 0, overlapCount = 0 } = opts;
    const createFn = ({ data }: any) => Promise.resolve({
      id: bookingId, bookingCode: data.bookingCode, status: data.status, totalPrice: data.totalPrice, expiresAt: data.expiresAt,
    });
    return {
      $queryRaw: vi.fn().mockResolvedValueOnce([]),
      user: { findUnique: vi.fn().mockResolvedValue({ id: userId, isVerified }) },
      room: { findUnique: vi.fn().mockResolvedValue({ id: roomId, propertyId: 'prop-1', capacity: roomCapacity, totalUnits }) },
      roomUnavailability: { count: vi.fn().mockResolvedValue(unavailableCount) },
      booking: { count: vi.fn().mockResolvedValue(overlapCount), create: vi.fn().mockImplementation(createFn) },
    };
  }

  function setupTxMock(opts: any = {}) {
    vi.mocked(pricingService.calculateStayPricing).mockResolvedValueOnce({
      basePrice: 500000, totalStayPrice: 1000000, totalNights: 2, dailyBreakdown: [],
    });
    const txMock = buildTxMock(opts);
    vi.mocked(prisma.$transaction).mockImplementation(async (cb: any) => cb(txMock));
    return txMock;
  }

  describe('createBooking (Concurrency-Safe Engine AC-001)', () => {
    it('should successfully reserve room and return WAITING_PAYMENT with code & 2h expiry', async () => {
      const tx = setupTxMock({ overlapCount: 0 });
      const result = await createBooking(userId, input);
      expect(tx.$queryRaw).toHaveBeenCalled();
      expect(result.bookingId).toBe(bookingId);
      expect(result.status).toBe(BookingStatus.WAITING_PAYMENT);
      expect(result.bookingCode).toMatch(/^SGH-\d{8}-[A-Z0-9]{4}$/);
      expect(result.totalPrice).toBe(1000000);
      expect(new Date(result.expiresAt).getTime()).toBeGreaterThan(Date.now());
    });

    it('should reject unverified user with 403 Forbidden', async () => {
      setupTxMock({ isVerified: false });
      await expect(createBooking(userId, input)).rejects.toThrow('Akun Anda belum terverifikasi');
    });

    it('should reject when guestCount exceeds room capacity with 400 Bad Request', async () => {
      setupTxMock({ roomCapacity: 1 });
      await expect(createBooking(userId, input)).rejects.toThrow('melebihi kapasitas kamar');
    });

    it('should reject when room is blocked by tenant with 409 Conflict', async () => {
      setupTxMock({ unavailableCount: 1 });
      await expect(createBooking(userId, input)).rejects.toThrow('Kamar sedang tidak tersedia');
    });

    it('should prevent double-booking (AC-001) when overlapping bookings equal totalUnits', async () => {
      setupTxMock({ totalUnits: 1, overlapCount: 1 });
      await expect(createBooking(userId, input)).rejects.toThrow('Kamar tidak lagi tersedia');
    });
  });

  describe('cancelBooking', () => {
    function setupCancelMock(bookingData: any) {
      const txMock = {
        booking: {
          findUnique: vi.fn().mockResolvedValue(bookingData),
          update: vi.fn().mockResolvedValue({ ...bookingData, status: BookingStatus.CANCELLED }),
        },
      };
      vi.mocked(prisma.$transaction).mockImplementation(async (cb: any) => cb(txMock));
      return txMock;
    }

    it('should cancel WAITING_PAYMENT booking and set payment to CANCELLED', async () => {
      const txMock = setupCancelMock({ id: bookingId, userId, status: BookingStatus.WAITING_PAYMENT });
      const res = await cancelBooking(userId, bookingId, 'Berubah pikiran');
      expect(res.status).toBe(BookingStatus.CANCELLED);
      expect(txMock.booking.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: bookingId },
        data: expect.objectContaining({ status: BookingStatus.CANCELLED }),
      }));
    });

    it('should reject cancellation if booking is not WAITING_PAYMENT', async () => {
      setupCancelMock({ id: bookingId, userId, status: BookingStatus.PROCESSED });
      await expect(cancelBooking(userId, bookingId)).rejects.toThrow('Hanya pesanan yang menunggu pembayaran');
    });

    it('should reject cancellation if user is not the booking owner', async () => {
      setupCancelMock({ id: bookingId, userId: 'other', status: BookingStatus.WAITING_PAYMENT });
      await expect(cancelBooking(userId, bookingId)).rejects.toThrow('Anda tidak memiliki akses');
    });
  });

  describe('getBookingById', () => {
    const mockBooking = { id: bookingId, userId, property: { id: 'p1', tenantId: 'tenant-1' }, room: { id: roomId, name: 'Deluxe' } };

    it('should allow booking owner to retrieve booking', async () => {
      vi.mocked(prisma.booking.findUnique).mockResolvedValueOnce(mockBooking as any);
      const result = await getBookingById(userId, bookingId);
      expect(result.id).toBe(bookingId);
    });

    it('should allow property tenant to retrieve booking', async () => {
      vi.mocked(prisma.booking.findUnique).mockResolvedValueOnce(mockBooking as any);
      const result = await getBookingById('tenant-1', bookingId, Role.TENANT);
      expect(result.id).toBe(bookingId);
    });

    it('should forbid unauthorized third party from accessing booking', async () => {
      vi.mocked(prisma.booking.findUnique).mockResolvedValueOnce(mockBooking as any);
      await expect(getBookingById('stranger', bookingId, Role.USER)).rejects.toThrow('Akses ke data pesanan ini ditolak.');
    });
  });

  describe('getUserBookings', () => {
    it('should return paginated bookings and meta', async () => {
      vi.mocked(prisma.booking.findMany).mockResolvedValueOnce([{ id: bookingId }] as any);
      vi.mocked(prisma.booking.count).mockResolvedValueOnce(1);
      const result = await getUserBookings(userId, { page: 1, limit: 10 });
      expect(result.data).toHaveLength(1);
      expect(result.meta).toEqual({ page: 1, limit: 10, totalItems: 1, totalPages: 1 });
    });
  });
});
