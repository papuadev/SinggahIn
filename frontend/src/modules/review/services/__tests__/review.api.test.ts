import { describe, it, expect, vi, beforeEach } from 'vitest';
import { reviewApi } from '../review.api';
import { apiClient } from '../../../../libs/axios';

vi.mock('../../../../libs/axios', () => ({
  apiClient: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

describe('reviewApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls POST /reviews when creating a review', async () => {
    const payload = { bookingId: 'bk-123', rating: 5, comment: 'Tempat sangat nyaman dan bersih!' };
    vi.mocked(apiClient.post).mockResolvedValueOnce({ data: { success: true, data: { id: 'rev-1', ...payload } } });
    const result = await reviewApi.createReview(payload);
    expect(apiClient.post).toHaveBeenCalledWith('/reviews', payload);
    expect(result.data.id).toBe('rev-1');
  });

  it('calls GET /reviews/property/:propertyId with page and limit params', async () => {
    const mockData = { reviews: [], totalReviews: 0, averageRating: 0, page: 2, limit: 10, totalPages: 0 };
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: { success: true, data: mockData } });
    const result = await reviewApi.getPropertyReviews('prop-123', 2, 10);
    expect(apiClient.get).toHaveBeenCalledWith('/reviews/property/prop-123', { params: { page: 2, limit: 10 } });
    expect(result.data.page).toBe(2);
  });

  it('calls GET /reviews/booking/:bookingId to fetch user review for booking', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: { success: true, data: { id: 'rev-1', rating: 5 } } });
    const result = await reviewApi.getBookingReview('bk-123');
    expect(apiClient.get).toHaveBeenCalledWith('/reviews/booking/bk-123');
    expect(result.data?.rating).toBe(5);
  });
});
