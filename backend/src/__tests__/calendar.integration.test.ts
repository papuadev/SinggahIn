import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../index';
import { prisma } from '../shared/services/prisma.service';

vi.mock('../shared/services/prisma.service', () => ({
  prisma: {
    property: {
      findUnique: vi.fn(),
    },
    roomPriceModifier: {
      findMany: vi.fn(),
    },
    roomUnavailability: {
      findMany: vi.fn(),
    },
    booking: {
      findMany: vi.fn(),
    },
  },
}));

describe('Calendar HTTP Integration Tests (GET /api/v1/properties/:id/calendar)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const validPropId = 'clhprop123456789012345678';
  const validRoomId = 'clhroom123456789012345678';

  const mockProperty = {
    id: validPropId,
    title: 'Villa Asri',
    rooms: [
      {
        id: validRoomId,
        basePrice: 500000,
        weekendRatePercent: 0,
        totalUnits: 1,
        createdAt: new Date(),
      },
    ],
  };

  it('returns 200 with standard 1-month calendar structure', async () => {
    vi.mocked(prisma.property.findUnique).mockResolvedValueOnce(mockProperty as any);
    vi.mocked(prisma.roomPriceModifier.findMany).mockResolvedValueOnce([]);
    vi.mocked(prisma.roomUnavailability.findMany).mockResolvedValueOnce([]);
    vi.mocked(prisma.booking.findMany).mockResolvedValueOnce([]);

    const res = await request(app).get(
      `/api/v1/properties/${validPropId}/calendar?month=10&year=2026`
    );

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Kalender harga properti berhasil diambil.');
    expect(res.body.data.roomId).toBe(validRoomId);
    expect(res.body.data.basePrice).toBe(500000);
    expect(res.body.data.calendar).toHaveLength(31);
    expect(res.body.data.calendar[0]).toEqual({
      date: '2026-10-01',
      price: 500000,
      isAvailable: true,
      reason: null,
    });
  });

  it('returns 400 when property ID parameter is not a valid CUID', async () => {
    const res = await request(app).get('/api/v1/properties/not-cuid/calendar');

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Validasi data gagal.');
  });

  it('returns 400 when month query parameter is out of range', async () => {
    const res = await request(app).get(
      `/api/v1/properties/${validPropId}/calendar?month=13&year=2026`
    );

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Validasi data gagal.');
  });

  it('returns 404 when property is not found', async () => {
    vi.mocked(prisma.property.findUnique).mockResolvedValueOnce(null);

    const res = await request(app).get(
      `/api/v1/properties/${validPropId}/calendar?month=10&year=2026`
    );

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Properti tidak ditemukan.');
  });
});
