import { describe, it, expect } from 'vitest';
import { salesReportQuerySchema, occupancyMatrixQuerySchema } from '../report.schema';

describe('Report Validation Schemas', () => {
  describe('salesReportQuerySchema', () => {
    it('accepts valid date range and groupBy parameters', () => {
      const res = salesReportQuerySchema.safeParse({
        startDate: '2026-01-01',
        endDate: '2026-12-31',
        groupBy: 'PROPERTY',
        sortBy: 'revenue',
        sortOrder: 'desc',
      });
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.groupBy).toBe('PROPERTY');
      }
    });

    it('accepts month, year, and allData flags', () => {
      const res = salesReportQuerySchema.safeParse({
        month: 10, year: 2026, allData: true, sortBy: 'TERTINGGI',
      });
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.month).toBe(10);
        expect(res.data.allData).toBe(true);
        expect(res.data.sortBy).toBe('TERTINGGI');
      }
    });

    it('correctly handles allData string values and empty strings', () => {
      const parsedFalse = salesReportQuerySchema.safeParse({ allData: 'false', startDate: '', endDate: '' });
      expect(parsedFalse.success).toBe(true);
      if (parsedFalse.success) {
        expect(parsedFalse.data.allData).toBe(false);
        expect(parsedFalse.data.startDate).toBeUndefined();
        expect(parsedFalse.data.endDate).toBeUndefined();
      }
      const parsedTrue = salesReportQuerySchema.safeParse({ allData: 'true' });
      expect(parsedTrue.success).toBe(true);
      if (parsedTrue.success) {
        expect(parsedTrue.data.allData).toBe(true);
      }
    });

    it('defaults groupBy to PROPERTY and sortOrder to desc', () => {
      const res = salesReportQuerySchema.safeParse({});
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.groupBy).toBe('PROPERTY');
        expect(res.data.sortOrder).toBe('desc');
      }
    });

    it('rejects invalid date format', () => {
      const res = salesReportQuerySchema.safeParse({ startDate: '01-01-2026' });
      expect(res.success).toBe(false);
    });

    it('rejects invalid groupBy option', () => {
      const res = salesReportQuerySchema.safeParse({ groupBy: 'INVALID_GROUP' });
      expect(res.success).toBe(false);
    });
  });

  describe('occupancyMatrixQuerySchema', () => {
    it('accepts valid month and year', () => {
      const res = occupancyMatrixQuerySchema.safeParse({ month: '10', year: '2026' });
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.month).toBe(10);
        expect(res.data.year).toBe(2026);
      }
    });

    it('rejects month out of range', () => {
      const res = occupancyMatrixQuerySchema.safeParse({ month: '13' });
      expect(res.success).toBe(false);
    });

    it('rejects year out of range', () => {
      const res = occupancyMatrixQuerySchema.safeParse({ year: '2010' });
      expect(res.success).toBe(false);
    });
  });
});
