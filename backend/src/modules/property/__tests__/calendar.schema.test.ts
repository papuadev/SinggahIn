import { describe, it, expect } from 'vitest';
import { CalendarQuerySchema } from '../calendar.schema';

describe('CalendarQuerySchema', () => {
  it('defaults month and year to current UTC month and year', () => {
    const parsed = CalendarQuerySchema.parse({});
    const now = new Date();
    expect(parsed.month).toBe(now.getUTCMonth() + 1);
    expect(parsed.year).toBe(now.getUTCFullYear());
    expect(parsed.roomId).toBeUndefined();
  });

  it('accepts valid explicit month, year, and roomId', () => {
    const validCuid = 'clhroom123456789012345678';
    const parsed = CalendarQuerySchema.parse({
      month: '10',
      year: '2026',
      roomId: validCuid,
    });
    expect(parsed.month).toBe(10);
    expect(parsed.year).toBe(2026);
    expect(parsed.roomId).toBe(validCuid);
  });

  it('rejects month outside 1 to 12 range', () => {
    const zero = CalendarQuerySchema.safeParse({ month: 0 });
    expect(zero.success).toBe(false);
    const thirteen = CalendarQuerySchema.safeParse({ month: 13 });
    expect(thirteen.success).toBe(false);
  });

  it('rejects year outside 2020 to 2100 range', () => {
    const past = CalendarQuerySchema.safeParse({ year: 2019 });
    expect(past.success).toBe(false);
    const future = CalendarQuerySchema.safeParse({ year: 2101 });
    expect(future.success).toBe(false);
  });

  it('rejects invalid roomId format', () => {
    const result = CalendarQuerySchema.safeParse({ roomId: 'invalid-id' });
    expect(result.success).toBe(false);
  });
});
