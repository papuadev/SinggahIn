import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prisma } from '../../../shared/services/prisma.service';
import { getPropertyCalendar } from '../calendar.service';

vi.mock('../../../shared/services/prisma.service', () => ({
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

describe('Calendar Service - getPropertyCalendar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockRooms = [
    { id: 'room-1', basePrice: 500000, weekendRatePercent: 20, totalUnits: 2, createdAt: new Date('2026-01-01') },
    { id: 'room-2', basePrice: 800000, weekendRatePercent: 0, totalUnits: 1, createdAt: new Date('2026-01-02') },
  ];

  it('throws not found when property does not exist', async () => {
    vi.mocked(prisma.property.findUnique).mockResolvedValueOnce(null);
    await expect(
      getPropertyCalendar('non-existent', { month: 10, year: 2026 })
    ).rejects.toThrow('Properti tidak ditemukan.');
  });

  it('throws not found when property has no rooms registered', async () => {
    vi.mocked(prisma.property.findUnique).mockResolvedValueOnce({ id: 'p1', rooms: [] } as any);
    await expect(
      getPropertyCalendar('p1', { month: 10, year: 2026 })
    ).rejects.toThrow('Properti belum memiliki kamar yang terdaftar.');
  });

  it('throws not found when requested roomId does not belong to property', async () => {
    vi.mocked(prisma.property.findUnique).mockResolvedValueOnce({ id: 'p1', rooms: mockRooms } as any);
    await expect(
      getPropertyCalendar('p1', { month: 10, year: 2026, roomId: 'unknown-room' })
    ).rejects.toThrow('Tipe kamar tidak ditemukan pada properti ini.');
  });

  it('generates 31 days for October defaulting to first room when roomId is omitted', async () => {
    vi.mocked(prisma.property.findUnique).mockResolvedValueOnce({ id: 'p1', rooms: mockRooms } as any);
    vi.mocked(prisma.roomPriceModifier.findMany).mockResolvedValueOnce([]);
    vi.mocked(prisma.roomUnavailability.findMany).mockResolvedValueOnce([]);
    vi.mocked(prisma.booking.findMany).mockResolvedValueOnce([]);

    const result = await getPropertyCalendar('p1', { month: 10, year: 2026 });

    expect(result.roomId).toBe('room-1');
    expect(result.basePrice).toBe(500000);
    expect(result.calendar).toHaveLength(31);
    expect(result.calendar[0].date).toBe('2026-10-01');
    expect(result.calendar[30].date).toBe('2026-10-31');
  });

  it('targets specific room when valid roomId is requested', async () => {
    vi.mocked(prisma.property.findUnique).mockResolvedValueOnce({ id: 'p1', rooms: mockRooms } as any);
    vi.mocked(prisma.roomPriceModifier.findMany).mockResolvedValueOnce([]);
    vi.mocked(prisma.roomUnavailability.findMany).mockResolvedValueOnce([]);
    vi.mocked(prisma.booking.findMany).mockResolvedValueOnce([]);

    const result = await getPropertyCalendar('p1', { month: 10, year: 2026, roomId: 'room-2' });

    expect(result.roomId).toBe('room-2');
    expect(result.basePrice).toBe(800000);
  });
});
