import { describe, it, expect } from 'vitest';
import { AdjustmentType } from '@prisma/client';
import {
  computeAdjustedPrice,
  getDaysDifference,
  isDateWithinRange,
  resolveModifierForDate,
  generateDateRange,
  aggregateStayPricing,
  buildDailyPrice,
  toUtcDate,
} from '../pricing.helper';
import { RoomPriceModifierDto, DailyPriceDto } from '../pricing.types';

describe('Pricing Helper Tests', () => {
  describe('computeAdjustedPrice', () => {
    it('should calculate percentage markup correctly', () => {
      expect(computeAdjustedPrice(500000, AdjustmentType.PERCENTAGE, 25)).toBe(625000);
    });

    it('should calculate percentage discount correctly', () => {
      expect(computeAdjustedPrice(500000, AdjustmentType.PERCENTAGE, -10)).toBe(450000);
    });

    it('should calculate nominal markup correctly', () => {
      expect(computeAdjustedPrice(500000, AdjustmentType.NOMINAL, 150000)).toBe(650000);
    });

    it('should calculate nominal discount correctly', () => {
      expect(computeAdjustedPrice(500000, AdjustmentType.NOMINAL, -50000)).toBe(450000);
    });

    it('should not allow price to fall below zero', () => {
      expect(computeAdjustedPrice(500000, AdjustmentType.NOMINAL, -600000)).toBe(0);
    });
  });

  describe('getDaysDifference & isDateWithinRange', () => {
    it('should return 1 for same day start and end', () => {
      const d = toUtcDate('2026-10-01');
      expect(getDaysDifference(d, d)).toBe(1);
    });

    it('should return correct day count for date range', () => {
      const start = toUtcDate('2026-10-01');
      const end = toUtcDate('2026-10-05');
      expect(getDaysDifference(start, end)).toBe(5);
    });

    it('should correctly check date within inclusive range', () => {
      const start = toUtcDate('2026-10-01');
      const end = toUtcDate('2026-10-05');
      expect(isDateWithinRange(toUtcDate('2026-10-01'), start, end)).toBe(true);
      expect(isDateWithinRange(toUtcDate('2026-10-03'), start, end)).toBe(true);
      expect(isDateWithinRange(toUtcDate('2026-10-05'), start, end)).toBe(true);
      expect(isDateWithinRange(toUtcDate('2026-10-06'), start, end)).toBe(false);
    });
  });

  describe('Conflict Resolution (Specific Date Overrides Range)', () => {
    const monthlyMod: RoomPriceModifierDto = {
      id: 'm1', roomId: 'r1',
      startDate: toUtcDate('2026-12-01'), endDate: toUtcDate('2026-12-31'),
      adjustmentType: AdjustmentType.PERCENTAGE, adjustmentValue: 10,
      reason: 'Desember Liburan (+10%)', createdAt: new Date('2026-09-01'),
    };

    const weekendMod: RoomPriceModifierDto = {
      id: 'm2', roomId: 'r1',
      startDate: toUtcDate('2026-12-24'), endDate: toUtcDate('2026-12-26'),
      adjustmentType: AdjustmentType.PERCENTAGE, adjustmentValue: 20,
      reason: 'Christmas Weekend (+20%)', createdAt: new Date('2026-09-02'),
    };

    const christmasMod: RoomPriceModifierDto = {
      id: 'm3', roomId: 'r1',
      startDate: toUtcDate('2026-12-25'), endDate: toUtcDate('2026-12-25'),
      adjustmentType: AdjustmentType.PERCENTAGE, adjustmentValue: 50,
      reason: 'Hari Natal (+50%)', createdAt: new Date('2026-09-03'),
    };

    it('should prioritize the most specific single-day modifier on Dec 25', () => {
      const active = resolveModifierForDate(
        [monthlyMod, weekendMod, christmasMod],
        toUtcDate('2026-12-25'),
        500000
      );
      expect(active?.id).toBe('m3');
      expect(active?.reason).toBe('Hari Natal (+50%)');
    });

    it('should prioritize 3-day weekend modifier over monthly modifier on Dec 24', () => {
      const active = resolveModifierForDate(
        [monthlyMod, weekendMod, christmasMod],
        toUtcDate('2026-12-24'),
        500000
      );
      expect(active?.id).toBe('m2');
    });

    it('should fallback to monthly modifier on regular Dec day (Dec 10)', () => {
      const active = resolveModifierForDate(
        [monthlyMod, weekendMod, christmasMod],
        toUtcDate('2026-12-10'),
        500000
      );
      expect(active?.id).toBe('m1');
    });

    it('should break ties by picking the modifier with the highest effective price', () => {
      const modNominal: RoomPriceModifierDto = {
        id: 'tie-nom',
        roomId: 'r1',
        startDate: toUtcDate('2026-12-25'),
        endDate: toUtcDate('2026-12-25'),
        adjustmentType: AdjustmentType.NOMINAL,
        adjustmentValue: 100000, // Price: 500k + 100k = 600k
        reason: 'Nominal rate',
        createdAt: new Date('2026-09-01'),
      };
      const modPercent: RoomPriceModifierDto = {
        id: 'tie-pct',
        roomId: 'r1',
        startDate: toUtcDate('2026-12-25'),
        endDate: toUtcDate('2026-12-25'),
        adjustmentType: AdjustmentType.PERCENTAGE,
        adjustmentValue: 30, // Price: 500k * 1.3 = 650k
        reason: 'Percentage rate',
        createdAt: new Date('2026-09-01'),
      };

      const active = resolveModifierForDate(
        [modNominal, modPercent],
        toUtcDate('2026-12-25'),
        500000
      );
      expect(active?.id).toBe('tie-pct');
    });
  });

  describe('generateDateRange & aggregateStayPricing', () => {
    it('should generate continuous dates for stay nights', () => {
      const range = generateDateRange(toUtcDate('2026-10-01'), toUtcDate('2026-10-04'));
      expect(range.length).toBe(3);
      expect(range[0].toISOString().slice(0, 10)).toBe('2026-10-01');
      expect(range[1].toISOString().slice(0, 10)).toBe('2026-10-02');
      expect(range[2].toISOString().slice(0, 10)).toBe('2026-10-03');
    });

    it('should aggregate stay pricing correctly', () => {
      const mockBreakdown: DailyPriceDto[] = [
        { date: '2026-10-01', basePrice: 500000, effectivePrice: 500000, modifierId: null, adjustmentType: null, adjustmentValue: null, reason: null },
        { date: '2026-10-02', basePrice: 500000, effectivePrice: 625000, modifierId: 'm1', adjustmentType: AdjustmentType.PERCENTAGE, adjustmentValue: 25, reason: 'Weekend' },
        { date: '2026-10-03', basePrice: 500000, effectivePrice: 650000, modifierId: 'm2', adjustmentType: AdjustmentType.NOMINAL, adjustmentValue: 150000, reason: 'Holiday' },
      ];
      const result = aggregateStayPricing('r1', '2026-10-01', '2026-10-04', 500000, mockBreakdown);

      expect(result.totalNights).toBe(3);
      expect(result.totalStayPrice).toBe(1775000);
      expect(result.averageNightRate).toBe(Math.round(1775000 / 3));
      expect(result.dailyBreakdown.length).toBe(3);
    });
  });

  describe('buildDailyPrice with Weekend Rate & Peak Season Precedence', () => {
    it('applies percentage markup on Saturday & Sunday when no peak season modifier exists', () => {
      // 2026-10-03 is Saturday, 2026-10-04 is Sunday, 2026-10-02 is Friday
      const sat = buildDailyPrice(toUtcDate('2026-10-03'), 500000, null, 20);
      expect(sat.effectivePrice).toBe(600000);
      expect(sat.reason).toBe('Tarif Akhir Pekan (+20%)');

      const sun = buildDailyPrice(toUtcDate('2026-10-04'), 500000, null, 20);
      expect(sun.effectivePrice).toBe(600000);

      const fri = buildDailyPrice(toUtcDate('2026-10-02'), 500000, null, 20);
      expect(fri.effectivePrice).toBe(500000);
      expect(fri.reason).toBeNull();
    });

    it('prioritizes peak season modifier over weekend rate when both coincide', () => {
      const peakMod: RoomPriceModifierDto = {
        id: 'peak-1', roomId: 'r1',
        startDate: toUtcDate('2026-10-03'), endDate: toUtcDate('2026-10-03'),
        adjustmentType: AdjustmentType.PERCENTAGE, adjustmentValue: 50,
        reason: 'Konser Musik', createdAt: new Date(),
      };
      // On Saturday 2026-10-03 with 20% weekend rate and 50% peak season modifier
      const res = buildDailyPrice(toUtcDate('2026-10-03'), 500000, peakMod, 20);
      expect(res.effectivePrice).toBe(750000); // 500,000 * 1.5
      expect(res.reason).toBe('Konser Musik');
      expect(res.modifierId).toBe('peak-1');
    });
  });
});
