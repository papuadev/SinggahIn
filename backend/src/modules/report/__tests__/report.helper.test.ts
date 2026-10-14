import { describe, it, expect } from 'vitest';
import {
  groupBookingsByProperty,
  groupBookingsByUser,
  mapBookingsToTransactions,
  sortSalesBreakdown,
  buildDaysArray,
  resolveDayOccupancy,
  calculateOccupancyRate,
} from '../report.helper';

describe('Report Helpers', () => {
  const mockBookings = [
    {
      id: 'b1', bookingCode: 'SGH-01', propertyId: 'p1', userId: 'u1', totalPrice: 1000000,
      checkInDate: new Date('2026-10-01'), checkOutDate: new Date('2026-10-03'),
      createdAt: new Date('2026-10-01T10:00:00Z'), status: 'PROCESSED',
      property: { title: 'Villa Asri' }, room: { name: 'Deluxe' },
      user: { name: 'Ali', email: 'ali@test.com' }, payment: { paymentMethod: 'PAYMENT_GATEWAY' },
    },
    {
      id: 'b2', bookingCode: 'SGH-02', propertyId: 'p1', userId: 'u2', totalPrice: 1500000,
      checkInDate: new Date('2026-10-05'), checkOutDate: new Date('2026-10-07'),
      createdAt: new Date('2026-10-02T10:00:00Z'), status: 'PROCESSED',
      property: { title: 'Villa Asri' }, room: { name: 'Deluxe' },
      user: { name: 'Budi', email: 'budi@test.com' }, payment: { paymentMethod: 'MANUAL_TRANSFER' },
    },
  ];

  it('groups bookings by property correctly', () => {
    const res = groupBookingsByProperty(mockBookings);
    expect(res).toHaveLength(1);
    expect(res[0].id).toBe('p1');
    expect(res[0].revenue).toBe(2500000);
    expect(res[0].totalTransactions).toBe(2);
  });

  it('groups bookings by user correctly', () => {
    const res = groupBookingsByUser(mockBookings);
    expect(res).toHaveLength(2);
    expect(res.find((u) => u.id === 'u1')?.totalSpent).toBe(1000000);
  });

  it('maps bookings to transaction breakdown list', () => {
    const res = mapBookingsToTransactions(mockBookings);
    expect(res).toHaveLength(2);
    expect(res[0].bookingCode).toBe('SGH-01');
    expect(res[0].propertyName).toBe('Villa Asri');
  });

  it('sorts sales breakdown by revenue or totalPrice', () => {
    const items = [{ revenue: 100 }, { revenue: 500 }, { revenue: 300 }];
    const sorted = sortSalesBreakdown(items, 'revenue', 'desc');
    expect(sorted[0].revenue).toBe(500);
    expect(sorted[2].revenue).toBe(100);
  });

  it('sorts using the 4 standardized options (TERENDAH, TERTINGGI, TERBARU, TERLAMA)', () => {
    const items = [
      { id: '1', revenue: 100, createdAt: '2026-10-01T00:00:00Z', latestTransactionDate: '2026-10-01T00:00:00Z' },
      { id: '2', revenue: 500, createdAt: '2026-10-05T00:00:00Z', latestTransactionDate: '2026-10-05T00:00:00Z' },
    ];
    const lowest = sortSalesBreakdown(items, 'TERENDAH', 'asc', 'PROPERTY');
    expect(lowest[0].revenue).toBe(100);
    const highest = sortSalesBreakdown(items, 'TERTINGGI', 'desc', 'PROPERTY');
    expect(highest[0].revenue).toBe(500);
    const newest = sortSalesBreakdown(items, 'TERBARU', 'desc', 'PROPERTY');
    expect(newest[0].id).toBe('2');
    const oldest = sortSalesBreakdown(items, 'TERLAMA', 'asc', 'PROPERTY');
    expect(oldest[0].id).toBe('1');
  });

  it('builds calendar days array for given year and month', () => {
    const days = buildDaysArray(2026, 2);
    expect(days).toHaveLength(28);
    expect(days[0].date).toBe('2026-02-01');
  });

  it('resolves day occupancy status properly', () => {
    expect(resolveDayOccupancy(2, 2, false)).toBe('BOOKED');
    expect(resolveDayOccupancy(2, 1, false)).toBe('AVAILABLE');
    expect(resolveDayOccupancy(2, 0, true)).toBe('BLOCKED');
  });

  it('calculates occupancy rate percentage accurately', () => {
    const matrix = [{
      propertyId: 'p1', propertyName: 'V', roomId: 'r1', roomName: 'D', totalUnits: 1,
      days: [
        { date: '2026-10-01', day: 1, status: 'BOOKED' as const, bookedUnits: 1, blockedUnits: 0, availableUnits: 0 },
        { date: '2026-10-02', day: 2, status: 'AVAILABLE' as const, bookedUnits: 0, blockedUnits: 0, availableUnits: 1 },
      ],
    }];
    const rate = calculateOccupancyRate(matrix, 2);
    expect(rate).toBe(50.0);
  });
});
