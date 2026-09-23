import { describe, it, expect } from 'vitest';
import { AdjustmentType } from '@prisma/client';
import {
  getDaysInMonth,
  formatDateString,
  checkDateUnavailability,
  countBookingsForDate,
  isDateWeekend,
  calculateDayPrice,
  buildCalendarDay,
} from '../calendar.helper';

describe('calendar.helper', () => {
  it('computes days in month accurately including leap years', () => {
    expect(getDaysInMonth(2026, 10)).toBe(31);
    expect(getDaysInMonth(2026, 2)).toBe(28);
    expect(getDaysInMonth(2024, 2)).toBe(29);
  });

  it('formats date string with leading zeroes', () => {
    expect(formatDateString(2026, 5, 9)).toBe('2026-05-09');
    expect(formatDateString(2026, 11, 25)).toBe('2026-11-25');
  });

  it('detects unavailabilities overlapping date', () => {
    const unavails = [
      {
        startDate: new Date('2026-10-10T00:00:00.000Z'),
        endDate: new Date('2026-10-12T00:00:00.000Z'),
        reason: 'Renovasi Kamar',
      },
    ];
    expect(checkDateUnavailability('2026-10-11', unavails)).toEqual({
      isBlocked: true,
      reason: 'Renovasi Kamar',
    });
    expect(checkDateUnavailability('2026-10-13', unavails)).toEqual({
      isBlocked: false,
      reason: null,
    });
  });

  it('counts overlapping active bookings for specific date', () => {
    const bookings = [
      {
        checkInDate: new Date('2026-10-01T00:00:00.000Z'),
        checkOutDate: new Date('2026-10-03T00:00:00.000Z'),
      },
      {
        checkInDate: new Date('2026-10-02T00:00:00.000Z'),
        checkOutDate: new Date('2026-10-04T00:00:00.000Z'),
      },
    ];
    expect(countBookingsForDate('2026-10-01', bookings)).toBe(1);
    expect(countBookingsForDate('2026-10-02', bookings)).toBe(2);
    expect(countBookingsForDate('2026-10-03', bookings)).toBe(1);
    expect(countBookingsForDate('2026-10-04', bookings)).toBe(0);
  });

  it('identifies weekend days', () => {
    // 2026-10-02 is Friday, 2026-10-03 is Saturday, 2026-10-04 is Sunday
    expect(isDateWeekend('2026-10-02')).toBe(false);
    expect(isDateWeekend('2026-10-03')).toBe(true);
    expect(isDateWeekend('2026-10-04')).toBe(true);
  });

  it('calculates day price prioritizing modifiers over weekend rate', () => {
    const mod = {
      id: 'm1', roomId: 'r1', startDate: new Date('2026-10-03T00:00:00.000Z'),
      endDate: new Date('2026-10-03T00:00:00.000Z'), adjustmentType: AdjustmentType.NOMINAL,
      adjustmentValue: 150000, reason: 'Libur Idul Fitri', createdAt: new Date(),
    };
    const satWithMod = calculateDayPrice('2026-10-03', 500000, 25, [mod]);
    expect(satWithMod.price).toBe(650000);
    expect(satWithMod.reason).toBe('Libur Idul Fitri');

    const sunWithoutMod = calculateDayPrice('2026-10-04', 500000, 25, []);
    expect(sunWithoutMod.price).toBe(625000);
    expect(sunWithoutMod.reason).toBe('Weekend Rate');

    const weekdayNormal = calculateDayPrice('2026-10-05', 500000, 25, []);
    expect(weekdayNormal.price).toBe(500000);
    expect(weekdayNormal.reason).toBeNull();
  });

  it('builds calendar day item with Sold Out and Unavailable statuses', () => {
    const room = { basePrice: 500000, weekendRatePercent: 0, totalUnits: 1 };
    const unavail = [{
      startDate: new Date('2026-10-01T00:00:00.000Z'),
      endDate: new Date('2026-10-01T00:00:00.000Z'),
      reason: 'Maintenance',
    }];
    const blocked = buildCalendarDay('2026-10-01', room, [], unavail, []);
    expect(blocked).toEqual({
      date: '2026-10-01', price: 0, isAvailable: false, reason: 'Maintenance',
    });

    const booking = [{
      checkInDate: new Date('2026-10-02T00:00:00.000Z'),
      checkOutDate: new Date('2026-10-03T00:00:00.000Z'),
    }];
    const soldOut = buildCalendarDay('2026-10-02', room, [], [], booking);
    expect(soldOut).toEqual({
      date: '2026-10-02', price: 0, isAvailable: false, reason: 'Sold Out',
    });

    const available = buildCalendarDay('2026-10-05', room, [], [], []);
    expect(available).toEqual({
      date: '2026-10-05', price: 500000, isAvailable: true, reason: null,
    });
  });
});
