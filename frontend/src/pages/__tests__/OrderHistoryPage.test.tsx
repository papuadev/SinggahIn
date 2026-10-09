import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
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
});
