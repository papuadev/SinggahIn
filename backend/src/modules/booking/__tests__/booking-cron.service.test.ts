import { describe, it, expect, vi, beforeEach } from 'vitest';
import cron from 'node-cron';
import { BookingStatus, PaymentStatus } from '@prisma/client';
import { prisma } from '../../../shared/services/prisma.service';
import { cancelExpiredBookings, initAutoCancelCron } from '../booking-cron.service';

vi.mock('../../../shared/services/prisma.service', () => ({
  prisma: {
    $transaction: vi.fn(),
    booking: { findMany: vi.fn(), update: vi.fn() },
  },
}));

vi.mock('node-cron', () => ({
  default: { schedule: vi.fn() },
}));

describe('Booking Cron Service', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  describe('cancelExpiredBookings', () => {
    it('cancels bookings that have passed expiresAt and marks payment EXPIRED', async () => {
      vi.mocked(prisma.booking.findMany).mockResolvedValueOnce([{ id: 'bk-expired' }] as any);
      const txMock = { booking: { update: vi.fn().mockResolvedValue({}) } };
      vi.mocked(prisma.$transaction).mockImplementation(async (cb: any) => cb(txMock));
      const res = await cancelExpiredBookings(new Date());
      expect(res.cancelledCount).toBe(1);
      expect(txMock.booking.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: 'bk-expired' },
        data: expect.objectContaining({ status: BookingStatus.CANCELLED, payment: { update: { status: PaymentStatus.EXPIRED } } }),
      }));
    });

    it('returns cancelledCount 0 when no bookings are expired', async () => {
      vi.mocked(prisma.booking.findMany).mockResolvedValueOnce([]);
      const res = await cancelExpiredBookings(new Date());
      expect(res.cancelledCount).toBe(0);
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });
  });

  describe('initAutoCancelCron', () => {
    it('registers recurring 1-minute cron job', () => {
      vi.mocked(cron.schedule).mockReturnValue({ start: vi.fn() } as any);
      initAutoCancelCron();
      expect(cron.schedule).toHaveBeenCalledWith('*/1 * * * *', expect.any(Function));
    });
  });
});
