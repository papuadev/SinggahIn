import crypto from 'crypto';
import midtransClient from 'midtrans-client';
import { BookingStatus, PaymentMethod, PaymentStatus, Prisma } from '@prisma/client';
import { prisma } from '../../shared/services/prisma.service';
import { AppError } from '../../shared/utils/app-error';
import { sendBookingVoucherEmail } from '../../shared/services/mail.service';
import { MidtransWebhookPayload } from './midtrans.schema';

const serverKey = process.env.MIDTRANS_SERVER_KEY || 'SB-Mid-server-default';
const clientKey = process.env.MIDTRANS_CLIENT_KEY || 'SB-Mid-client-default';
const isProduction = process.env.NODE_ENV === 'production';

export const snapClient = new midtransClient.Snap({ isProduction, serverKey, clientKey });

function validateChargeEligibility(b: any, userId: string): void {
  if (!b) throw AppError.notFound('Pesanan tidak ditemukan.');
  if (b.userId !== userId) throw AppError.forbidden('Anda tidak memiliki akses ke pesanan ini.');
  if (b.status !== BookingStatus.WAITING_PAYMENT) {
    throw AppError.badRequest('Hanya pesanan yang menunggu pembayaran yang dapat diproses.');
  }
  if (new Date() > b.expiresAt) throw AppError.badRequest('Batas waktu pembayaran pesanan telah berakhir.');
  if (b.payment?.paymentMethod !== PaymentMethod.PAYMENT_GATEWAY) {
    throw AppError.badRequest('Metode pembayaran pesanan ini bukan payment gateway.');
  }
}

export async function createSnapTransaction(userId: string, bookingId: string) {
  const b = await prisma.booking.findUnique({ where: { id: bookingId }, include: { payment: true, user: true } });
  validateChargeEligibility(b, userId);
  const res = await snapClient.createTransaction({
    transaction_details: { order_id: b!.bookingCode, gross_amount: b!.totalPrice },
    customer_details: { first_name: b!.user.name || 'Tamu', email: b!.user.email, phone: b!.user.phoneNumber || undefined },
  });
  await prisma.payment.update({ where: { bookingId }, data: { gatewayOrderId: b!.bookingCode } });
  return { snapToken: res.token, redirectUrl: res.redirect_url };
}

function timingSafeMatch(expected: string, actual?: string): boolean {
  if (!actual) return false;
  const expectedBuf = Buffer.from(expected, 'utf8');
  const actualBuf = Buffer.from(actual, 'utf8');
  if (expectedBuf.length !== actualBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, actualBuf);
}

export function verifyMidtransSignature(payload: MidtransWebhookPayload): boolean {
  const currentKey = process.env.MIDTRANS_SERVER_KEY || serverKey;
  const raw = `${payload.order_id}${payload.status_code}${payload.gross_amount}${currentKey}`;
  const hash = crypto.createHash('sha512').update(raw).digest('hex');
  return timingSafeMatch(hash, payload.signature_key);
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
    where: { id: bookingId }, data: { status: BookingStatus.CANCELLED, cancellationReason: `Midtrans ${status}` },
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
  if (!verifyMidtransSignature(payload)) throw AppError.unauthorized('Signature key Midtrans tidak valid.');
  const b = await prisma.booking.findUnique({
    where: { bookingCode: payload.order_id },
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
