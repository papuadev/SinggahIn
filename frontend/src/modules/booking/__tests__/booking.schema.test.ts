import { describe, it, expect } from 'vitest';
import { checkoutFormSchema, cancelBookingSchema } from '../schemas/booking.schema';

describe('Booking Schemas', () => {
  describe('checkoutFormSchema', () => {
    it('accepts valid checkout payload', () => {
      const data = {
        roomId: 'clhroom123',
        checkInDate: '2026-10-15',
        checkOutDate: '2026-10-18',
        guestCount: 2,
        paymentMethod: 'MANUAL_TRANSFER',
      };
      const res = checkoutFormSchema.safeParse(data);
      expect(res.success).toBe(true);
    });

    it('rejects when check-out date is not after check-in', () => {
      const data = {
        roomId: 'clhroom123',
        checkInDate: '2026-10-15',
        checkOutDate: '2026-10-15',
        guestCount: 2,
        paymentMethod: 'MANUAL_TRANSFER',
      };
      const res = checkoutFormSchema.safeParse(data);
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.issues[0].message).toContain('setelah tanggal check-in');
      }
    });

    it('rejects when guestCount is less than 1', () => {
      const data = {
        roomId: 'clhroom123',
        checkInDate: '2026-10-15',
        checkOutDate: '2026-10-18',
        guestCount: 0,
        paymentMethod: 'PAYMENT_GATEWAY',
      };
      const res = checkoutFormSchema.safeParse(data);
      expect(res.success).toBe(false);
    });
  });

  describe('cancelBookingSchema', () => {
    it('accepts valid cancellation reason', () => {
      const res = cancelBookingSchema.safeParse({ reason: 'Ada keperluan mendadak' });
      expect(res.success).toBe(true);
    });

    it('rejects reason shorter than 3 characters', () => {
      const res = cancelBookingSchema.safeParse({ reason: 'no' });
      expect(res.success).toBe(false);
    });
  });
});
