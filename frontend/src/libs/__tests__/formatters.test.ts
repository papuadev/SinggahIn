import { describe, it, expect } from 'vitest';
import {
  formatRupiah,
  formatCompactRupiah,
  formatCalendarPrice,
  formatDateID,
  formatCurrencyInput,
  parseCurrencyInput,
} from '../formatters';

describe('Frontend Formatter Utilities', () => {
  describe('formatRupiah', () => {
    it('should format numbers to Indonesian Rupiah currency format', () => {
      const result = formatRupiah(150000);
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

  describe('formatCalendarPrice', () => {
    it('should format thousands without Rp and with K', () => {
      expect(formatCalendarPrice(500000)).toBe('500K');
      expect(formatCalendarPrice(650000)).toBe('650K');
      expect(formatCalendarPrice(25000)).toBe('25K');
    });

    it('should format millions as thousands with K', () => {
      expect(formatCalendarPrice(1000000)).toBe('1000K');
      expect(formatCalendarPrice(1500000)).toBe('1500K');
    });

    it('should format numbers with decimal thousands', () => {
      expect(formatCalendarPrice(550500)).toBe('550.5K');
    });

    it('should format values under 1000 without K or Rp', () => {
      expect(formatCalendarPrice(500)).toBe('500');
    });
  });

  describe('formatDateID', () => {
    it('should format Date instance to Indonesian locale string', () => {
      const date = new Date(2026, 8, 2);
      expect(formatDateID(date)).toBe('02 September 2026');
    });

    it('should format ISO date string correctly', () => {
      expect(formatDateID('2026-09-02T10:00:00.000Z')).toBe('02 September 2026');
    });

    it('should format number timestamp correctly', () => {
      const date = new Date(2026, 8, 2);
      expect(formatDateID(date.getTime())).toBe('02 September 2026');
    });

    it('should support custom pattern', () => {
      const date = new Date(2026, 8, 2);
      expect(formatDateID(date, 'dd/MM/yyyy')).toBe('02/09/2026');
    });
  });

  describe('formatCurrencyInput & parseCurrencyInput', () => {
    it('formats raw numbers into Indonesian dot-separated format', () => {
      expect(formatCurrencyInput(100000)).toBe('100.000');
      expect(formatCurrencyInput('100000')).toBe('100.000');
      expect(formatCurrencyInput(1500000)).toBe('1.500.000');
      expect(formatCurrencyInput(0)).toBe('0');
      expect(formatCurrencyInput('')).toBe('');
      expect(formatCurrencyInput(null)).toBe('');
      expect(formatCurrencyInput(undefined)).toBe('');
    });

    it('formats negative numbers when allowNegative is true', () => {
      expect(formatCurrencyInput(-50000, true)).toBe('-50.000');
      expect(formatCurrencyInput('-50000', true)).toBe('-50.000');
    });

    it('parses formatted dot-separated strings into numbers', () => {
      expect(parseCurrencyInput('100.000')).toBe(100000);
      expect(parseCurrencyInput('1.500.000')).toBe(1500000);
      expect(parseCurrencyInput('Rp 100.000')).toBe(100000);
      expect(parseCurrencyInput('-50.000', true)).toBe(-50000);
      expect(parseCurrencyInput('')).toBeUndefined();
      expect(parseCurrencyInput(undefined)).toBeUndefined();
    });
  });
});
