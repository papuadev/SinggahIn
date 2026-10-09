import { BookingStatus, PaymentStatus, Prisma } from '@prisma/client';
import { prisma } from '../../shared/services/prisma.service';
import { uploadToCloudinary, deleteFromCloudinary, UploadResult } from '../../shared/services/cloudinary.service';
import { sendBookingVoucherEmail, sendEmergencyCancellationEmail } from '../../shared/services/mail.service';
import {
  assertUploadEligibility,
  assertTenantActionEligibility,
  assertEmergencyCancelEligibility,
} from './payment.helper';
import { RejectPaymentInput, EmergencyCancelInput, PaymentActionResponse } from './payment.types';

async function findBookingForUpload(bookingId: string) {
  return prisma.booking.findUnique({ where: { id: bookingId }, include: { payment: true } });
}

async function findBookingForTenant(bookingId: string) {
  return prisma.booking.findUnique({
    where: { id: bookingId },
    include: { property: true, room: true, payment: true, user: true },
  });
}

function mapActionResponse(b: any): PaymentActionResponse {
  return {
    bookingId: b.id, bookingCode: b.bookingCode, bookingStatus: b.status,
    paymentStatus: b.payment?.status, expiresAt: b.expiresAt?.toISOString(),
    proofImageUrl: b.payment?.proofImageUrl, cancellationReason: b.cancellationReason ?? undefined,
    refundContact: b.refundContact ?? undefined, isForceMajeure: b.isForceMajeure ?? false,
  };
}

async function executeProofUploadTx(tx: Prisma.TransactionClient, bookingId: string, res: UploadResult) {
  return tx.booking.update({
    where: { id: bookingId },
    data: {
      status: BookingStatus.WAITING_CONFIRMATION,
      payment: {
        update: { status: PaymentStatus.WAITING_APPROVAL, proofImageUrl: res.secureUrl, proofPublicId: res.publicId },
      },
    },
    include: { payment: true },
  });
}

export async function uploadPaymentProof(userId: string, bookingId: string, file: Express.Multer.File): Promise<PaymentActionResponse> {
  const b = await findBookingForUpload(bookingId);
  assertUploadEligibility(b, userId);
  const up = await uploadToCloudinary(file.buffer, 'singgahin/payments');
  if (b!.payment?.proofPublicId) await deleteFromCloudinary(b!.payment.proofPublicId);
  const updated = await prisma.$transaction((tx) => executeProofUploadTx(tx, bookingId, up));
  return mapActionResponse(updated);
}

async function executeApproveTx(tx: Prisma.TransactionClient, bookingId: string) {
  const now = new Date();
  return tx.booking.update({
    where: { id: bookingId },
    data: {
      status: BookingStatus.PROCESSED,
      payment: { update: { status: PaymentStatus.SETTLEMENT, paidAt: now, confirmedAt: now } },
    },
    include: { payment: true },
  });
}

export async function approvePaymentProof(tenantId: string, bookingId: string): Promise<PaymentActionResponse> {
  const b = await findBookingForTenant(bookingId);
  assertTenantActionEligibility(b, tenantId);
  const updated = await prisma.$transaction((tx) => executeApproveTx(tx, bookingId));
  await sendBookingVoucherEmail(b!.user.email, {
    bookingCode: b!.bookingCode, propertyName: b!.property.title, roomName: b!.room.name,
    checkInDate: b!.checkInDate.toISOString().split('T')[0], checkOutDate: b!.checkOutDate.toISOString().split('T')[0],
    totalGuests: b!.guestCount, totalPrice: b!.totalPrice,
  });
  return mapActionResponse(updated);
}

async function executeRejectTx(tx: Prisma.TransactionClient, bookingId: string, reason?: string) {
  return tx.booking.update({
    where: { id: bookingId },
    data: {
      status: BookingStatus.REJECTED,
      cancellationReason: reason || 'Bukti transfer ditolak oleh tenant',
      payment: { update: { status: PaymentStatus.REJECTED } },
    },
    include: { payment: true },
  });
}

export async function rejectPaymentProof(tenantId: string, bookingId: string, input?: RejectPaymentInput): Promise<PaymentActionResponse> {
  const b = await findBookingForTenant(bookingId);
  assertTenantActionEligibility(b, tenantId);
  const updated = await prisma.$transaction((tx) => executeRejectTx(tx, bookingId, input?.reason));
  return mapActionResponse(updated);
}

async function executeEmergencyCancelTx(tx: Prisma.TransactionClient, bookingId: string, input: EmergencyCancelInput) {
  return tx.booking.update({
    where: { id: bookingId },
    data: {
      status: BookingStatus.CANCELLED,
      cancellationReason: input.cancellationReason, refundContact: input.refundContact,
      isForceMajeure: Boolean(input.isForceMajeure),
      payment: { update: { status: PaymentStatus.CANCELLED } },
    },
    include: { payment: true },
  });
}

export async function emergencyCancelBooking(tenantId: string, bookingId: string, input: EmergencyCancelInput): Promise<PaymentActionResponse> {
  const b = await findBookingForTenant(bookingId);
  assertEmergencyCancelEligibility(b, tenantId);
  const updated = await prisma.$transaction((tx) => executeEmergencyCancelTx(tx, bookingId, input));
  try {
    await sendEmergencyCancellationEmail(b!.user.email, {
      bookingCode: b!.bookingCode, propertyName: b!.property.title,
      cancellationReason: input.cancellationReason, refundContact: input.refundContact,
      isForceMajeure: input.isForceMajeure,
    });
  } catch (_e) {}
  return mapActionResponse(updated);
}
