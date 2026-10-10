import { apiClient } from '../../../libs/axios';
import { ApiResponse } from '../../../types/api.types';
import { Review, CreateReviewPayload, PropertyReviewResponse } from '../review.types';

export const reviewApi = {
  async createReview(payload: CreateReviewPayload): Promise<ApiResponse<Review>> {
    const res = await apiClient.post<ApiResponse<Review>>('/reviews', payload);
    return res.data;
  },

  async getPropertyReviews(propertyId: string, page = 1, limit = 10): Promise<ApiResponse<PropertyReviewResponse>> {
    const res = await apiClient.get<ApiResponse<PropertyReviewResponse>>(`/reviews/property/${propertyId}`, {
      params: { page, limit },
    });
    return res.data;
  },

  async getBookingReview(bookingId: string): Promise<ApiResponse<Review | null>> {
    const res = await apiClient.get<ApiResponse<Review | null>>(`/reviews/booking/${bookingId}`);
    return res.data;
  },
};
