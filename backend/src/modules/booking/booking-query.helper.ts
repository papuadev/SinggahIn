import { BookingStatus, Prisma } from '@prisma/client';
import { InvoicePdfData } from '../../shared/services/invoice-pdf.service';
import { BookingListQuery } from './booking.types';
import { AppError } from '../../shared/utils/app-error';

export const BOOKING_SELECT = {
  property: { select: { id: true, title: true, city: true, address: true } },
  room: { select: { id: true, name: true, basePrice: true } },
  payment: true,
  review: { select: { id: true, rating: true, comment: true } },
};

export const TENANT_BOOKING_SELECT = {
  property: {
    select: {
      id: true,
      title: true,
      city: true,
      address: true,
      images: { select: { imageUrl: true, isCover: true }, take: 1, orderBy: { isCover: 'desc' as const } },
    },
  },
  room: {
    select: {
      id: true,
      name: true,
      basePrice: true,
      images: { select: { imageUrl: true }, take: 1 },
    },
  },
  user: { select: { id: true, name: true, email: true, phoneNumber: true } },
  payment: true,
};

export function buildBookingOrderBy(sortBy?: string): Prisma.BookingOrderByWithRelationInput {
  switch (sortBy) {
    case 'createdAt_asc': return { createdAt: 'asc' };
    case 'checkIn_asc': return { checkInDate: 'asc' };
    case 'checkIn_desc': return { checkInDate: 'desc' };
    case 'price_desc': return { totalPrice: 'desc' };
    case 'price_asc': return { totalPrice: 'asc' };
    default: return { createdAt: 'desc' };
  }
}

export function buildUserBookingWhere(userId: string, q: BookingListQuery): Prisma.BookingWhereInput {
  const where: Prisma.BookingWhereInput = { userId, ...(q.status && { status: q.status }) };
  if (q.search?.trim()) {
    const s = q.search.trim();
    where.OR = [
      { bookingCode: { contains: s, mode: 'insensitive' } },
      { property: { title: { contains: s, mode: 'insensitive' } } },
      { property: { city: { contains: s, mode: 'insensitive' } } },
      { room: { name: { contains: s, mode: 'insensitive' } } },
    ];
  }
  return where;
}

export function buildTenantBookingWhere(tenantId: string, q: BookingListQuery): Prisma.BookingWhereInput {
  const where: Prisma.BookingWhereInput = { property: { tenantId }, ...(q.status && { status: q.status }) };
  if (q.search?.trim()) {
    const s = q.search.trim();
    where.OR = [
      { bookingCode: { contains: s, mode: 'insensitive' } },
      { property: { title: { contains: s, mode: 'insensitive' } } },
      { room: { name: { contains: s, mode: 'insensitive' } } },
      { user: { name: { contains: s, mode: 'insensitive' } } },
      { user: { email: { contains: s, mode: 'insensitive' } } },
    ];
  }
  return where;
}

export function assertInvoiceEligible(status: BookingStatus): void {
  if (status !== BookingStatus.PROCESSED && status !== BookingStatus.COMPLETED) {
    throw AppError.badRequest('Invoice hanya tersedia untuk pesanan yang telah dikonfirmasi atau selesai.');
  }
}

export function buildInvoiceData(b: any): InvoicePdfData {
  const method = b.payment?.paymentMethod === 'MANUAL_TRANSFER' ? 'Transfer Bank Manual' : (b.payment?.paymentMethod || 'Online Payment');
  const paidAt = (b.payment?.updatedAt || b.updatedAt).toISOString().split('T')[0];
  return {
    bookingCode: b.bookingCode, propertyName: b.property.title, roomName: b.room.name,
    checkInDate: b.checkInDate.toISOString().split('T')[0], checkOutDate: b.checkOutDate.toISOString().split('T')[0],
    totalGuests: b.guestCount, totalPrice: b.totalPrice, guestName: b.user?.name || undefined,
    guestEmail: b.user?.email || undefined, paymentMethod: method, paidAt,
  };
}
