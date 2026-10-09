import { describe, it, expect } from 'vitest';
import {
  bookingIdParamSchema,
  rejectPaymentSchema,
  emergencyCancelSchema,
  changePaymentMethodSchema,
} from '../payment.schema';


describe('Payment Schemas', () => {
  const validCuid = 'clh1234567890abcdefghijkl';

  describe('bookingIdParamSchema', () => {
    it('accepts valid CUID', () => {
      const res = bookingIdParamSchema.safeParse({ bookingId: validCuid });
      expect(res.success).toBe(true);
    });

    it('rejects invalid CUID', () => {
      const res = bookingIdParamSchema.safeParse({ bookingId: '123-abc' });
      expect(res.success).toBe(false);
    });
  });

  describe('rejectPaymentSchema', () => {
    it('accepts valid reason', () => {
      const res = rejectPaymentSchema.safeParse({ reason: 'Gambar buram tidak terbaca' });
      expect(res.success).toBe(true);
    });

    it('accepts empty payload when reason omitted', () => {
      const res = rejectPaymentSchema.safeParse({});
      expect(res.success).toBe(true);
    });

    it('rejects reason exceeding 255 characters', () => {
      const res = rejectPaymentSchema.safeParse({ reason: 'a'.repeat(256) });
      expect(res.success).toBe(false);
    });
  });

  describe('emergencyCancelSchema', () => {
    const validData = {
      cancellationReason: 'Pipa air kamar bocor parah tidak sempat diperbaiki',
      refundContact: '081234567890 (Pak Budi)',
    };

    it('accepts valid emergency cancellation payload', () => {
      const res = emergencyCancelSchema.safeParse(validData);
      expect(res.success).toBe(true);
    });

    it('accepts valid payload with explicit isForceMajeure true', () => {
      const res = emergencyCancelSchema.safeParse({ ...validData, isForceMajeure: true });
      expect(res.success).toBe(true);
      if (res.success) expect(res.data.isForceMajeure).toBe(true);
    });

    it('defaults isForceMajeure to false when omitted', () => {
      const res = emergencyCancelSchema.safeParse(validData);
      expect(res.success).toBe(true);
      if (res.success) expect(res.data.isForceMajeure).toBe(false);
    });

    it('accepts reason alias and maps to cancellationReason', () => {
      const res = emergencyCancelSchema.safeParse({
        reason: 'Pipa air kamar bocor parah tidak sempat diperbaiki',
        refundContact: '081234567890 (Pak Budi)',
      });
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.cancellationReason).toBe('Pipa air kamar bocor parah tidak sempat diperbaiki');
      }
    });

    it('rejects cancellation reason shorter than 5 characters', () => {
      const res = emergencyCancelSchema.safeParse({ ...validData, cancellationReason: 'Rus' });
      expect(res.success).toBe(false);
    });

    it('rejects refund contact shorter than 8 characters', () => {
      const res = emergencyCancelSchema.safeParse({ ...validData, refundContact: '123' });
      expect(res.success).toBe(false);
    });

    it('rejects missing required fields', () => {
      const res = emergencyCancelSchema.safeParse({});
      expect(res.success).toBe(false);
    });
  });

  describe('changePaymentMethodSchema', () => {
    it('accepts valid payment methods', () => {
      expect(changePaymentMethodSchema.safeParse({ paymentMethod: 'MANUAL_TRANSFER' }).success).toBe(true);
      expect(changePaymentMethodSchema.safeParse({ paymentMethod: 'PAYMENT_GATEWAY' }).success).toBe(true);
    });

    it('rejects invalid or missing payment method', () => {
      expect(changePaymentMethodSchema.safeParse({ paymentMethod: 'CRYPTO' }).success).toBe(false);
      expect(changePaymentMethodSchema.safeParse({}).success).toBe(false);
    });
  });
});

