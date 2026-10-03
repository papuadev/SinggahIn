import { describe, it, expect } from 'vitest';
import { midtransChargeSchema, midtransWebhookSchema } from '../midtrans.schema';

describe('Midtrans Schemas', () => {
  const validCuid = 'clh1234567890abcdefghijkl';

  describe('midtransChargeSchema', () => {
    it('accepts valid CUID bookingId', () => {
      const res = midtransChargeSchema.safeParse({ bookingId: validCuid });
      expect(res.success).toBe(true);
    });

    it('rejects invalid CUID bookingId', () => {
      const res = midtransChargeSchema.safeParse({ bookingId: 'invalid-id' });
      expect(res.success).toBe(false);
    });
  });

  describe('midtransWebhookSchema', () => {
    const validPayload = {
      order_id: 'SGH-20261010-ABCD',
      status_code: '200',
      gross_amount: '1000000.00',
      signature_key: 'abcdef1234567890',
      transaction_status: 'settlement',
    };

    it('accepts valid webhook payload', () => {
      const res = midtransWebhookSchema.safeParse(validPayload);
      expect(res.success).toBe(true);
    });

    it('rejects payload when required field is missing', () => {
      const { order_id, ...missingOrderId } = validPayload;
      const res = midtransWebhookSchema.safeParse(missingOrderId);
      expect(res.success).toBe(false);
    });
  });
});
