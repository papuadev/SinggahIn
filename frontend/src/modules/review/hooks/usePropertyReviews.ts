import { useQuery } from '@tanstack/react-query';
import { reviewApi } from '../services/review.api';

export function usePropertyReviews(propertyId?: string, page = 1, limit = 5) {
  return useQuery({
    queryKey: ['property-reviews', propertyId, page, limit],
    queryFn: async () => (await reviewApi.getPropertyReviews(propertyId!, page, limit)).data,
    enabled: Boolean(propertyId),
  });
}

export function useBookingReview(bookingId?: string, enabled = true) {
  return useQuery({
    queryKey: ['booking-review', bookingId],
    queryFn: async () => (await reviewApi.getBookingReview(bookingId!)).data,
    enabled: Boolean(bookingId && enabled),
  });
}
