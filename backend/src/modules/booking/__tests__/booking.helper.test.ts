import { describe, it, expect } from 'vitest';
import {
  generateBookingCode,
  calculateBookingExpiry,
  parseAndValidateBookingDates,
} from '../booking.helper';

describe('booking.helper', () => {
  it('generates booking code matching SGH-YYYYMMDD-XXXX format', () => {
    const code = generateBookingCode(new Date('2026-10-01T10:00:00.000Z'));
    expect(code).toMatch(/^SGH-20261001-[A-Z0-9]{4}$/);
  });

  it('calculates booking expiry timestamp default 2 hours ahead', () => {
    const before = Date.now();
    const expiry = calculateBookingExpiry(2);
    const after = Date.now();
    const diffHours = (expiry.getTime() - before) / (1000 * 60 * 60);
    expect(diffHours).toBeGreaterThanOrEqual(1.99);
    expect(diffHours).toBeLessThanOrEqual(2.01);
    expect(expiry.getTime()).toBeGreaterThan(after);
  });

  it('parses valid future check-in and check-out dates', () => {
    const futureCheckIn = '2027-01-10';
    const futureCheckOut = '2027-01-15';
    const result = parseAndValidateBookingDates(futureCheckIn, futureCheckOut);
    expect(result.checkIn.toISOString()).toBe('2027-01-10T00:00:00.000Z');
    expect(result.checkOut.toISOString()).toBe('2027-01-15T00:00:00.000Z');
  });

  it('throws error when check-in date is in the past', () => {
    expect(() => {
      parseAndValidateBookingDates('2020-01-01', '2020-01-05');
    }).toThrow('Tanggal check-in tidak boleh di masa lalu.');
  });

  it('throws error when check-out date is before or equal to check-in date', () => {
    expect(() => {
      parseAndValidateBookingDates('2027-02-10', '2027-02-10');
    }).toThrow('Tanggal check-out harus setelah tanggal check-in.');
    expect(() => {
      parseAndValidateBookingDates('2027-02-10', '2027-02-08');
    }).toThrow('Tanggal check-out harus setelah tanggal check-in.');
  });

  it('throws error on invalid date string', () => {
    expect(() => {
      parseAndValidateBookingDates('invalid-date', '2027-02-10');
    }).toThrow('Format tanggal tidak valid');
  });
});
