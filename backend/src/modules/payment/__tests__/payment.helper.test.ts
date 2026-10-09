import { describe, it, expect } from 'vitest';
import { BookingStatus, PaymentMethod } from '@prisma/client';
import {
  calculateGraceExpiry,
  assertUploadEligibility,
  assertTenantActionEligibility,
  assertEmergencyCancelEligibility,
} from '../payment.helper';

describe('Payment Helper', () => {
  const futureExpiry = new Date(Date.now() + 3600000);
  const pastExpiry = new Date(Date.now() - 3600000);

  it('calculateGraceExpiry computes future timestamp with correct duration', () => {
    const before = Date.now() + 3600000;
    const expiry = calculateGraceExpiry(1);
    const after = Date.now() + 3600000;
    expect(expiry.getTime()).toBeGreaterThanOrEqual(before);
    expect(expiry.getTime()).toBeLessThanOrEqual(after + 100);
  });

  describe('assertUploadEligibility', () => {
    it('throws 404 if booking is null', () => {
      expect(() => assertUploadEligibility(null, 'u1')).toThrow('Pesanan tidak ditemukan.');
    });

    it('throws 403 if user is not booking owner', () => {
      expect(() => assertUploadEligibility({ userId: 'u2' }, 'u1')).toThrow('Anda tidak memiliki akses');
    });

    it('throws 400 if status is not WAITING_PAYMENT', () => {
      const b = { userId: 'u1', status: BookingStatus.PROCESSED };
      expect(() => assertUploadEligibility(b, 'u1')).toThrow('menunggu pembayaran');
    });

    it('throws 400 if booking has expired', () => {
      const b = { userId: 'u1', status: BookingStatus.WAITING_PAYMENT, expiresAt: pastExpiry };
      expect(() => assertUploadEligibility(b, 'u1')).toThrow('Batas waktu pembayaran');
    });

    it('throws 400 if payment method is not MANUAL_TRANSFER', () => {
      const b = {
        userId: 'u1', status: BookingStatus.WAITING_PAYMENT, expiresAt: futureExpiry,
        payment: { paymentMethod: PaymentMethod.PAYMENT_GATEWAY },
      };
      expect(() => assertUploadEligibility(b, 'u1')).toThrow('bukan transfer manual');
    });

    it('passes when booking is eligible for manual proof upload', () => {
      const b = {
        userId: 'u1', status: BookingStatus.WAITING_PAYMENT, expiresAt: futureExpiry,
        payment: { paymentMethod: PaymentMethod.MANUAL_TRANSFER },
      };
      expect(() => assertUploadEligibility(b, 'u1')).not.toThrow();
    });
  });

  describe('assertTenantActionEligibility', () => {
    it('throws 404 if booking is null', () => {
      expect(() => assertTenantActionEligibility(null, 't1')).toThrow('Pesanan tidak ditemukan.');
    });

    it('throws 403 if tenant does not own property', () => {
      expect(() => assertTenantActionEligibility({ property: { tenantId: 't2' } }, 't1')).toThrow('Anda tidak memiliki akses');
    });

    it('throws 400 if status is not WAITING_CONFIRMATION', () => {
      const b = { property: { tenantId: 't1' }, status: BookingStatus.WAITING_PAYMENT };
      expect(() => assertTenantActionEligibility(b, 't1')).toThrow('menunggu konfirmasi');
    });

    it('passes when booking is eligible for tenant approval/rejection', () => {
      const b = {
        property: { tenantId: 't1' }, status: BookingStatus.WAITING_CONFIRMATION,
        payment: { paymentMethod: PaymentMethod.MANUAL_TRANSFER },
      };
      expect(() => assertTenantActionEligibility(b, 't1')).not.toThrow();
    });
  });

  describe('assertEmergencyCancelEligibility', () => {
    it('throws 403 if tenant does not own property', () => {
      expect(() => assertEmergencyCancelEligibility({ property: { tenantId: 't2' } }, 't1')).toThrow('Anda tidak memiliki akses');
    });

    it('throws 400 if booking is already CANCELLED, COMPLETED, or REJECTED', () => {
      const bCancelled = { property: { tenantId: 't1' }, status: BookingStatus.CANCELLED };
      expect(() => assertEmergencyCancelEligibility(bCancelled, 't1')).toThrow('tidak dapat dibatalkan lagi');

      const bCompleted = { property: { tenantId: 't1' }, status: BookingStatus.COMPLETED };
      expect(() => assertEmergencyCancelEligibility(bCompleted, 't1')).toThrow('tidak dapat dibatalkan lagi');

      const bRejected = { property: { tenantId: 't1' }, status: BookingStatus.REJECTED };
      expect(() => assertEmergencyCancelEligibility(bRejected, 't1')).toThrow('tidak dapat dibatalkan lagi');
    });

    it('passes for WAITING_PAYMENT or WAITING_CONFIRMATION or PROCESSED', () => {
      const b = { property: { tenantId: 't1' }, status: BookingStatus.PROCESSED };
      expect(() => assertEmergencyCancelEligibility(b, 't1')).not.toThrow();
    });
  });
});
