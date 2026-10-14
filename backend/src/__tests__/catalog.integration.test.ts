import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../index';
import { prisma } from '../shared/services/prisma.service';

vi.mock('../shared/services/prisma.service', () => ({
  prisma: {
    property: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
    propertyCategory: {
      findMany: vi.fn(),
    },
  },
}));

describe('Catalog HTTP Integration Tests (GET /api/v1/properties)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockProperty = {
    id: 'prop-1',
    title: 'Villa Asri Lembang',
    city: 'Bandung',
    address: 'Jl. Kolonel Masturi No. 88',
    category: { name: 'Villa', slug: 'villa' },
    images: [{ imageUrl: 'https://res.cloudinary.com/demo/cover.webp', isCover: true, createdAt: new Date() }],
    reviews: [{ rating: 5 }, { rating: 4 }],
    rooms: [
      {
        id: 'room-1',
        basePrice: 600000,
        weekendRatePercent: 0,
        capacity: 4,
        totalUnits: 2,
        modifiers: [],
        unavailabilities: [],
        bookings: [],
      },
    ],
  };

  it('GET /api/v1/properties returns 200 with default pagination and properties list', async () => {
    vi.mocked(prisma.property.findMany).mockResolvedValueOnce([mockProperty as any]);

    const res = await request(app).get('/api/v1/properties');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Katalog properti berhasil diambil.');
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].id).toBe('prop-1');
    expect(res.body.data[0].title).toBe('Villa Asri Lembang');
    expect(res.body.data[0].category.slug).toBe('villa');
    expect(res.body.data[0].averageRating).toBe(4.5);
    expect(res.body.data[0].totalReviews).toBe(2);
    expect(res.body.data[0].pricing).toEqual({
      averageNightRate: 600000,
      totalStayPrice: 600000,
      totalNights: 1,
    });
    expect(res.body.meta).toEqual({
      page: 1,
      limit: 10,
      totalItems: 1,
      totalPages: 1,
    });
  });

  it('GET /api/v1/properties accepts filter query parameters and returns 200', async () => {
    vi.mocked(prisma.property.findMany).mockResolvedValueOnce([mockProperty as any]);

    const res = await request(app).get(
      '/api/v1/properties?city=Bandung&category=villa&sortBy=price&sortOrder=asc&page=1&limit=5'
    );

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.meta.limit).toBe(5);
  });

  it('GET /api/v1/properties returns 400 when checkIn is given without checkOut', async () => {
    const res = await request(app).get('/api/v1/properties?checkIn=2026-10-01');

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Validasi data gagal.');
  });

  it('GET /api/v1/properties returns 400 when checkOut is before checkIn', async () => {
    const res = await request(app).get(
      '/api/v1/properties?checkIn=2026-10-05&checkOut=2026-10-01'
    );

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Validasi data gagal.');
  });

  it('GET /api/v1/properties returns 400 when guests count is negative or zero', async () => {
    const res = await request(app).get('/api/v1/properties?guests=0');

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Validasi data gagal.');
  });
});
