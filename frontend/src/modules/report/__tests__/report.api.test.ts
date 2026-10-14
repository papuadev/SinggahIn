import { describe, it, expect, vi, beforeEach } from 'vitest';
import { reportApi } from '../services/report.api';
import { apiClient } from '../../../libs/axios';

vi.mock('../../../libs/axios', () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

describe('Report API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getSalesReport', () => {
    it('calls GET /reports/sales with provided query parameters', async () => {
      const mockData = {
        success: true,
        data: { totalRevenue: 1000000, totalBookings: 2, breakdown: [] },
      };
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockData });

      const res = await reportApi.getSalesReport({ groupBy: 'PROPERTY', sortOrder: 'desc' });
      expect(apiClient.get).toHaveBeenCalledWith('/reports/sales', {
        params: { groupBy: 'PROPERTY', sortOrder: 'desc' },
      });
      expect(res.data.totalRevenue).toBe(1000000);
    });
  });

  describe('getOccupancyMatrix', () => {
    it('calls GET /reports/occupancy with month and year parameters', async () => {
      const mockData = {
        success: true,
        data: { month: 10, year: 2026, totalDays: 31, occupancyRate: 75.5, matrix: [] },
      };
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockData });

      const res = await reportApi.getOccupancyMatrix({ month: 10, year: 2026 });
      expect(apiClient.get).toHaveBeenCalledWith('/reports/occupancy', {
        params: { month: 10, year: 2026 },
      });
      expect(res.data.occupancyRate).toBe(75.5);
    });
  });
});
