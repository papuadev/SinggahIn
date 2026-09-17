import { describe, it, expect } from 'vitest';
import {
  peakRateFormSchema,
  roomUnavailabilityFormSchema,
} from '../schemas/pricing.schema';

describe('Pricing Zod Schemas', () => {
  describe('peakRateFormSchema', () => {
    it('accepts valid nominal adjustment rate', () => {
      const result = peakRateFormSchema.safeParse({
        startDate: '2026-12-20',
        endDate: '2027-01-05',
        adjustmentType: 'NOMINAL',
        adjustmentValue: 150000,
        reason: 'Libur Akhir Tahun',
        applyToAllRooms: true,
      });
      expect(result.success).toBe(true);
    });

    it('accepts valid percentage adjustment rate', () => {
      const result = peakRateFormSchema.safeParse({
        startDate: '2026-06-01',
        endDate: '2026-06-15',
        adjustmentType: 'PERCENTAGE',
        adjustmentValue: 25,
        reason: 'School Holiday',
      });
      expect(result.success).toBe(true);
    });

    it('rejects zero adjustment value', () => {
      const result = peakRateFormSchema.safeParse({
        startDate: '2026-06-01',
        endDate: '2026-06-15',
        adjustmentType: 'NOMINAL',
        adjustmentValue: 0,
      });
      expect(result.success).toBe(false);
    });

    it('rejects percentage exceeding +500% or below -90%', () => {
      const tooHigh = peakRateFormSchema.safeParse({
        startDate: '2026-06-01',
        endDate: '2026-06-15',
        adjustmentType: 'PERCENTAGE',
        adjustmentValue: 600,
      });
      expect(tooHigh.success).toBe(false);

      const tooLow = peakRateFormSchema.safeParse({
        startDate: '2026-06-01',
        endDate: '2026-06-15',
        adjustmentType: 'PERCENTAGE',
        adjustmentValue: -95,
      });
      expect(tooLow.success).toBe(false);
    });

    it('rejects startDate later than endDate', () => {
      const result = peakRateFormSchema.safeParse({
        startDate: '2026-12-31',
        endDate: '2026-12-01',
        adjustmentType: 'NOMINAL',
        adjustmentValue: 50000,
      });
      expect(result.success).toBe(false);
    });
  });

  describe('roomUnavailabilityFormSchema', () => {
    it('accepts valid room unavailability range', () => {
      const result = roomUnavailabilityFormSchema.safeParse({
        startDate: '2026-10-01',
        endDate: '2026-10-07',
        reason: 'Renovasi Kamar Mandi',
      });
      expect(result.success).toBe(true);
    });

    it('rejects startDate later than endDate', () => {
      const result = roomUnavailabilityFormSchema.safeParse({
        startDate: '2026-10-10',
        endDate: '2026-10-05',
      });
      expect(result.success).toBe(false);
    });
  });
});
