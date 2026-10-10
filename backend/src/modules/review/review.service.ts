import { BookingStatus } from '@prisma/client';
import { prisma } from '../../shared/services/prisma.service';
import { AppError } from '../../shared/utils/app-error';
import { CreateReviewInput, ReviewResponseDto, PropertyReviewListResponseDto } from './review.types';

function mapReviewDto(r: any): ReviewResponseDto {
  return {
    id: r.id,
    bookingId: r.bookingId,
    userId: r.userId,
    propertyId: r.propertyId,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : r.createdAt,
    user: r.user ? { id: r.user.id, name: r.user.name || 'Tamu', avatarUrl: r.user.avatarUrl } : undefined,
  };
}

function validateEligibleBooking(booking: any, userId: string) {
  if (!booking) throw AppError.notFound('Pesanan tidak ditemukan.');
  if (booking.userId !== userId) throw AppError.forbidden('Anda tidak memiliki akses ke pesanan ini.');
  if (booking.status !== BookingStatus.COMPLETED) {
    throw AppError.badRequest('Ulasan hanya dapat diberikan setelah masa menginap selesai (COMPLETED).');
  }
  if (booking.review) throw AppError.badRequest('Anda sudah memberikan ulasan untuk pesanan ini.');
}

export async function createReview(userId: string, input: CreateReviewInput): Promise<ReviewResponseDto> {
  const booking = await prisma.booking.findUnique({ where: { id: input.bookingId }, include: { review: true } });
  validateEligibleBooking(booking, userId);
  const review = await prisma.review.create({
    data: { bookingId: input.bookingId, userId, propertyId: booking!.propertyId, rating: input.rating, comment: input.comment },
    include: { user: { select: { id: true, name: true, avatarUrl: true } } },
  });
  return mapReviewDto(review);
}

async function computePropertyRating(propertyId: string) {
  const total = await prisma.review.count({ where: { propertyId } });
  const agg = await prisma.review.aggregate({ where: { propertyId }, _avg: { rating: true } });
  return { total, avg: agg._avg.rating ? Math.round(agg._avg.rating * 10) / 10 : 0 };
}

async function fetchReviewList(propertyId: string, page: number, limit: number) {
  return prisma.review.findMany({
    where: { propertyId },
    include: { user: { select: { id: true, name: true, avatarUrl: true } } },
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * limit,
    take: limit,
  });
}

export async function getPropertyReviews(propertyId: string, page = 1, limit = 10): Promise<PropertyReviewListResponseDto> {
  const prop = await prisma.property.findUnique({ where: { id: propertyId }, select: { id: true } });
  if (!prop) throw AppError.notFound('Properti tidak ditemukan.');
  const { total, avg } = await computePropertyRating(propertyId);
  const reviews = await fetchReviewList(propertyId, page, limit);
  return { reviews: reviews.map(mapReviewDto), totalReviews: total, averageRating: avg, page, limit, totalPages: Math.ceil(total / limit) || 1 };
}

export async function getBookingReview(userId: string, bookingId: string): Promise<ReviewResponseDto | null> {
  const review = await prisma.review.findUnique({ where: { bookingId }, include: { user: { select: { id: true, name: true, avatarUrl: true } } } });
  if (!review) return null;
  if (review.userId !== userId) throw AppError.forbidden('Akses ditolak.');
  return mapReviewDto(review);
}
