import { describe, it, expect } from 'vitest';
import { propertyFormSchema } from '../schemas/property.schema';

describe('Property Form Zod Schema Tests', () => {
  const validData = {
    title: 'Villa Nuansa Asri',
    categoryId: 'cuid-cat-12345',
    description: 'Villa modern yang nyaman dengan pemandangan pegunungan.',
    city: 'Bandung',
    address: 'Jl. Raya Lembang No. 123',
    latitude: -6.8152,
    longitude: 107.6234,
  };

  it('should validate complete and correct property data', () => {
    const result = propertyFormSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should coerce string coordinates to valid numbers', () => {
    const dataWithStrings = {
      ...validData,
      latitude: '-6.8152',
      longitude: '107.6234',
    };
    const result = propertyFormSchema.safeParse(dataWithStrings);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.latitude).toBe(-6.8152);
      expect(result.data.longitude).toBe(107.6234);
    }
  });

  it('should reject title with less than 3 characters', () => {
    const result = propertyFormSchema.safeParse({ ...validData, title: 'Vi' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Nama properti minimal 3 karakter');
    }
  });

  it('should reject empty categoryId', () => {
    const result = propertyFormSchema.safeParse({ ...validData, categoryId: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Kategori properti wajib dipilih');
    }
  });

  it('should reject description with less than 10 characters', () => {
    const result = propertyFormSchema.safeParse({ ...validData, description: 'Bagus' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Deskripsi properti minimal 10 karakter');
    }
  });

  it('should reject city with less than 2 characters', () => {
    const result = propertyFormSchema.safeParse({ ...validData, city: 'B' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Nama kota minimal 2 karakter');
    }
  });

  it('should reject address with less than 5 characters', () => {
    const result = propertyFormSchema.safeParse({ ...validData, address: 'Jl.' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Alamat properti minimal 5 karakter');
    }
  });

  it('should reject latitude outside -90 to 90 range', () => {
    const result = propertyFormSchema.safeParse({ ...validData, latitude: -95 });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Latitude harus di antara -90 dan 90');
    }
  });

  it('should reject longitude outside -180 to 180 range', () => {
    const result = propertyFormSchema.safeParse({ ...validData, longitude: 195 });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Longitude harus di antara -180 dan 180');
    }
  });
});
