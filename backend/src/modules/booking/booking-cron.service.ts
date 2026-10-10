import cron from 'node-cron';
import { BookingStatus, PaymentStatus, Prisma } from '@prisma/client';
import { prisma } from '../../shared/services/prisma.service';

async function expireSingleBooking(tx: Prisma.TransactionClient, bookingId: string) {
  return tx.booking.update({
    where: { id: bookingId },
    data: {
      status: BookingStatus.CANCELLED,
      cancellationReason: 'Batas waktu pembayaran telah berakhir (Sistem Otomatis)',
      payment: { update: { status: PaymentStatus.EXPIRED } },
    },
  });
}

export async function cancelExpiredBookings(now = new Date()) {
  const expired = await prisma.booking.findMany({
    where: { status: BookingStatus.WAITING_PAYMENT, expiresAt: { lt: now } },
    select: { id: true },
  });
  for (const b of expired) {
    await prisma.$transaction((tx) => expireSingleBooking(tx, b.id));
  }
  return { cancelledCount: expired.length };
}

export async function autoCompleteFinishedBookings(now = new Date()) {
  const finished = await prisma.booking.findMany({
    where: {
      status: BookingStatus.PROCESSED,
      checkOutDate: { lte: now },
    },
    select: { id: true },
  });
  if (finished.length === 0) return { completedCount: 0 };
  const ids = finished.map((b) => b.id);
  await prisma.booking.updateMany({
    where: { id: { in: ids } },
    data: { status: BookingStatus.COMPLETED },
  });
  return { completedCount: finished.length };
}

export function initAutoCancelCron() {
  return cron.schedule('*/1 * * * *', async () => {
    try { await cancelExpiredBookings(); } catch {}
  });
}

export function initAutoCompleteCron() {
  return cron.schedule('0 12 * * *', async () => {
    try { await autoCompleteFinishedBookings(); } catch {}
  }, { timezone: 'Asia/Jakarta' });
}

export function initBookingCrons() {
  initAutoCancelCron();
  initAutoCompleteCron();
}
