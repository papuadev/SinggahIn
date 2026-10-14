import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BookingStatus } from '@prisma/client';
import { prisma } from '../../../shared/services/prisma.service';
import { createReview, getPropertyReviews, getBookingReview } from '../review.service';

vi.mock('../../../shared/services/prisma.service', () => ({
  prisma: {
    booking: { findUnique: vi.fn() },
    review: { create: vi.fn(), findMany: vi.fn(), count: vi.fn(), aggregate: vi.fn(), findUnique: vi.fn() },
    property: { findUnique: vi.fn() },
  },
}));

describe('Review Service', () => {
  const userId = 'usr-123';
  const bookingId = 'cjld2cjxh0000qzrmn831i7rn';
  const propertyId = 'prop-456';

  beforeEach(() => { vi.clearAllMocks(); });

  describe('createReview', () => {
    it('creates review successfully for completed booking', async () => {
      vi.mocked(prisma.booking.findUnique).mockResolvedValueOnce({
        id: bookingId, userId, propertyId, status: BookingStatus.COMPLETED, review: null,
      } as any);
      vi.mocked(prisma.review.create).mockResolvedValueOnce({
        id: 'rev-1', bookingId, userId, propertyId, rating: 5, comment: 'Luar biasa bersih!',
        createdAt: new Date('2026-10-10T10:00:00Z'), user: { id: userId, name: 'Ali', avatarUrl: null },
      } as any);

      const res = await createReview(userId, { bookingId, rating: 5, comment: 'Luar biasa bersih!' });
      expect(res.id).toBe('rev-1');
      expect(res.rating).toBe(5);
      expect(prisma.review.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ bookingId, userId, propertyId, rating: 5 }),
      }));
    });

    it('throws error when booking status is not COMPLETED', async () => {
      vi.mocked(prisma.booking.findUnique).mockResolvedValueOnce({
        id: bookingId, userId, propertyId, status: BookingStatus.PROCESSED, review: null,
      } as any);
      await expect(
        createReview(userId, { bookingId, rating: 5, comment: 'Bagus sekali tempatnya' })
      ).rejects.toThrow('setelah masa menginap selesai');
    });

    it('throws error when user does not own the booking', async () => {
      vi.mocked(prisma.booking.findUnique).mockResolvedValueOnce({
        id: bookingId, userId: 'other-user', propertyId, status: BookingStatus.COMPLETED, review: null,
      } as any);
      await expect(
        createReview(userId, { bookingId, rating: 5, comment: 'Bagus sekali tempatnya' })
      ).rejects.toThrow('tidak memiliki akses');
    });

    it('throws error when review already exists for the booking', async () => {
      vi.mocked(prisma.booking.findUnique).mockResolvedValueOnce({
        id: bookingId, userId, propertyId, status: BookingStatus.COMPLETED, review: { id: 'rev-existing' },
      } as any);
      await expect(
        createReview(userId, { bookingId, rating: 5, comment: 'Bagus sekali tempatnya' })
      ).rejects.toThrow('sudah memberikan ulasan');
    });
  });

  describe('getPropertyReviews', () => {
    it('returns paginated reviews with aggregate rating', async () => {
      vi.mocked(prisma.property.findUnique).mockResolvedValueOnce({ id: propertyId } as any);
      vi.mocked(prisma.review.count).mockResolvedValueOnce(2);
      vi.mocked(prisma.review.aggregate).mockResolvedValueOnce({ _avg: { rating: 4.5 } } as any);
      vi.mocked(prisma.review.findMany).mockResolvedValueOnce([
        { id: 'rev-1', rating: 5, comment: 'Keren', createdAt: new Date(), user: { id: 'u1', name: 'User 1' } },
        { id: 'rev-2', rating: 4, comment: 'Nyaman', createdAt: new Date(), user: { id: 'u2', name: 'User 2' } },
      ] as any);

      const res = await getPropertyReviews(propertyId, 1, 10);
      expect(res.totalReviews).toBe(2);
      expect(res.averageRating).toBe(4.5);
      expect(res.reviews).toHaveLength(2);
    });

    it('throws not found error when property does not exist', async () => {
      vi.mocked(prisma.property.findUnique).mockResolvedValueOnce(null);
      await expect(getPropertyReviews('non-existent')).rejects.toThrow('tidak ditemukan');
    });
  });

  describe('getBookingReview', () => {
    it('returns booking review when present and owned by user', async () => {
      vi.mocked(prisma.review.findUnique).mockResolvedValueOnce({
        id: 'rev-1', bookingId, userId, propertyId, rating: 5, comment: 'Bagus', createdAt: new Date(),
      } as any);
      const res = await getBookingReview(userId, bookingId);
      expect(res?.id).toBe('rev-1');
    });

    it('returns null when no review exists for booking', async () => {
      vi.mocked(prisma.review.findUnique).mockResolvedValueOnce(null);
      const res = await getBookingReview(userId, bookingId);
      expect(res).toBeNull();
    });
  });
});
