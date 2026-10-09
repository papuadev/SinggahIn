import midtransClient from 'midtrans-client';
import { BookingStatus, PaymentMethod, PaymentStatus, Prisma } from '@prisma/client';
import { prisma } from '../../shared/services/prisma.service';
import { AppError } from '../../shared/utils/app-error';
import { sendBookingVoucherEmail } from '../../shared/services/mail.service';
import { MidtransWebhookPayload } from './midtrans.schema';
import {
  verifyMidtransSignature,
  parsePendingInfo,
  extractBaseBookingCode,
} from './midtrans.helper';

export { verifyMidtransSignature } from './midtrans.helper';

const serverKey = process.env.MIDTRANS_SERVER_KEY || 'SB-Mid-server-default';
const clientKey = process.env.MIDTRANS_CLIENT_KEY || 'SB-Mid-client-default';
const isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true';

export const snapClient = new midtransClient.Snap({ isProduction, serverKey, clientKey });

function validateChargeEligibility(b: any, userId: string): void {
  if (!b) throw AppError.notFound('Pesanan tidak ditemukan.');
  if (b.userId !== userId) throw AppError.forbidden('Anda tidak memiliki akses ke pesanan ini.');
  if (b.status !== BookingStatus.WAITING_PAYMENT) {
    throw AppError.badRequest('Hanya pesanan yang menunggu pembayaran yang dapat diproses.');
  }
  if (new Date() > b.expiresAt) throw AppError.badRequest('Batas waktu pembayaran pesanan telah berakhir.');
  if (b.payment?.paymentMethod !== PaymentMethod.PAYMENT_GATEWAY) {
    throw AppError.badRequest('Metode pembayaran pesanan ini bukan pembayaran otomatis.');
  }
}

async function requestSnapCharge(b: any, orderId?: string) {
  try {
    const res = await snapClient.createTransaction({
      transaction_details: { order_id: orderId || b.bookingCode, gross_amount: b.totalPrice },
      customer_details: { first_name: b.user.name || 'Tamu', email: b.user.email, phone: b.user.phoneNumber || undefined },
    });
    return { snapToken: res.token, redirectUrl: res.redirect_url };
  } catch (err: any) {
    const msg = err.ApiResponse?.error_messages?.[0] || err.message || '';
    if (serverKey.includes('your_server_key') || err.httpStatusCode === '401' || msg.includes('Unauthorized')) {
      throw AppError.badRequest('MIDTRANS_SERVER_KEY di backend/.env belum valid atau masih berupa placeholder.');
    }
    throw AppError.badRequest(`Gagal memproses pembayaran otomatis: ${msg}`);
  }
}

export const snapCache = new Map<string, { snapToken: string; redirectUrl: string }>();

function getExistingSnap(b: any) {
  if (snapCache.has(b.id)) return snapCache.get(b.id);
  if (b.payment?.proofPublicId && b.payment?.status === PaymentStatus.PENDING) {
    const snapBase = isProduction ? 'https://app.midtrans.com' : 'https://app.sandbox.midtrans.com';
    return {
      snapToken: b.payment.proofPublicId,
      redirectUrl: `${snapBase}/snap/v2/vtweb/${b.payment.proofPublicId}`,
    };
  }
  return null;
}

export async function createSnapTransaction(userId: string, bookingId: string) {
  const b = await prisma.booking.findUnique({ where: { id: bookingId }, include: { payment: true, user: true } });
  validateChargeEligibility(b, userId);
  const existing = getExistingSnap(b);
  if (existing) return existing;
  const orderId = b!.payment?.gatewayOrderId || b!.bookingCode;
  const result = await requestSnapCharge(b, orderId);
  snapCache.set(bookingId, result);
  await prisma.payment.update({
    where: { bookingId },
    data: { gatewayOrderId: orderId, proofPublicId: result.snapToken },
  });
  return result;
}

export async function resetSnapTransaction(userId: string, bookingId: string) {
  const b = await prisma.booking.findUnique({ where: { id: bookingId }, include: { payment: true, user: true } });
  validateChargeEligibility(b, userId);
  if (b!.payment?.gatewayOrderId) {
    try { await (snapClient as any).transaction.cancel(b!.payment.gatewayOrderId); } catch {}
  }
  snapCache.delete(bookingId);
  const nextOrderId = `${b!.bookingCode}_${Date.now().toString().slice(-4)}`;
  const result = await requestSnapCharge(b, nextOrderId);
  snapCache.set(bookingId, result);
  await prisma.payment.update({
    where: { bookingId },
    data: { gatewayOrderId: nextOrderId, proofPublicId: result.snapToken },
  });
  return result;
}

async function executePaidTx(tx: Prisma.TransactionClient, bookingId: string, txId?: string) {
  const now = new Date();
  return tx.booking.update({
    where: { id: bookingId }, data: { status: BookingStatus.PROCESSED },
    include: { payment: true },
  }).then(() => tx.payment.update({
    where: { bookingId }, data: { status: PaymentStatus.SETTLEMENT, paidAt: now, confirmedAt: now, gatewayTransactionId: txId },
  }));
}

async function executeCancelTx(tx: Prisma.TransactionClient, bookingId: string, txId: string | undefined, status: string) {
  const payStatus = status === 'expire' ? PaymentStatus.EXPIRED : PaymentStatus.CANCELLED;
  return tx.booking.update({
    where: { id: bookingId }, data: { status: BookingStatus.CANCELLED, cancellationReason: `Pembayaran ${status}` },
  }).then(() => tx.payment.update({
    where: { bookingId }, data: { status: payStatus, gatewayTransactionId: txId },
  }));
}

async function processPaidNotification(b: any, p: MidtransWebhookPayload) {
  if (b.status === BookingStatus.PROCESSED) return;
  await prisma.$transaction((tx) => executePaidTx(tx, b.id, p.transaction_id));
  await sendBookingVoucherEmail(b.user.email, {
    bookingCode: b.bookingCode, propertyName: b.property.title, roomName: b.room.name,
    checkInDate: b.checkInDate.toISOString().split('T')[0], checkOutDate: b.checkOutDate.toISOString().split('T')[0],
    totalGuests: b.guestCount, totalPrice: b.totalPrice,
  });
}

async function processCancelledNotification(b: any, p: MidtransWebhookPayload) {
  if (b.status === BookingStatus.CANCELLED) return;
  await prisma.$transaction((tx) => executeCancelTx(tx, b.id, p.transaction_id, p.transaction_status));
}

export async function handleMidtransWebhook(payload: MidtransWebhookPayload) {
  if (!verifyMidtransSignature(payload, serverKey)) throw AppError.unauthorized('Signature key tidak valid.');
  const baseCode = extractBaseBookingCode(payload.order_id);
  const b = await prisma.booking.findUnique({
    where: { bookingCode: baseCode },
    include: { payment: true, user: true, property: true, room: true },
  });
  if (!b) throw AppError.notFound('Pesanan tidak ditemukan.');
  const isPaid = payload.transaction_status === 'settlement' ||
    (payload.transaction_status === 'capture' && payload.fraud_status === 'accept');
  if (isPaid) await processPaidNotification(b, payload);
  else if (['deny', 'cancel', 'expire'].includes(payload.transaction_status)) {
    await processCancelledNotification(b, payload);
  }
  return { orderId: payload.order_id, status: payload.transaction_status };
}

async function checkAndApplyMidtransStatus(b: any, statusRes: any) {
  const isPaid = statusRes.transaction_status === 'settlement' ||
    (statusRes.transaction_status === 'capture' && statusRes.fraud_status === 'accept');
  if (isPaid) await processPaidNotification(b, statusRes);
  else if (['deny', 'cancel', 'expire'].includes(statusRes.transaction_status)) {
    await processCancelledNotification(b, statusRes);
  }
}

async function fetchMidtransStatusSafe(orderCode: string) {
  try {
    return await (snapClient as any).transaction.status(orderCode);
  } catch {
    return null;
  }
}

export async function syncMidtransTransactionStatus(bookingId: string) {
  const b = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { payment: true, user: true, property: true, room: true },
  });
  if (!b || b.status === BookingStatus.PROCESSED) return b;
  const targetOrderId = b.payment?.gatewayOrderId || b.bookingCode;
  const statusRes = await fetchMidtransStatusSafe(targetOrderId);
  if (statusRes) await checkAndApplyMidtransStatus(b, statusRes);
  const updated = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { payment: true, property: true, room: true },
  });
  const pending = parsePendingInfo(statusRes);
  return updated ? { ...updated, pendingPayment: pending } : null;
}
