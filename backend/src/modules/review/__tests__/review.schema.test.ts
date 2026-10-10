import { describe, it, expect } from 'vitest';
import { createReviewSchema, propertyReviewQuerySchema } from '../review.schema';

describe('Review Schemas', () => {
  describe('createReviewSchema', () => {
    it('accepts valid review payload', () => {
      const res = createReviewSchema.safeParse({
        bookingId: 'cjld2cjxh0000qzrmn831i7rn',
        rating: 5,
        comment: 'Penginapan sangat bersih dan nyaman!',
      });
      expect(res.success).toBe(true);
    });

    it('rejects rating below 1 or above 5', () => {
      const resLow = createReviewSchema.safeParse({
        bookingId: 'cjld2cjxh0000qzrmn831i7rn', rating: 0, comment: 'Bagus sekali',
      });
      const resHigh = createReviewSchema.safeParse({
        bookingId: 'cjld2cjxh0000qzrmn831i7rn', rating: 6, comment: 'Bagus sekali',
      });
      expect(resLow.success).toBe(false);
      expect(resHigh.success).toBe(false);
    });

    it('rejects non-integer rating', () => {
      const res = createReviewSchema.safeParse({
        bookingId: 'cjld2cjxh0000qzrmn831i7rn', rating: 4.5, comment: 'Bagus sekali',
      });
      expect(res.success).toBe(false);
    });

    it('rejects comment shorter than 5 characters', () => {
      const res = createReviewSchema.safeParse({
        bookingId: 'cjld2cjxh0000qzrmn831i7rn', rating: 4, comment: 'Oke',
      });
      expect(res.success).toBe(false);
    });

    it('rejects non-cuid bookingId', () => {
      const res = createReviewSchema.safeParse({
        bookingId: 'invalid-id-123', rating: 4, comment: 'Kamar nyaman dan luas',
      });
      expect(res.success).toBe(false);
    });
  });

  describe('propertyReviewQuerySchema', () => {
    it('accepts valid page and limit and sets defaults', () => {
      const resDefault = propertyReviewQuerySchema.safeParse({});
      expect(resDefault.success).toBe(true);
      if (resDefault.success) {
        expect(resDefault.data.page).toBe(1);
        expect(resDefault.data.limit).toBe(10);
      }
      const resCustom = propertyReviewQuerySchema.safeParse({ page: '2', limit: '20' });
      expect(resCustom.success).toBe(true);
      if (resCustom.success) {
        expect(resCustom.data.page).toBe(2);
        expect(resCustom.data.limit).toBe(20);
      }
    });
  });
});
