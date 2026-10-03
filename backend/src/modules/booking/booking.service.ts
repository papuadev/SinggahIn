import { BookingStatus, PaymentMethod, PaymentStatus, Prisma, Role } from '@prisma/client';
import { prisma } from '../../shared/services/prisma.service';
import { AppError } from '../../shared/utils/app-error';
import { calculateStayPricing } from '../room/pricing.service';
import { generateBookingCode, calculateBookingExpiry, parseAndValidateBookingDates } from './booking.helper';
import { CreateBookingInput, BookingResponseDto, BookingListQuery } from './booking.types';

async function validateUserEligibility(tx: Prisma.TransactionClient, userId: string) {
  const user = await tx.user.findUnique({ where: { id: userId } });
  if (!user) throw AppError.notFound('Pengguna tidak ditemukan.');
  if (!user.isVerified) {
    throw AppError.forbidden('Akun Anda belum terverifikasi. Silakan verifikasi email Anda terlebih dahulu.');
  }
  return user;
}

async function lockAndGetRoom(tx: Prisma.TransactionClient, roomId: string, guestCount: number) {
  if (typeof tx.$queryRaw === 'function') {
    await tx.$queryRaw`SELECT id FROM rooms WHERE id = ${roomId} FOR UPDATE`;
  }
  const room = await tx.room.findUnique({ where: { id: roomId } });
  if (!room) throw AppError.notFound('Kamar tidak ditemukan.');
  if (guestCount > room.capacity) {
    throw AppError.badRequest(`Jumlah tamu (${guestCount}) melebihi kapasitas kamar (${room.capacity}).`);
  }
  return room;
}

async function checkRoomUnavailability(tx: Prisma.TransactionClient, roomId: string, checkIn: Date, checkOut: Date) {
  const count = await tx.roomUnavailability.count({
    where: { roomId, startDate: { lt: checkOut }, endDate: { gte: checkIn } },
  });
  if (count > 0) throw AppError.conflict('Kamar sedang tidak tersedia pada tanggal yang dipilih.');
}

async function checkOverlappingBookings(
  tx: Prisma.TransactionClient, roomId: string, checkIn: Date, checkOut: Date, totalUnits: number
) {
  const count = await tx.booking.count({
    where: {
      roomId,
      status: { in: [BookingStatus.WAITING_PAYMENT, BookingStatus.WAITING_CONFIRMATION, BookingStatus.PROCESSED] },
      checkInDate: { lt: checkOut },
      checkOutDate: { gt: checkIn },
    },
  });
  if (count >= totalUnits) throw AppError.conflict('Kamar tidak lagi tersedia pada tanggal tersebut.');
}

interface CreateRecordParams {
  userId: string; room: { id: string; propertyId: string };
  checkIn: Date; checkOut: Date; totalNights: number;
  totalPrice: number; guestCount: number; paymentMethod: PaymentMethod;
}

async function createBookingRecord(tx: Prisma.TransactionClient, p: CreateRecordParams) {
  const bookingCode = generateBookingCode();
  const expiresAt = calculateBookingExpiry(2);
  return tx.booking.create({
    data: {
      bookingCode, userId: p.userId, propertyId: p.room.propertyId, roomId: p.room.id,
      checkInDate: p.checkIn, checkOutDate: p.checkOut, totalNights: p.totalNights,
      guestCount: p.guestCount, totalPrice: p.totalPrice, status: BookingStatus.WAITING_PAYMENT,
      expiresAt, payment: { create: { paymentMethod: p.paymentMethod, amount: p.totalPrice, status: PaymentStatus.PENDING } },
    },
  });
}

async function executeBookingTx(
  tx: Prisma.TransactionClient, userId: string, input: CreateBookingInput,
  dates: { checkIn: Date; checkOut: Date }, pricing: { totalNights: number; totalStayPrice: number }
) {
  await validateUserEligibility(tx, userId);
  const room = await lockAndGetRoom(tx, input.roomId, input.guestCount);
  await checkRoomUnavailability(tx, input.roomId, dates.checkIn, dates.checkOut);
  await checkOverlappingBookings(tx, input.roomId, dates.checkIn, dates.checkOut, room.totalUnits);
  return createBookingRecord(tx, {
    userId, room, checkIn: dates.checkIn, checkOut: dates.checkOut,
    totalNights: pricing.totalNights, totalPrice: pricing.totalStayPrice,
    guestCount: input.guestCount, paymentMethod: input.paymentMethod,
  });
}

export async function createBooking(userId: string, input: CreateBookingInput): Promise<BookingResponseDto> {
  const dates = parseAndValidateBookingDates(input.checkInDate, input.checkOutDate);
  const pricing = await calculateStayPricing(input.roomId, input.checkInDate, input.checkOutDate);
  const b = await prisma.$transaction((tx) => executeBookingTx(tx, userId, input, dates, pricing));
  return {
    bookingId: b.id, bookingCode: b.bookingCode, status: b.status,
    totalPrice: b.totalPrice, expiresAt: b.expiresAt.toISOString(),
  };
}

function assertCancellable(booking: { userId: string; status: BookingStatus } | null, userId: string) {
  if (!booking) throw AppError.notFound('Pesanan tidak ditemukan.');
  if (booking.userId !== userId) throw AppError.forbidden('Anda tidak memiliki akses ke pesanan ini.');
  if (booking.status !== BookingStatus.WAITING_PAYMENT) {
    throw AppError.badRequest('Hanya pesanan yang menunggu pembayaran yang dapat dibatalkan.');
  }
}

async function executeCancelTx(tx: Prisma.TransactionClient, userId: string, bookingId: string, reason?: string) {
  const booking = await tx.booking.findUnique({ where: { id: bookingId } });
  assertCancellable(booking, userId);
  return tx.booking.update({
    where: { id: bookingId },
    data: {
      status: BookingStatus.CANCELLED,
      cancellationReason: reason || 'Dibatalkan oleh pengguna',
      payment: { update: { status: PaymentStatus.CANCELLED } },
    },
  });
}

export async function cancelBooking(userId: string, bookingId: string, reason?: string) {
  return prisma.$transaction((tx) => executeCancelTx(tx, userId, bookingId, reason));
}

export async function getBookingById(userId: string, bookingId: string, role?: Role) {
  const b = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      property: { select: { id: true, title: true, city: true, address: true, tenantId: true } },
      room: { select: { id: true, name: true, basePrice: true } },
      payment: true,
    },
  });
  if (!b) throw AppError.notFound('Pesanan tidak ditemukan.');
  const isOwner = b.userId === userId;
  const isTenant = role === Role.TENANT && b.property.tenantId === userId;
  if (!isOwner && !isTenant) throw AppError.forbidden('Akses ke data pesanan ini ditolak.');
  return b;
}

const BOOKING_SELECT = {
  property: { select: { id: true, title: true, city: true, address: true } },
  room: { select: { id: true, name: true, basePrice: true } },
  payment: true,
};

export async function getUserBookings(userId: string, query: BookingListQuery) {
  const page = query.page || 1;
  const limit = query.limit || 10;
  const where = { userId, ...(query.status && { status: query.status }) };
  const [data, totalItems] = await Promise.all([
    prisma.booking.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' }, include: BOOKING_SELECT }),
    prisma.booking.count({ where }),
  ]);
  return { data, meta: { page, limit, totalItems, totalPages: Math.ceil(totalItems / limit) } };
}
