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

export function initAutoCancelCron() {
  return cron.schedule('*/1 * * * *', async () => {
    try {
      await cancelExpiredBookings();
    } catch {
      // Catch and continue on background job failures
    }
  });
}
