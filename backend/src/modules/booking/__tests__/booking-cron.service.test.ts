import { describe, it, expect, vi, beforeEach } from 'vitest';
import cron from 'node-cron';
import { BookingStatus, PaymentStatus } from '@prisma/client';
import { prisma } from '../../../shared/services/prisma.service';
import {
  cancelExpiredBookings,
  autoCompleteFinishedBookings,
  initAutoCancelCron,
  initAutoCompleteCron,
} from '../booking-cron.service';

vi.mock('../../../shared/services/prisma.service', () => ({
  prisma: {
    $transaction: vi.fn(),
    booking: { findMany: vi.fn(), update: vi.fn(), updateMany: vi.fn() },
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

  describe('autoCompleteFinishedBookings', () => {
    it('updates processed bookings to COMPLETED when checkOutDate is passed', async () => {
      vi.mocked(prisma.booking.findMany).mockResolvedValueOnce([{ id: 'b1' }, { id: 'b2' }] as any);
      vi.mocked(prisma.booking.updateMany).mockResolvedValueOnce({ count: 2 });
      const res = await autoCompleteFinishedBookings(new Date());
      expect(res.completedCount).toBe(2);
      expect(prisma.booking.updateMany).toHaveBeenCalledWith({
        where: { id: { in: ['b1', 'b2'] } },
        data: { status: BookingStatus.COMPLETED },
      });
    });

    it('returns completedCount 0 when no bookings are ready for completion', async () => {
      vi.mocked(prisma.booking.findMany).mockResolvedValueOnce([]);
      const res = await autoCompleteFinishedBookings(new Date());
      expect(res.completedCount).toBe(0);
      expect(prisma.booking.updateMany).not.toHaveBeenCalled();
    });
  });

  describe('cron schedules', () => {
    it('registers auto cancel recurring cron', () => {
      vi.mocked(cron.schedule).mockReturnValue({ start: vi.fn() } as any);
      initAutoCancelCron();
      expect(cron.schedule).toHaveBeenCalledWith('*/1 * * * *', expect.any(Function));
    });

    it('registers auto complete daily cron at 12:00 WIB', () => {
      vi.mocked(cron.schedule).mockReturnValue({ start: vi.fn() } as any);
      initAutoCompleteCron();
      expect(cron.schedule).toHaveBeenCalledWith(
        '0 12 * * *',
        expect.any(Function),
        { timezone: 'Asia/Jakarta' }
      );
    });
  });
});
