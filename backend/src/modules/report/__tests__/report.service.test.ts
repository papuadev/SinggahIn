import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prisma } from '../../../shared/services/prisma.service';
import { getSalesReport, getOccupancyMatrix } from '../report.service';

vi.mock('../../../shared/services/prisma.service', () => ({
  prisma: {
    property: { findMany: vi.fn() },
    booking: { findMany: vi.fn() },
  },
}));

describe('Report Service', () => {
  const tenantId = 'tenant-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getSalesReport', () => {
    it('aggregates sales data grouped by property successfully', async () => {
      vi.mocked(prisma.property.findMany).mockResolvedValueOnce([{ id: 'prop-1' } as any]);
      vi.mocked(prisma.booking.findMany).mockResolvedValueOnce([
        {
          id: 'b1', propertyId: 'prop-1', totalPrice: 2000000,
          property: { title: 'Villa Lembang' },
        } as any,
      ]);

      const res = await getSalesReport(tenantId, { groupBy: 'PROPERTY', sortOrder: 'desc' });
      expect(res.totalRevenue).toBe(2000000);
      expect(res.totalBookings).toBe(1);
      expect(res.breakdown).toHaveLength(1);
    });

    it('throws forbidden error when tenant requests property they do not own', async () => {
      vi.mocked(prisma.property.findMany).mockResolvedValueOnce([{ id: 'prop-1' } as any]);
      await expect(
        getSalesReport(tenantId, { propertyId: 'prop-other', groupBy: 'PROPERTY', sortOrder: 'desc' })
      ).rejects.toThrow('tidak memiliki akses');
    });
  });

  describe('getOccupancyMatrix', () => {
    it('generates room calendar matrix for target month and year', async () => {
      vi.mocked(prisma.property.findMany).mockResolvedValueOnce([
        {
          id: 'prop-1', title: 'Villa Lembang',
          rooms: [
            { id: 'room-1', name: 'Deluxe', totalUnits: 1, unavailabilities: [] },
          ],
        } as any,
      ]);
      vi.mocked(prisma.booking.findMany).mockResolvedValueOnce([
        {
          id: 'b1', roomId: 'room-1',
          checkInDate: new Date('2026-10-01'), checkOutDate: new Date('2026-10-03'),
        } as any,
      ]);

      const res = await getOccupancyMatrix(tenantId, { month: 10, year: 2026 });
      expect(res.month).toBe(10);
      expect(res.year).toBe(2026);
      expect(res.totalDays).toBe(31);
      expect(res.matrix).toHaveLength(1);
      expect(res.matrix[0].days).toHaveLength(31);
      expect(res.matrix[0].days[0].status).toBe('BOOKED');
    });
  });
});
