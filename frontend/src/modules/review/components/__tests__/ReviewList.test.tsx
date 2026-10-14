import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReviewList } from '../ReviewList';
import { reviewApi } from '../../services/review.api';

vi.mock('../../services/review.api', () => ({
  reviewApi: { getPropertyReviews: vi.fn() },
}));

const mockReviewsData = {
  reviews: [
    {
      id: 'rev-1',
      bookingId: 'bk-1',
      userId: 'u-1',
      propertyId: 'p-1',
      rating: 5,
      comment: 'Villa sangat asri dan sejuk! Pelayanan sangat ramah.',
      createdAt: '2026-10-01T10:00:00.000Z',
      user: { id: 'u-1', name: 'Budi Santoso', avatarUrl: null },
    },
    {
      id: 'rev-2',
      bookingId: 'bk-2',
      userId: 'u-2',
      propertyId: 'p-1',
      rating: 4,
      comment: 'Kamar bersih, pemandangan indah.',
      createdAt: '2026-10-02T12:00:00.000Z',
      user: { id: 'u-2', name: 'Siti Rahma', avatarUrl: 'https://example.com/avatar.jpg' },
    },
  ],
  totalReviews: 2,
  averageRating: 4.5,
  page: 1,
  limit: 5,
  totalPages: 1,
};

function renderList(propertyId = 'p-1') {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={qc}><ReviewList propertyId={propertyId} /></QueryClientProvider>);
}

describe('ReviewList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders empty state when there are no reviews', async () => {
    vi.mocked(reviewApi.getPropertyReviews).mockResolvedValueOnce({
      success: true,
      message: 'OK',
      data: { reviews: [], totalReviews: 0, averageRating: 0, page: 1, limit: 5, totalPages: 0 },
    });
    renderList();
    await waitFor(() => {
      expect(screen.getByText('Belum Ada Ulasan')).toBeInTheDocument();
      expect(screen.getByText(/Jadilah tamu pertama/i)).toBeInTheDocument();
    });
  });

  it('renders summary score, total count, and individual review cards', async () => {
    vi.mocked(reviewApi.getPropertyReviews).mockResolvedValueOnce({ success: true, message: 'OK', data: mockReviewsData });
    renderList();
    await waitFor(() => {
      expect(screen.getByText('Ulasan Tamu (2)')).toBeInTheDocument();
      expect(screen.getByText('4.5')).toBeInTheDocument();
      expect(screen.getByText(/Berdasarkan 2 ulasan tamu terverifikasi/i)).toBeInTheDocument();
      expect(screen.getByText('Budi Santoso')).toBeInTheDocument();
      expect(screen.getByText('Siti Rahma')).toBeInTheDocument();
      expect(screen.getByText(/Villa sangat asri dan sejuk!/i)).toBeInTheDocument();
    });
  });

  it('renders pagination and handles page navigation when totalPages > 1', async () => {
    const multiPageData = { ...mockReviewsData, totalPages: 2, page: 1 };
    vi.mocked(reviewApi.getPropertyReviews).mockResolvedValueOnce({ success: true, message: 'OK', data: multiPageData });
    renderList();
    await waitFor(() => {
      expect(screen.getByText('Hal. 1 dari 2')).toBeInTheDocument();
    });
    const nextBtn = screen.getByRole('button', { name: /Berikutnya/i });
    expect(nextBtn).toBeEnabled();
    fireEvent.click(nextBtn);
    await waitFor(() => {
      expect(reviewApi.getPropertyReviews).toHaveBeenCalledWith('p-1', 2, 5);
    });
  });
});
