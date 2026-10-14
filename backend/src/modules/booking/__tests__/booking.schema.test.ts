import { describe, it, expect } from 'vitest';
import { PaymentMethod, BookingStatus } from '@prisma/client';
import {
  createBookingSchema,
  cancelBookingSchema,
  bookingIdParamSchema,
  listBookingsQuerySchema,
} from '../booking.schema';

describe('Booking Schemas', () => {
  const validCuid = 'clh1234567890abcdefghijkl';

  describe('createBookingSchema', () => {
    const validData = {
      roomId: validCuid,
      checkInDate: '2026-11-01',
      checkOutDate: '2026-11-03',
      guestCount: 2,
      paymentMethod: PaymentMethod.MANUAL_TRANSFER,
    };

    it('should validate valid create booking payload', () => {
      const result = createBookingSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should allow PAYMENT_GATEWAY payment method', () => {
      const result = createBookingSchema.safeParse({
        ...validData,
        paymentMethod: PaymentMethod.PAYMENT_GATEWAY,
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid CUID roomId', () => {
      const result = createBookingSchema.safeParse({
        ...validData,
        roomId: 'invalid-id-123',
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid date format', () => {
      const result = createBookingSchema.safeParse({
        ...validData,
        checkInDate: '01-11-2026',
      });
      expect(result.success).toBe(false);
    });

    it('should reject non-positive guest count', () => {
      const resultZero = createBookingSchema.safeParse({
        ...validData,
        guestCount: 0,
      });
      expect(resultZero.success).toBe(false);

      const resultNegative = createBookingSchema.safeParse({
        ...validData,
        guestCount: -1,
      });
      expect(resultNegative.success).toBe(false);
    });

    it('should reject invalid payment method', () => {
      const result = createBookingSchema.safeParse({
        ...validData,
        paymentMethod: 'BITCOIN',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('cancelBookingSchema', () => {
    it('should allow valid cancellation reason', () => {
      const result = cancelBookingSchema.safeParse({ reason: 'Ada perubahan rencana liburan' });
      expect(result.success).toBe(true);
    });

    it('should allow empty payload (reason is optional)', () => {
      const result = cancelBookingSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('should reject reason exceeding 255 characters', () => {
      const longReason = 'a'.repeat(256);
      const result = cancelBookingSchema.safeParse({ reason: longReason });
      expect(result.success).toBe(false);
    });
  });

  describe('bookingIdParamSchema', () => {
    it('should accept valid CUID', () => {
      const result = bookingIdParamSchema.safeParse({ id: validCuid });
      expect(result.success).toBe(true);
    });

    it('should reject non-CUID id', () => {
      const result = bookingIdParamSchema.safeParse({ id: '12345' });
      expect(result.success).toBe(false);
    });
  });

  describe('listBookingsQuerySchema', () => {
    it('should use default page=1 and limit=10 when not provided', () => {
      const result = listBookingsQuerySchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(10);
      }
    });

    it('should coerce string page and limit to numbers', () => {
      const result = listBookingsQuerySchema.safeParse({ page: '2', limit: '20' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(2);
        expect(result.data.limit).toBe(20);
      }
    });

    it('should reject limit greater than 50', () => {
      const result = listBookingsQuerySchema.safeParse({ limit: '100' });
      expect(result.success).toBe(false);
    });

    it('should accept valid booking status filter', () => {
      const result = listBookingsQuerySchema.safeParse({ status: BookingStatus.WAITING_PAYMENT });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe(BookingStatus.WAITING_PAYMENT);
      }
    });

    it('should reject invalid booking status filter', () => {
      const result = listBookingsQuerySchema.safeParse({ status: 'UNKNOWN_STATUS' });
      expect(result.success).toBe(false);
    });
  });
});
