import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BookingStatus, PaymentMethod, PaymentStatus } from '@prisma/client';
import { prisma } from '../../../shared/services/prisma.service';
import * as cloudinaryService from '../../../shared/services/cloudinary.service';
import * as mailService from '../../../shared/services/mail.service';
import {
  uploadPaymentProof,
  approvePaymentProof,
  rejectPaymentProof,
  emergencyCancelBooking,
  changePaymentMethod,
} from '../payment.service';


vi.mock('../../../shared/services/prisma.service', () => ({
  prisma: {
    $transaction: vi.fn(),
    booking: { findUnique: vi.fn(), update: vi.fn() },
  },
}));

vi.mock('../../../shared/services/cloudinary.service', () => ({
  uploadToCloudinary: vi.fn(),
  deleteFromCloudinary: vi.fn(),
}));

vi.mock('../../../shared/services/mail.service', () => ({
  sendBookingVoucherEmail: vi.fn(),
  sendEmergencyCancellationEmail: vi.fn(),
}));

describe('Payment Service', () => {
  const userId = 'usr-123';
  const tenantId = 'tnt-123';
  const bookingId = 'bk-123';
  const dummyFile = { buffer: Buffer.from('fake-image') } as Express.Multer.File;

  beforeEach(() => { vi.clearAllMocks(); });

  describe('uploadPaymentProof', () => {
    function setupUploadMock(opts: { oldPublicId?: string } = {}) {
      const b = {
        id: bookingId, userId, bookingCode: 'SGH-20261010-ABCD', status: BookingStatus.WAITING_PAYMENT,
        expiresAt: new Date(Date.now() + 3600000), payment: { paymentMethod: PaymentMethod.MANUAL_TRANSFER, proofPublicId: opts.oldPublicId },
      };
      vi.mocked(prisma.booking.findUnique).mockResolvedValueOnce(b as any);
      vi.mocked(cloudinaryService.uploadToCloudinary).mockResolvedValueOnce({ secureUrl: 'https://cdn/p1.webp', publicId: 'p1' });
      const txMock = {
        booking: { update: vi.fn().mockResolvedValue({ ...b, status: BookingStatus.WAITING_CONFIRMATION, payment: { status: PaymentStatus.WAITING_APPROVAL, proofImageUrl: 'https://cdn/p1.webp' } }) },
      };
      vi.mocked(prisma.$transaction).mockImplementation(async (cb: any) => cb(txMock));
      return { txMock, b };
    }

    it('uploads proof, removes old publicId if present, and updates status to WAITING_CONFIRMATION', async () => {
      const { txMock } = setupUploadMock({ oldPublicId: 'old-p0' });
      const result = await uploadPaymentProof(userId, bookingId, dummyFile);

      expect(cloudinaryService.uploadToCloudinary).toHaveBeenCalledWith(dummyFile.buffer, 'singgahin/payments');
      expect(cloudinaryService.deleteFromCloudinary).toHaveBeenCalledWith('old-p0');
      expect(txMock.booking.update).toHaveBeenCalled();
      expect(result.bookingStatus).toBe(BookingStatus.WAITING_CONFIRMATION);
      expect(result.paymentStatus).toBe(PaymentStatus.WAITING_APPROVAL);
      expect(result.proofImageUrl).toBe('https://cdn/p1.webp');
    });

    it('rejects upload if booking has already expired', async () => {
      const expiredBooking = {
        id: bookingId, userId, status: BookingStatus.WAITING_PAYMENT,
        expiresAt: new Date(Date.now() - 1000), payment: { paymentMethod: PaymentMethod.MANUAL_TRANSFER },
      };
      vi.mocked(prisma.booking.findUnique).mockResolvedValueOnce(expiredBooking as any);
      await expect(uploadPaymentProof(userId, bookingId, dummyFile)).rejects.toThrow('Batas waktu pembayaran');
    });
  });

  describe('approvePaymentProof', () => {
    function setupApproveMock() {
      const b = {
        id: bookingId, bookingCode: 'SGH-20261010-ABCD', status: BookingStatus.WAITING_CONFIRMATION,
        totalPrice: 1000000, guestCount: 2, checkInDate: new Date('2026-10-10'), checkOutDate: new Date('2026-10-12'),
        property: { tenantId, title: 'Villa Lembang' }, room: { name: 'Deluxe' },
        user: { email: 'guest@example.com' }, payment: { paymentMethod: PaymentMethod.MANUAL_TRANSFER },
      };
      vi.mocked(prisma.booking.findUnique).mockResolvedValueOnce(b as any);
      const txMock = {
        booking: { update: vi.fn().mockResolvedValue({ ...b, status: BookingStatus.PROCESSED, payment: { status: PaymentStatus.SETTLEMENT } }) },
      };
      vi.mocked(prisma.$transaction).mockImplementation(async (cb: any) => cb(txMock));
      return { txMock, b };
    }

    it('approves payment, updates to PROCESSED, and sends voucher email', async () => {
      setupApproveMock();
      const result = await approvePaymentProof(tenantId, bookingId);

      expect(result.bookingStatus).toBe(BookingStatus.PROCESSED);
      expect(result.paymentStatus).toBe(PaymentStatus.SETTLEMENT);
      expect(mailService.sendBookingVoucherEmail).toHaveBeenCalledWith(
        'guest@example.com',
        expect.objectContaining({ bookingCode: 'SGH-20261010-ABCD', propertyName: 'Villa Lembang' })
      );
    });
  });

  describe('rejectPaymentProof (Tenant Payment Rejection)', () => {
    function setupRejectMock() {
      const b = {
        id: bookingId, bookingCode: 'SGH-20261010-ABCD', status: BookingStatus.WAITING_CONFIRMATION,
        property: { tenantId }, payment: { paymentMethod: PaymentMethod.MANUAL_TRANSFER },
      };
      vi.mocked(prisma.booking.findUnique).mockResolvedValueOnce(b as any);
      const txMock = {
        booking: { update: vi.fn().mockImplementation(({ data }) => Promise.resolve({
          ...b, status: data.status, cancellationReason: data.cancellationReason, payment: { status: PaymentStatus.REJECTED },
        })) },
      };
      vi.mocked(prisma.$transaction).mockImplementation(async (cb: any) => cb(txMock));
      return { txMock, b };
    }

    it('sets booking status and payment status to REJECTED', async () => {
      setupRejectMock();
      const res = await rejectPaymentProof(tenantId, bookingId, { reason: 'Bukti transfer buram' });

      expect(res.bookingStatus).toBe(BookingStatus.REJECTED);
      expect(res.paymentStatus).toBe(PaymentStatus.REJECTED);
      expect(res.cancellationReason).toBe('Bukti transfer buram');
    });
  });

  describe('emergencyCancelBooking', () => {
    function setupEmergencyMock() {
      const b = {
        id: bookingId, bookingCode: 'SGH-20261010-ABCD', status: BookingStatus.PROCESSED,
        property: { tenantId, title: 'Villa Lembang' }, user: { email: 'guest@example.com' },
      };
      vi.mocked(prisma.booking.findUnique).mockResolvedValueOnce(b as any);
      const txMock = {
        booking: { update: vi.fn().mockImplementation(({ data }) => Promise.resolve({
          ...b, status: BookingStatus.CANCELLED, isForceMajeure: data.isForceMajeure, payment: { status: PaymentStatus.CANCELLED },
        })) },
      };
      vi.mocked(prisma.$transaction).mockImplementation(async (cb: any) => cb(txMock));
    }

    it('cancels booking with reason and refund contact, notifying user via email', async () => {
      setupEmergencyMock();
      const input = { cancellationReason: 'Bencana banjir lokal', refundContact: '081234567890 (Ibu Maya)' };
      const res = await emergencyCancelBooking(tenantId, bookingId, input);

      expect(res.bookingStatus).toBe(BookingStatus.CANCELLED);
      expect(res.isForceMajeure).toBe(false);
      expect(mailService.sendEmergencyCancellationEmail).toHaveBeenCalledWith('guest@example.com', expect.objectContaining(input));
    });

    it('cancels booking and marks transaction as force majeure when isForceMajeure is true', async () => {
      setupEmergencyMock();
      const input = { cancellationReason: 'Bencana gempa bumi', refundContact: '081234567890', isForceMajeure: true };
      const res = await emergencyCancelBooking(tenantId, bookingId, input);

      expect(res.bookingStatus).toBe(BookingStatus.CANCELLED);
      expect(res.isForceMajeure).toBe(true);
      expect(mailService.sendEmergencyCancellationEmail).toHaveBeenCalledWith('guest@example.com', expect.objectContaining({ isForceMajeure: true }));
    });
  });

  describe('changePaymentMethod', () => {
    it('successfully changes payment method and clears gateway/proof data', async () => {
      const b = {
        id: bookingId, userId, bookingCode: 'SGH-20261010-ABCD', status: BookingStatus.WAITING_PAYMENT,
        expiresAt: new Date(Date.now() + 3600000), payment: { paymentMethod: PaymentMethod.MANUAL_TRANSFER },
      };
      vi.mocked(prisma.booking.findUnique).mockResolvedValueOnce(b as any);
      const txMock = {
        booking: { update: vi.fn().mockResolvedValue({ ...b, payment: { paymentMethod: PaymentMethod.PAYMENT_GATEWAY, status: PaymentStatus.PENDING } }) },
      };
      vi.mocked(prisma.$transaction).mockImplementation(async (cb: any) => cb(txMock));
      const res = await changePaymentMethod(userId, bookingId, PaymentMethod.PAYMENT_GATEWAY);
      expect(txMock.booking.update).toHaveBeenCalled();
      expect(res.paymentMethod).toBe(PaymentMethod.PAYMENT_GATEWAY);
    });
  });
});

