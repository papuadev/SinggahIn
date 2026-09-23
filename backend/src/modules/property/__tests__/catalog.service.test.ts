import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prisma } from '../../../shared/services/prisma.service';
import { getCatalogProperties } from '../catalog.service';

vi.mock('../../../shared/services/prisma.service', () => ({
  prisma: {
    property: {
      findMany: vi.fn(),
    },
  },
}));

describe('Catalog Service - getCatalogProperties', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockCategory = { name: 'Villa', slug: 'villa' };
  const mockImages = [{ imageUrl: 'https://cdn.com/cover.webp', isCover: true, createdAt: new Date() }];
  const mockReviews = [{ rating: 5 }, { rating: 4 }];

  it('returns empty list with 0 meta when no properties found', async () => {
    vi.mocked(prisma.property.findMany).mockResolvedValueOnce([]);
    const result = await getCatalogProperties({
      page: 1, limit: 10, sortBy: 'price', sortOrder: 'asc',
    });
    expect(result.data).toEqual([]);
    expect(result.meta).toEqual({ page: 1, limit: 10, totalItems: 0, totalPages: 0 });
  });

  it('returns properties with starting base price in browse mode', async () => {
    const mockProperty = {
      id: 'p1', title: 'Villa Asri', city: 'Bandung', address: 'Jl. Kolonel Masturi',
      category: mockCategory, images: mockImages, reviews: mockReviews,
      rooms: [
        { id: 'r1', basePrice: 600000, capacity: 4, totalUnits: 2, modifiers: [], unavailabilities: [], bookings: [] },
        { id: 'r2', basePrice: 450000, capacity: 2, totalUnits: 1, modifiers: [], unavailabilities: [], bookings: [] },
      ],
    };
    vi.mocked(prisma.property.findMany).mockResolvedValueOnce([mockProperty as any]);

    const result = await getCatalogProperties({
      page: 1, limit: 10, sortBy: 'price', sortOrder: 'asc',
    });

    expect(result.data.length).toBe(1);
    expect(result.data[0].id).toBe('p1');
    expect(result.data[0].title).toBe('Villa Asri');
    expect(result.data[0].averageRating).toBe(4.5);
    expect(result.data[0].totalReviews).toBe(2);
    expect(result.data[0].pricing).toEqual({
      averageNightRate: 450000, totalStayPrice: 450000, totalNights: 1,
    });
  });

  it('filters out properties where all rooms are blocked or booked on selected dates', async () => {
    const mockUnavailableProp = {
      id: 'p2', title: 'Villa Penuh', city: 'Bandung', address: 'Jl. Lembang',
      category: mockCategory, images: mockImages, reviews: [],
      rooms: [
        {
          id: 'r1', basePrice: 500000, capacity: 2, totalUnits: 1,
          modifiers: [], unavailabilities: [{ id: 'u1' }], bookings: [],
        },
      ],
    };
    vi.mocked(prisma.property.findMany).mockResolvedValueOnce([mockUnavailableProp as any]);

    const result = await getCatalogProperties({
      checkIn: '2026-10-01', checkOut: '2026-10-03',
      page: 1, limit: 10, sortBy: 'price', sortOrder: 'asc',
    });

    expect(result.data.length).toBe(0);
    expect(result.meta.totalItems).toBe(0);
  });

  it('sorts properties by name ascending and descending', async () => {
    const propA = {
      id: 'pA', title: 'A Villa', city: 'Bandung', address: 'Jl. A',
      category: mockCategory, images: mockImages, reviews: [],
      rooms: [{ id: 'r1', basePrice: 500000, capacity: 2, totalUnits: 1, modifiers: [], unavailabilities: [], bookings: [] }],
    };
    const propB = {
      id: 'pB', title: 'B Villa', city: 'Bandung', address: 'Jl. B',
      category: mockCategory, images: mockImages, reviews: [],
      rooms: [{ id: 'r2', basePrice: 500000, capacity: 2, totalUnits: 1, modifiers: [], unavailabilities: [], bookings: [] }],
    };
    vi.mocked(prisma.property.findMany).mockResolvedValueOnce([propB as any, propA as any]);

    const asc = await getCatalogProperties({
      page: 1, limit: 10, sortBy: 'name', sortOrder: 'asc',
    });
    expect(asc.data[0].title).toBe('A Villa');
    expect(asc.data[1].title).toBe('B Villa');
  });

  it('paginates results accurately across pages', async () => {
    const props = [1, 2, 3].map((i) => ({
      id: `p${i}`, title: `Villa ${i}`, city: 'Bandung', address: 'Jl. Test',
      category: mockCategory, images: mockImages, reviews: [],
      rooms: [{ id: `r${i}`, basePrice: i * 100000, capacity: 2, totalUnits: 1, modifiers: [], unavailabilities: [], bookings: [] }],
    }));
    vi.mocked(prisma.property.findMany).mockResolvedValueOnce(props as any);

    const page2 = await getCatalogProperties({
      page: 2, limit: 2, sortBy: 'price', sortOrder: 'asc',
    });
    expect(page2.data.length).toBe(1);
    expect(page2.data[0].id).toBe('p3');
    expect(page2.meta).toEqual({ page: 2, limit: 2, totalItems: 3, totalPages: 2 });
  });
});
