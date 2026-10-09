import { BookingStatus, PaymentMethod } from '@prisma/client';
import { AppError } from '../../shared/utils/app-error';

export function calculateGraceExpiry(hours = 1): Date {
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}

export function assertUploadEligibility(booking: any, userId: string): void {
  if (!booking) throw AppError.notFound('Pesanan tidak ditemukan.');
  if (booking.userId !== userId) throw AppError.forbidden('Anda tidak memiliki akses ke pesanan ini.');
  const allowed = [BookingStatus.WAITING_PAYMENT, BookingStatus.WAITING_CONFIRMATION];
  if (!allowed.includes(booking.status)) {
    throw AppError.badRequest('Bukti transfer hanya dapat diunggah pada pesanan yang menunggu pembayaran.');
  }
  if (new Date() > booking.expiresAt) {
    throw AppError.badRequest('Batas waktu pembayaran pesanan ini telah berakhir.');
  }
  if (booking.payment?.paymentMethod !== PaymentMethod.MANUAL_TRANSFER) {
    throw AppError.badRequest('Metode pembayaran pesanan ini bukan transfer manual.');
  }
}

export function assertTenantActionEligibility(booking: any, tenantId: string): void {
  if (!booking) throw AppError.notFound('Pesanan tidak ditemukan.');
  if (booking.property?.tenantId !== tenantId) {
    throw AppError.forbidden('Anda tidak memiliki akses ke pesanan properti ini.');
  }
  if (booking.status !== BookingStatus.WAITING_CONFIRMATION) {
    throw AppError.badRequest('Hanya pesanan yang menunggu konfirmasi yang dapat diproses.');
  }
  if (booking.payment?.paymentMethod !== PaymentMethod.MANUAL_TRANSFER) {
    throw AppError.badRequest('Metode pembayaran pesanan ini bukan transfer manual.');
  }
}

export function assertEmergencyCancelEligibility(booking: any, tenantId: string): void {
  if (!booking) throw AppError.notFound('Pesanan tidak ditemukan.');
  if (booking.property?.tenantId !== tenantId) {
    throw AppError.forbidden('Anda tidak memiliki akses ke pesanan properti ini.');
  }
  const terminalStatuses = [BookingStatus.CANCELLED, BookingStatus.COMPLETED, BookingStatus.REJECTED];
  if (terminalStatuses.includes(booking.status)) {
    throw AppError.badRequest('Pesanan yang sudah dibatalkan atau selesai tidak dapat dibatalkan lagi.');
  }
}
