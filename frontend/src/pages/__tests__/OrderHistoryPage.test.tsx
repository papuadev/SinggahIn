import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { OrderHistoryPage } from '../OrderHistoryPage';
import { bookingApi } from '../../modules/booking/services/booking.api';

vi.mock('../../modules/booking/services/booking.api', () => ({
  bookingApi: {
    getUserBookings: vi.fn(),
    cancelBooking: vi.fn(),
  },
}));

function renderHistory() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <OrderHistoryPage />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('OrderHistoryPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders empty state when user has no bookings', async () => {
    vi.mocked(bookingApi.getUserBookings).mockResolvedValueOnce({
      success: true, message: 'OK', data: [],
    });
    renderHistory();
    await waitFor(() => {
      expect(screen.getByText('Belum Ada Riwayat Pesanan')).toBeInTheDocument();
    });
  });

  it('renders booking cards when bookings exist', async () => {
    const mockBookings = [{
      id: 'bk-1', bookingCode: 'SGH-20261015-AAAA', status: 'WAITING_PAYMENT',
      checkInDate: '2026-10-15', checkOutDate: '2026-10-17', guestCount: 2,
      totalPrice: 1000000, property: { title: 'Villa Indah' }, room: { name: 'Deluxe' },
    }];
    vi.mocked(bookingApi.getUserBookings).mockResolvedValueOnce({
      success: true, message: 'OK', data: mockBookings as any,
    });
    renderHistory();
    await waitFor(() => {
      expect(screen.getByText('SGH-20261015-AAAA')).toBeInTheDocument();
      expect(screen.getByText('Villa Indah')).toBeInTheDocument();
      expect(screen.getAllByText('Menunggu Pembayaran').length).toBe(2);
      expect(screen.getByRole('button', { name: /Bayar Sekarang/i })).toBeInTheDocument();
    });
  });

  it('renders Beri Ulasan button for completed booking and opens review modal', async () => {
    const mockBookings = [{
      id: 'bk-comp', bookingCode: 'SGH-20261010-COMP', status: 'COMPLETED',
      checkInDate: '2026-10-01', checkOutDate: '2026-10-03', guestCount: 2,
      totalPrice: 1500000, property: { title: 'Hotel Grand Bandung' }, room: { name: 'Executive Suite' }, review: null,
    }];
    vi.mocked(bookingApi.getUserBookings).mockResolvedValueOnce({
      success: true, message: 'OK', data: mockBookings as any,
    });
    renderHistory();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Beri Ulasan/i })).toBeInTheDocument();
    });
    const reviewBtn = screen.getByRole('button', { name: /Beri Ulasan/i });
    fireEvent.click(reviewBtn);
    await waitFor(() => {
      expect(screen.getByText('Beri Ulasan Penginapan')).toBeInTheDocument();
    });
  });

  it('renders Sudah Diulas badge when completed booking already has a review', async () => {
    const mockBookings = [{
      id: 'bk-comp-reviewed', bookingCode: 'SGH-20261010-DONE', status: 'COMPLETED',
      checkInDate: '2026-10-01', checkOutDate: '2026-10-03', guestCount: 2,
      totalPrice: 1500000, property: { title: 'Hotel Grand Bandung' }, room: { name: 'Executive Suite' },
      review: { id: 'rev-99', rating: 5, comment: 'Mantap' },
    }];
    vi.mocked(bookingApi.getUserBookings).mockResolvedValueOnce({
      success: true, message: 'OK', data: mockBookings as any,
    });
    renderHistory();
    await waitFor(() => {
      expect(screen.getByText(/Sudah Diulas \(5★\)/i)).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Beri Ulasan/i })).not.toBeInTheDocument();
    });
  });

  it('renders Ditolak tab and filters orders by REJECTED status', async () => {
    const mockBookings = [{
      id: 'bk-rej', bookingCode: 'SGH-20261010-REJ', status: 'REJECTED',
      checkInDate: '2026-10-01', checkOutDate: '2026-10-03', guestCount: 1,
      totalPrice: 500000, property: { title: 'Hotel Grand Bandung' }, room: { name: 'Standard' },
    }];
    vi.mocked(bookingApi.getUserBookings).mockResolvedValue({
      success: true, message: 'OK', data: mockBookings as any,
    });
    renderHistory();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Ditolak' })).toBeInTheDocument();
    });
    const rejectedTab = screen.getByRole('button', { name: 'Ditolak' });
    fireEvent.click(rejectedTab);
    await waitFor(() => {
      expect(bookingApi.getUserBookings).toHaveBeenCalledWith(expect.objectContaining({ status: 'REJECTED' }));
      expect(screen.getAllByText('Ditolak').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('renders BackButton to navigate back to previous or fallback page', async () => {
    vi.mocked(bookingApi.getUserBookings).mockResolvedValue({
      success: true, message: 'OK', data: [],
    });
    renderHistory();
    expect(screen.getByRole('button', { name: 'Kembali' })).toBeInTheDocument();
  });

  it('searches user orders and updates sort options', async () => {
    const mockBookings = [
      {
        id: 'bk-1',
        bookingCode: 'SGH-20261015-AAAA',
        status: 'WAITING_PAYMENT',
        checkInDate: '2026-10-15',
        checkOutDate: '2026-10-17',
        guestCount: 2,
        totalPrice: 1000000,
        property: { title: 'Villa Indah' },
        room: { name: 'Deluxe' },
      },
    ];
    vi.mocked(bookingApi.getUserBookings).mockResolvedValue({
      success: true, message: 'OK', data: mockBookings as any,
    });
    renderHistory();
    await waitFor(() => {
      expect(screen.getByText('SGH-20261015-AAAA')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Cari kode pesanan atau nama penginapan/i);
    fireEvent.change(searchInput, { target: { value: 'Villa Indah' } });

    await waitFor(() => {
      expect(bookingApi.getUserBookings).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'Villa Indah' })
      );
    });

    const sortSelect = screen.getByDisplayValue('Terbaru');
    fireEvent.change(sortSelect, { target: { value: 'price_desc' } });

    await waitFor(() => {
      expect(bookingApi.getUserBookings).toHaveBeenCalledWith(
        expect.objectContaining({ sortBy: 'price_desc' })
      );
    });
  });

  it('scrolls to top smoothly when changing page', async () => {
    const scrollToSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    const mockBookings = [{
      id: 'bk-1', bookingCode: 'SGH-20261015-AAAA', status: 'WAITING_PAYMENT',
      checkInDate: '2026-10-15', checkOutDate: '2026-10-17', guestCount: 2,
      totalPrice: 1000000, property: { title: 'Villa Indah' }, room: { name: 'Deluxe' },
    }];
    vi.mocked(bookingApi.getUserBookings).mockResolvedValue({
      success: true,
      message: 'OK',
      data: mockBookings as any,
      meta: { page: 1, limit: 1, totalPages: 2, totalItems: 2 },
    });
    renderHistory();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Berikutnya/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Berikutnya/i }));

    expect(scrollToSpy).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
    scrollToSpy.mockRestore();
  });
});
