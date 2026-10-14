import { describe, it, expect } from 'vitest';
import { roomFormSchema } from '../schemas/room.schema';

describe('Room Form Zod Schema Validation', () => {
  it('accepts valid room data with coerced numbers and weekendRatePercent', () => {
    const validData = {
      name: 'Deluxe King Bed',
      basePrice: '350000',
      weekendRatePercent: '25',
      capacity: '2',
      totalUnits: '5',
      description: 'Kamar nyaman ber-AC dengan pemandangan pegunungan.',
    };

    const parsed = roomFormSchema.safeParse(validData);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.name).toBe('Deluxe King Bed');
      expect(parsed.data.basePrice).toBe(350000);
      expect(parsed.data.weekendRatePercent).toBe(25);
      expect(parsed.data.capacity).toBe(2);
      expect(parsed.data.totalUnits).toBe(5);
    }
  });

  it('rejects empty name or name shorter than 2 characters', () => {
    const data = {
      name: 'A',
      basePrice: 200000,
      capacity: 2,
      totalUnits: 1,
    };
    const parsed = roomFormSchema.safeParse(data);
    expect(parsed.success).toBe(false);
  });

  it('rejects basePrice lower than Rp 10.000', () => {
    const data = {
      name: 'Standard Room',
      basePrice: 5000,
      capacity: 2,
      totalUnits: 1,
    };
    const parsed = roomFormSchema.safeParse(data);
    expect(parsed.success).toBe(false);
  });

  it('rejects capacity outside 1 to 50 range', () => {
    const under = roomFormSchema.safeParse({
      name: 'Room',
      basePrice: 50000,
      capacity: 0,
      totalUnits: 1,
    });
    expect(under.success).toBe(false);

    const over = roomFormSchema.safeParse({
      name: 'Room',
      basePrice: 50000,
      capacity: 55,
      totalUnits: 1,
    });
    expect(over.success).toBe(false);
  });

  it('defaults totalUnits to 1 if omitted and accepts empty description', () => {
    const data = {
      name: 'Economy Room',
      basePrice: 75000,
      capacity: 1,
      description: '',
    };
    const parsed = roomFormSchema.safeParse(data);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.totalUnits).toBe(1);
    }
  });
});
