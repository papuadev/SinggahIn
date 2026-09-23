import { describe, it, expect } from 'vitest';
import {
  calculateRating,
  resolveCoverImage,
  isRoomAvailableForDates,
  computeRoomPricing,
  findBestRoomPricing,
} from '../catalog.helper';
import { AdjustmentType } from '@prisma/client';

describe('catalog.helper', () => {
  it('calculates ratings and rounds to 1 decimal place', () => {
    expect(calculateRating([])).toEqual({ averageRating: 0, totalReviews: 0 });
    const reviews = [{ rating: 5 }, { rating: 4 }, { rating: 5 }];
    expect(calculateRating(reviews)).toEqual({ averageRating: 4.7, totalReviews: 3 });
  });

  it('resolves cover image prioritizing isCover flag', () => {
    expect(resolveCoverImage([])).toBeNull();
    const imgs = [
      { imageUrl: 'https://cdn.com/1.webp', isCover: false },
      { imageUrl: 'https://cdn.com/2.webp', isCover: true },
    ];
    expect(resolveCoverImage(imgs)).toBe('https://cdn.com/2.webp');
    expect(resolveCoverImage([imgs[0]])).toBe('https://cdn.com/1.webp');
  });

  it('determines room availability based on blocks and bookings', () => {
    const blockedRoom = {
      id: 'r1', basePrice: 500000, capacity: 2, totalUnits: 1,
      modifiers: [], unavailabilities: [{ id: 'u1' }], bookings: [],
    };
    expect(isRoomAvailableForDates(blockedRoom)).toBe(false);

    const bookedRoom = {
      id: 'r2', basePrice: 500000, capacity: 2, totalUnits: 1,
      modifiers: [], unavailabilities: [], bookings: [{ id: 'b1' }],
    };
    expect(isRoomAvailableForDates(bookedRoom)).toBe(false);

    const availableRoom = {
      id: 'r3', basePrice: 500000, capacity: 2, totalUnits: 2,
      modifiers: [], unavailabilities: [], bookings: [{ id: 'b1' }],
    };
    expect(isRoomAvailableForDates(availableRoom)).toBe(true);
  });

  it('computes stay pricing with peak season modifiers', () => {
    const room = {
      id: 'r1', basePrice: 500000, weekendRatePercent: 0, capacity: 2, totalUnits: 1,
      unavailabilities: [], bookings: [],
      modifiers: [
        {
          id: 'm1', roomId: 'r1', startDate: new Date('2026-10-01T00:00:00.000Z'),
          endDate: new Date('2026-10-01T00:00:00.000Z'), adjustmentType: AdjustmentType.NOMINAL,
          adjustmentValue: 100000, reason: 'Holiday', createdAt: new Date(),
        },
      ],
    };
    const pricing = computeRoomPricing(room, '2026-10-01', '2026-10-03');
    expect(pricing.totalNights).toBe(2);
    expect(pricing.totalStayPrice).toBe(1100000); // 600k (holiday) + 500k
    expect(pricing.averageNightRate).toBe(550000);
  });

  it('finds lowest pricing among eligible rooms', () => {
    const rooms = [
      {
        id: 'r1', basePrice: 600000, capacity: 4, totalUnits: 1,
        modifiers: [], unavailabilities: [], bookings: [],
      },
      {
        id: 'r2', basePrice: 400000, capacity: 2, totalUnits: 1,
        modifiers: [], unavailabilities: [], bookings: [],
      },
    ];
    const best = findBestRoomPricing(rooms, undefined, undefined, 1);
    expect(best?.averageNightRate).toBe(400000);

    const forFourGuests = findBestRoomPricing(rooms, undefined, undefined, 3);
    expect(forFourGuests?.averageNightRate).toBe(600000);
  });
});
