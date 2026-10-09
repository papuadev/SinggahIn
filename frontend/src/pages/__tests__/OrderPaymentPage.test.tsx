import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { OrderPaymentPage } from '../OrderPaymentPage';
import { bookingApi } from '../../modules/booking/services/booking.api';

vi.mock('../../modules/booking/services/booking.api', () => ({
  bookingApi: {
    getBookingById: vi.fn(),
    cancelBooking: vi.fn(),
  },
}));

vi.mock('../../modules/payment/services/payment.api', () => ({
  paymentApi: {
    uploadPaymentProof: vi.fn(),
    createSnapCharge: vi.fn(),
  },
}));

const mockBooking = {
  id: 'bk-123',
  bookingCode: 'SGH-20261015-XYZ1',
  userId: 'u1',
  roomId: 'r1',
  propertyId: 'p1',
  checkInDate: '2026-10-15',
  checkOutDate: '2026-10-17',
  guestCount: 2,
  totalPrice: 1000000,
  status: 'WAITING_PAYMENT',
  expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
  property: { id: 'p1', title: 'Villa Bali', city: 'Denpasar', address: 'Jl. Pantai' },
  room: { id: 'r1', name: 'Deluxe', basePrice: 500000 },
  payment: { paymentMethod: 'MANUAL_TRANSFER', status: 'PENDING' },
};

function renderOrderPayment(bookingId = 'bk-123') {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={[`/orders/${bookingId}/payment`]}>
        <Routes>
          <Route path="/orders/:id/payment" element={<OrderPaymentPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('OrderPaymentPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders payment countdown timer and manual bank transfer instructions', async () => {
    vi.mocked(bookingApi.getBookingById).mockResolvedValueOnce({
      success: true, message: 'OK', data: mockBooking as any,
    });
    renderOrderPayment();
    await waitFor(() => {
      expect(screen.getByText(/Pembayaran Pesanan/i)).toBeInTheDocument();
      expect(screen.getByText('SGH-20261015-XYZ1', { exact: false })).toBeInTheDocument();
      expect(screen.getByText('Instruksi Transfer Bank')).toBeInTheDocument();
      expect(screen.getByText('Bank Central Asia (BCA)')).toBeInTheDocument();
      expect(screen.getByText(/Sisa Waktu Pembayaran/i)).toBeInTheDocument();
    });
  });

  it('shows Batalkan Pesanan button when status is WAITING_PAYMENT', async () => {
    vi.mocked(bookingApi.getBookingById).mockResolvedValueOnce({
      success: true, message: 'OK', data: mockBooking as any,
    });
    renderOrderPayment();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Batalkan Pesanan/i })).toBeInTheDocument();
    });
  });

  it('renders uploaded proof image preview and hides upload form when proofImageUrl is present', async () => {
    const withProof = { ...mockBooking, status: 'WAITING_CONFIRMATION', payment: { paymentMethod: 'MANUAL_TRANSFER', proofImageUrl: 'https://cdn.example.com/proof123.jpg' } };
    vi.mocked(bookingApi.getBookingById).mockResolvedValueOnce({ success: true, message: 'OK', data: withProof as any });
    renderOrderPayment();
    await waitFor(() => {
      expect(screen.getByAltText('Bukti Pembayaran')).toHaveAttribute('src', 'https://cdn.example.com/proof123.jpg');
      expect(screen.getByText(/Bukti transfer berhasil diunggah/i)).toBeInTheDocument();
      expect(screen.queryByText(/Pilih atau Seret Foto Bukti Transfer/i)).not.toBeInTheDocument();
    });
  });

  it('allows user to switch back to upload form when Unggah Ulang is clicked', async () => {
    const withProof = { ...mockBooking, payment: { paymentMethod: 'MANUAL_TRANSFER', proofImageUrl: 'https://cdn.example.com/p.jpg' } };
    vi.mocked(bookingApi.getBookingById).mockResolvedValueOnce({ success: true, message: 'OK', data: withProof as any });
    renderOrderPayment();
    await waitFor(() => expect(screen.getByRole('button', { name: /Unggah Ulang/i })).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /Unggah Ulang/i }));
    expect(screen.getByText(/Pilih atau Seret Foto Bukti Transfer/i)).toBeInTheDocument();
  });
});
