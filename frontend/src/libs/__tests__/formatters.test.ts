import { describe, it, expect } from 'vitest';
import {
  formatRupiah,
  formatCompactRupiah,
  formatDateID
} from '../formatters';

describe('Frontend Formatter Utilities', () => {
  describe('formatRupiah', () => {
    it('should format numbers to Indonesian Rupiah currency format', () => {
      const result = formatRupiah(150000);
      // Handles both regular space and non-breaking space used by Intl
      expect(result.replace(/\s/g, ' ')).toMatch(/Rp\s?150\.000/);
    });

    it('should format 0 correctly', () => {
      const result = formatRupiah(0);
      expect(result.replace(/\s/g, ' ')).toMatch(/Rp\s?0/);
    });
  });

  describe('formatCompactRupiah', () => {
    it('should format thousands to "rb"', () => {
      expect(formatCompactRupiah(150000)).toBe('Rp 150rb');
      expect(formatCompactRupiah(25000)).toBe('Rp 25rb');
    });

    it('should format millions to "jt"', () => {
      expect(formatCompactRupiah(1500000)).toBe('Rp 1,5jt');
      expect(formatCompactRupiah(2000000)).toBe('Rp 2jt');
    });

    it('should format billions to "M"', () => {
      expect(formatCompactRupiah(1000000000)).toBe('Rp 1M');
      expect(formatCompactRupiah(2500000000)).toBe('Rp 2,5M');
    });

    it('should format values under 1000 with raw number', () => {
      expect(formatCompactRupiah(500)).toBe('Rp 500');
    });
  });

  describe('formatDateID', () => {
    it('should format Date instance to Indonesian locale string', () => {
      const date = new Date(2026, 8, 2); // 2 September 2026
      const result = formatDateID(date);
      expect(result).toBe('02 September 2026');
    });

    it('should format ISO date string correctly', () => {
      const result = formatDateID('2026-09-02T10:00:00.000Z');
      expect(result).toBe('02 September 2026');
    });

    it('should format number timestamp correctly', () => {
      const date = new Date(2026, 8, 2);
      const result = formatDateID(date.getTime());
      expect(result).toBe('02 September 2026');
    });

    it('should support custom pattern', () => {
      const date = new Date(2026, 8, 2);
      const result = formatDateID(date, 'dd/MM/yyyy');
      expect(result).toBe('02/09/2026');
    });
  });
});
