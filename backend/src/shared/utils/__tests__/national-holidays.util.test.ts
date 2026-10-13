import { describe, it, expect } from 'vitest';
import {
  getIndonesianNationalHoliday,
  isIndonesianHoliday,
} from '../national-holidays.util';

describe('national-holidays.util', () => {
  it('detects fixed annual national holidays', () => {
    expect(isIndonesianHoliday('2026-08-17')).toBe(true);
    expect(getIndonesianNationalHoliday('2026-08-17')).toEqual({
      isHoliday: true,
      name: 'Hari Kemerdekaan RI',
    });
    expect(isIndonesianHoliday('2025-12-25')).toBe(true);
    expect(getIndonesianNationalHoliday('2025-12-25')).toEqual({
      isHoliday: true,
      name: 'Hari Raya Natal',
    });
  });

  it('detects variable lunar/religious national holidays', () => {
    expect(isIndonesianHoliday('2026-03-20')).toBe(true);
    expect(getIndonesianNationalHoliday('2026-03-20')).toEqual({
      isHoliday: true,
      name: 'Hari Raya Idul Fitri',
    });
    expect(isIndonesianHoliday('2026-01-16')).toBe(true);
    expect(getIndonesianNationalHoliday('2026-01-16')).toEqual({
      isHoliday: true,
      name: "Isra Mi'raj",
    });
  });

  it('returns false for normal days', () => {
    expect(isIndonesianHoliday('2026-08-18')).toBe(false);
    expect(getIndonesianNationalHoliday('2026-08-18')).toEqual({
      isHoliday: false,
    });
  });

  it('handles Date object parameter properly', () => {
    const d = new Date('2026-05-01T10:00:00.000Z');
    expect(isIndonesianHoliday(d)).toBe(true);
    expect(getIndonesianNationalHoliday(d).name).toBe('Hari Buruh Internasional');
  });
});
