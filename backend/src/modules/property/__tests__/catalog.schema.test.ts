import { describe, it, expect } from 'vitest';
import { CatalogQuerySchema } from '../catalog.schema';

describe('CatalogQuerySchema', () => {
  it('applies standard default values when query is empty', () => {
    const parsed = CatalogQuerySchema.parse({});
    expect(parsed.page).toBe(1);
    expect(parsed.limit).toBe(10);
    expect(parsed.sortBy).toBe('price');
    expect(parsed.sortOrder).toBe('asc');
    expect(parsed.city).toBeUndefined();
    expect(parsed.name).toBeUndefined();
    expect(parsed.category).toBeUndefined();
  });

  it('normalizes empty strings and trims inputs to undefined', () => {
    const parsed = CatalogQuerySchema.parse({
      city: '   ',
      name: '',
      category: '  ',
      checkIn: '',
      checkOut: '',
    });
    expect(parsed.city).toBeUndefined();
    expect(parsed.name).toBeUndefined();
    expect(parsed.category).toBeUndefined();
    expect(parsed.checkIn).toBeUndefined();
    expect(parsed.checkOut).toBeUndefined();
  });

  it('lowercases category slug properly', () => {
    const parsed = CatalogQuerySchema.parse({ category: 'VILLA' });
    expect(parsed.category).toBe('villa');
  });

  it('validates matching checkIn and checkOut dates', () => {
    const parsed = CatalogQuerySchema.parse({
      checkIn: '2026-10-01',
      checkOut: '2026-10-05',
    });
    expect(parsed.checkIn).toBe('2026-10-01');
    expect(parsed.checkOut).toBe('2026-10-05');
  });

  it('rejects when only checkIn is provided', () => {
    const result = CatalogQuerySchema.safeParse({ checkIn: '2026-10-01' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('diisi bersamaan');
    }
  });

  it('rejects when only checkOut is provided', () => {
    const result = CatalogQuerySchema.safeParse({ checkOut: '2026-10-05' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('diisi bersamaan');
    }
  });

  it('rejects when checkOut is before or equal to checkIn', () => {
    const same = CatalogQuerySchema.safeParse({
      checkIn: '2026-10-05',
      checkOut: '2026-10-05',
    });
    expect(same.success).toBe(false);
    const before = CatalogQuerySchema.safeParse({
      checkIn: '2026-10-05',
      checkOut: '2026-10-04',
    });
    expect(before.success).toBe(false);
  });

  it('rejects invalid date formats', () => {
    const result = CatalogQuerySchema.safeParse({
      checkIn: '01-10-2026',
      checkOut: '05-10-2026',
    });
    expect(result.success).toBe(false);
  });

  it('coerces and validates positive guest counts', () => {
    const parsed = CatalogQuerySchema.parse({ guests: '4' });
    expect(parsed.guests).toBe(4);
    const invalid = CatalogQuerySchema.safeParse({ guests: '0' });
    expect(invalid.success).toBe(false);
  });

  it('validates limit bounds between 1 and 50', () => {
    const valid = CatalogQuerySchema.parse({ limit: '50' });
    expect(valid.limit).toBe(50);
    const over = CatalogQuerySchema.safeParse({ limit: '51' });
    expect(over.success).toBe(false);
  });
});
