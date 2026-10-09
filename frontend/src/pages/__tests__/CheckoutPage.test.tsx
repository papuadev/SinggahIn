import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CheckoutPage } from '../CheckoutPage';
import { propertyApi } from '../../modules/property/services/property.api';
import { roomApi } from '../../modules/room/services/room.api';
import { bookingApi } from '../../modules/booking/services/booking.api';

vi.mock('../../modules/property/services/property.api', () => ({
  propertyApi: { getPropertyById: vi.fn() },
}));

vi.mock('../../modules/room/services/room.api', () => ({
  roomApi: { getRoomById: vi.fn() },
}));

vi.mock('../../modules/booking/services/booking.api', () => ({
  bookingApi: { createBooking: vi.fn() },
}));

vi.mock('../../stores/auth.store', () => ({
  useAuthStore: () => ({
    user: { id: 'u1', name: 'Budi Santoso', email: 'budi@test.com', phoneNumber: '08123456789' },
  }),
}));

function renderCheckout(url = '/checkout?propertyId=p1&roomId=r1&checkIn=2026-10-15&checkOut=2026-10-17&guestCount=2') {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={[url]}>
        <CheckoutPage />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('CheckoutPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(propertyApi.getPropertyById).mockResolvedValue({
      success: true, message: 'OK',
      data: { id: 'p1', title: 'Villa Bali Indah', city: 'Denpasar', address: 'Jl. Sunset' } as any,
    });
    vi.mocked(roomApi.getRoomById).mockResolvedValue({
      success: true, message: 'OK',
      data: { id: 'r1', name: 'Deluxe Suite', basePrice: 500000 } as any,
    });
  });

  it('renders property, room details, and guest info correctly', async () => {
    renderCheckout();
    await waitFor(() => {
      expect(screen.getByText('Checkout & Konfirmasi Pemesanan')).toBeInTheDocument();
      expect(screen.getByText('Villa Bali Indah')).toBeInTheDocument();
      expect(screen.getByText('Deluxe Suite')).toBeInTheDocument();
      expect(screen.getByText('Budi Santoso')).toBeInTheDocument();
      expect(screen.getByText('budi@test.com')).toBeInTheDocument();
    });
  });

  it('allows selecting payment method and submitting booking', async () => {
    vi.mocked(bookingApi.createBooking).mockResolvedValueOnce({
      success: true, message: 'OK',
      data: { id: 'bk-new-123' } as any,
    });
    renderCheckout();
    await waitFor(() => {
      expect(screen.getByText('Transfer Bank Manual')).toBeInTheDocument();
    });

    const submitBtn = screen.getByRole('button', { name: /Konfirmasi Pesanan/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(bookingApi.createBooking).toHaveBeenCalledWith({
        roomId: 'r1',
        checkInDate: '2026-10-15',
        checkOutDate: '2026-10-17',
        guestCount: 2,
        paymentMethod: 'MANUAL_TRANSFER',
      });
    });
  });
});
