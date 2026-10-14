import { describe, it, expect } from 'vitest';
import {
  CreatePropertySchema,
  UpdatePropertySchema,
  PropertyIdParamSchema,
  ReverseGeocodeQuerySchema,
} from '../property.schema';

describe('Property Schema Validation', () => {
  const validCuid = 'clh9y5x0u0000abcde1234567';

  describe('CreatePropertySchema', () => {
    const validData = {
      title: 'Villa Asri Lembang',
      categoryId: validCuid,
      description: 'Villa indah di kawasan sejuk Lembang Bandung.',
      address: 'Jl. Kolonel Masturi No. 88',
      city: 'Bandung',
      latitude: -6.815,
      longitude: 107.618,
    };

    it('passes on valid property creation data', () => {
      const result = CreatePropertySchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('fails when title is shorter than 3 characters', () => {
      const result = CreatePropertySchema.safeParse({
        ...validData,
        title: 'AB',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('minimal 3 karakter');
      }
    });

    it('fails when categoryId is not a valid CUID', () => {
      const result = CreatePropertySchema.safeParse({
        ...validData,
        categoryId: 'not-a-cuid',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Format ID kategori tidak valid');
      }
    });

    it('fails when latitude is out of bounds', () => {
      const result = CreatePropertySchema.safeParse({
        ...validData,
        latitude: 100,
      });
      expect(result.success).toBe(false);
    });
  });

  describe('UpdatePropertySchema', () => {
    it('passes when at least one field is updated', () => {
      const result = UpdatePropertySchema.safeParse({ title: 'Villa Baru' });
      expect(result.success).toBe(true);
    });

    it('fails when empty object is submitted', () => {
      const result = UpdatePropertySchema.safeParse({});
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Minimal satu field harus diisi');
      }
    });
  });

  describe('PropertyIdParamSchema', () => {
    it('passes for valid CUID', () => {
      const result = PropertyIdParamSchema.safeParse({ id: validCuid });
      expect(result.success).toBe(true);
    });

    it('fails for non-CUID id string', () => {
      const result = PropertyIdParamSchema.safeParse({ id: '123' });
      expect(result.success).toBe(false);
    });
  });

  describe('ReverseGeocodeQuerySchema', () => {
    it('coerces string numbers correctly', () => {
      const result = ReverseGeocodeQuerySchema.safeParse({
        latitude: '-6.921',
        longitude: '107.607',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.latitude).toBe(-6.921);
        expect(result.data.longitude).toBe(107.607);
      }
    });

    it('fails on non-numeric strings', () => {
      const result = ReverseGeocodeQuerySchema.safeParse({
        latitude: 'abc',
        longitude: 'xyz',
      });
      expect(result.success).toBe(false);
    });
  });
});
