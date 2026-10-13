import { describe, it, expect } from 'vitest';
import { AdjustmentType } from '@prisma/client';
import { buildDailyPrice, toUtcDate } from '../pricing.helper';
import { RoomPriceModifierDto } from '../pricing.types';

describe('National Holiday Pricing Surcharge Tests', () => {
  const basePrice = 500000;

  it('applies national holiday surcharge when date is an Indonesian holiday', () => {
    // 2026-08-17 is Indonesian Independence Day (Monday)
    const holidayDate = toUtcDate('2026-08-17');
    const result = buildDailyPrice(holidayDate, basePrice, null, 10, 25);

    expect(result.effectivePrice).toBe(625000); // 500,000 * 1.25
    expect(result.adjustmentType).toBe(AdjustmentType.PERCENTAGE);
    expect(result.adjustmentValue).toBe(25);
    expect(result.reason).toContain('Hari Kemerdekaan RI');
  });

  it('prioritizes peak season modifier over national holiday surcharge', () => {
    const holidayDate = toUtcDate('2026-08-17');
    const modifier: RoomPriceModifierDto = {
      id: 'mod-1',
      roomId: 'room-1',
      startDate: new Date('2026-08-15'),
      endDate: new Date('2026-08-20'),
      adjustmentType: AdjustmentType.NOMINAL,
      adjustmentValue: 200000,
      reason: 'Special Independence Promo',
      createdAt: new Date(),
    };

    const result = buildDailyPrice(holidayDate, basePrice, modifier, 10, 25);

    expect(result.effectivePrice).toBe(700000); // 500,000 + 200,000
    expect(result.reason).toBe('Special Independence Promo');
    expect(result.modifierId).toBe('mod-1');
  });

  it('prioritizes national holiday over weekend rate if holiday falls on weekend', () => {
    // 2024-03-31 is Easter Sunday
    const easterSunday = toUtcDate('2024-03-31');
    const result = buildDailyPrice(easterSunday, basePrice, null, 15, 30);

    expect(result.effectivePrice).toBe(650000); // 30% holiday rate instead of 15% weekend
    expect(result.adjustmentValue).toBe(30);
    expect(result.reason).toContain('Hari Paskah');
  });

  it('applies normal weekend rate when date is not a holiday', () => {
    // 2026-08-15 is Saturday, not a holiday
    const saturday = toUtcDate('2026-08-15');
    const result = buildDailyPrice(saturday, basePrice, null, 20, 25);

    expect(result.effectivePrice).toBe(600000); // 20% weekend rate
    expect(result.adjustmentValue).toBe(20);
    expect(result.reason).toBe('Tarif Akhir Pekan (+20%)');
  });

  it('applies base price when holidayRatePercent is 0 or omitted on holiday', () => {
    const holidayDate = toUtcDate('2026-08-17');
    const result = buildDailyPrice(holidayDate, basePrice, null, 0, 0);

    expect(result.effectivePrice).toBe(basePrice);
    expect(result.adjustmentType).toBeNull();
  });
});
