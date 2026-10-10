import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { Role } from '@prisma/client';
import { app } from '../index';
import { prisma } from '../shared/services/prisma.service';
import { signToken } from '../shared/services/token.service';

vi.mock('../shared/services/prisma.service', () => ({
  prisma: {
    property: { findMany: vi.fn() },
    booking: { findMany: vi.fn() },
  },
}));

describe('Report HTTP Integration Tests', () => {
  const tenantId = 'clhtenant12345678901234567';
  const userId = 'clhuser123456789012345678';
  const tenantToken = signToken({ userId: tenantId, email: 'tenant@test.com', role: Role.TENANT });
  const userToken = signToken({ userId, email: 'user@test.com', role: Role.USER });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/v1/reports/sales', () => {
    it('returns 401 when no token is provided', async () => {
      const res = await request(app).get('/api/v1/reports/sales');
      expect(res.status).toBe(401);
    });

    it('returns 403 when user is not a tenant', async () => {
      const res = await request(app)
        .get('/api/v1/reports/sales')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(403);
    });

    it('returns 200 with aggregated sales report for tenant', async () => {
      vi.mocked(prisma.property.findMany).mockResolvedValueOnce([{ id: 'prop-1' } as any]);
      vi.mocked(prisma.booking.findMany).mockResolvedValueOnce([
        {
          id: 'b1', propertyId: 'prop-1', totalPrice: 2500000,
          property: { title: 'Villa Hijau' },
        } as any,
      ]);

      const res = await request(app)
        .get('/api/v1/reports/sales?groupBy=PROPERTY')
        .set('Authorization', `Bearer ${tenantToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalRevenue).toBe(2500000);
      expect(res.body.data.breakdown).toHaveLength(1);
    });
  });

  describe('GET /api/v1/reports/occupancy', () => {
    it('returns 401 when unauthenticated', async () => {
      const res = await request(app).get('/api/v1/reports/occupancy');
      expect(res.status).toBe(401);
    });

    it('returns 200 with occupancy matrix for tenant', async () => {
      vi.mocked(prisma.property.findMany).mockResolvedValueOnce([
        {
          id: 'prop-1', title: 'Villa Hijau',
          rooms: [{ id: 'room-1', name: 'Deluxe', totalUnits: 2, unavailabilities: [] }],
        } as any,
      ]);
      vi.mocked(prisma.booking.findMany).mockResolvedValueOnce([]);

      const res = await request(app)
        .get('/api/v1/reports/occupancy?month=10&year=2026')
        .set('Authorization', `Bearer ${tenantToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.month).toBe(10);
      expect(res.body.data.matrix).toHaveLength(1);
    });
  });
});
