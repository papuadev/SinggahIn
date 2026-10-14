import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewApi } from '../services/review.api';
import { CreateReviewPayload } from '../review.types';

export function useCreateReview(onSuccess?: () => void) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateReviewPayload) => reviewApi.createReview(payload),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['property-reviews'] });
      qc.invalidateQueries({ queryKey: ['booking-review', vars.bookingId] });
      qc.invalidateQueries({ queryKey: ['order-history'] });
      qc.invalidateQueries({ queryKey: ['property-detail'] });
      qc.invalidateQueries({ queryKey: ['order-detail', vars.bookingId] });
      onSuccess?.();
    },
  });
}
