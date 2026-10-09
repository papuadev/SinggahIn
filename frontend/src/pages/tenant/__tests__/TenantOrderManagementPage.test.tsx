import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TenantOrderManagementPage } from '../TenantOrderManagementPage';
import { bookingApi } from '../../../modules/booking/services/booking.api';

vi.mock('../../../modules/booking/services/booking.api', () => ({
  bookingApi: {
    getTenantBookings: vi.fn(),
  },
}));

vi.mock('../../../modules/payment/services/payment.api', () => ({
  paymentApi: {
    approvePaymentProof: vi.fn(),
    rejectPaymentProof: vi.fn(),
    emergencyCancel: vi.fn(),
  },
}));

const mockTenantBookings = [
  {
    id: 'bk-t1',
    bookingCode: 'SGH-20261015-TNT1',
    status: 'WAITING_CONFIRMATION',
    checkInDate: '2026-10-15',
    checkOutDate: '2026-10-17',
    guestCount: 2,
    totalPrice: 1200000,
    property: { title: 'Villa Sentosa' },
    room: { name: 'Executive Suite' },
    user: { name: 'Andi Pratama', email: 'andi@test.com' },
    payment: { paymentMethod: 'MANUAL_TRANSFER', paymentProofUrl: 'https://cloudinary.com/proof.jpg' },
  },
];

function renderTenantOrders() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <TenantOrderManagementPage />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('TenantOrderManagementPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders table with tenant orders and action button', async () => {
    vi.mocked(bookingApi.getTenantBookings).mockResolvedValueOnce({
      success: true, message: 'OK', data: mockTenantBookings as any,
    });
    renderTenantOrders();
    await waitFor(() => {
      expect(screen.getByText('Kelola Pesanan Masuk')).toBeInTheDocument();
      expect(screen.getByText('SGH-20261015-TNT1')).toBeInTheDocument();
      expect(screen.getByText('Andi Pratama')).toBeInTheDocument();
      expect(screen.getByText('Villa Sentosa')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Tinjau/i })).toBeInTheDocument();
    });
  });

  it('opens approval modal when clicking Tinjau', async () => {
    vi.mocked(bookingApi.getTenantBookings).mockResolvedValueOnce({
      success: true, message: 'OK', data: mockTenantBookings as any,
    });
    renderTenantOrders();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Tinjau/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Tinjau/i }));
    await waitFor(() => {
      expect(screen.getByText(/Pesanan SGH-20261015-TNT1/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Setujui Bukti/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Tolak/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Batal Darurat/i })).not.toBeInTheDocument();
    });
  });

  it('shows Batal Darurat on PROCESSED booking and triggers emergency cancel', async () => {
    const processedBooking = [{ ...mockTenantBookings[0], status: 'PROCESSED' }];
    vi.mocked(bookingApi.getTenantBookings).mockResolvedValueOnce({
      success: true, message: 'OK', data: processedBooking as any,
    });
    renderTenantOrders();
    await waitFor(() => expect(screen.getByRole('button', { name: /Tinjau/i })).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /Tinjau/i }));
    await waitFor(() => expect(screen.getByRole('button', { name: /Batal Darurat/i })).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /Batal Darurat/i }));
    expect(screen.getByText('Alasan Pembatalan')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Batalkan Darurat/i })).toBeInTheDocument();
  });
});
