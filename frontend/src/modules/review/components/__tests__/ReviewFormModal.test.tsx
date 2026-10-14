import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReviewFormModal } from '../ReviewFormModal';
import { reviewApi } from '../../services/review.api';

vi.mock('../../services/review.api', () => ({
  reviewApi: { createReview: vi.fn() },
}));

function renderModal(props: Partial<React.ComponentProps<typeof ReviewFormModal>> = {}) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    bookingId: 'bk-123',
    propertyTitle: 'Villa Nuansa Asri',
  };
  return { ...render(<QueryClientProvider client={qc}><ReviewFormModal {...defaultProps} {...props} /></QueryClientProvider>), defaultProps };
}

describe('ReviewFormModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders modal with title, property title, stars, and comment textarea', () => {
    renderModal();
    expect(screen.getByText('Beri Ulasan Penginapan')).toBeInTheDocument();
    expect(screen.getByText(/Villa Nuansa Asri/i)).toBeInTheDocument();
    expect(screen.getByLabelText('5 bintang')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Kirim Ulasan/i })).toBeInTheDocument();
  });

  it('shows validation error when comment is shorter than 5 characters', async () => {
    renderModal();
    const commentInput = screen.getByPlaceholderText(/Ceritakan kebersihan/i);
    fireEvent.change(commentInput, { target: { value: 'Oke' } });
    fireEvent.click(screen.getByRole('button', { name: /Kirim Ulasan/i }));
    await waitFor(() => {
      expect(screen.getByText('Komentar ulasan minimal 5 karakter.')).toBeInTheDocument();
    });
    expect(reviewApi.createReview).not.toHaveBeenCalled();
  });

  it('successfully submits review and calls onClose', async () => {
    const onClose = vi.fn();
    vi.mocked(reviewApi.createReview).mockResolvedValueOnce({
      success: true,
      message: 'OK',
      data: { id: 'rev-1', bookingId: 'bk-123', userId: 'u-1', propertyId: 'p-1', rating: 4, comment: 'Sangat bersih dan nyaman!', createdAt: '2026-10-10' },
    });
    renderModal({ onClose });
    fireEvent.click(screen.getByLabelText('4 bintang'));
    const commentInput = screen.getByPlaceholderText(/Ceritakan kebersihan/i);
    fireEvent.change(commentInput, { target: { value: 'Sangat bersih dan nyaman!' } });
    fireEvent.click(screen.getByRole('button', { name: /Kirim Ulasan/i }));
    await waitFor(() => {
      expect(reviewApi.createReview).toHaveBeenCalledWith({ bookingId: 'bk-123', rating: 4, comment: 'Sangat bersih dan nyaman!' });
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('calls onClose when cancel button is clicked', () => {
    const onClose = vi.fn();
    renderModal({ onClose });
    fireEvent.click(screen.getByRole('button', { name: /Batal/i }));
    expect(onClose).toHaveBeenCalled();
  });
});
