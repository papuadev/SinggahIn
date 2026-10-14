import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TenantDashboardPage } from '../TenantDashboardPage';
import { propertyApi } from '../../../modules/property/services/property.api';
import { reportApi } from '../../../modules/report/services/report.api';
import { bookingApi } from '../../../modules/booking/services/booking.api';

vi.mock('../../../modules/property/services/property.api', () => ({
  propertyApi: { getMyProperties: vi.fn(), getPropertyById: vi.fn() },
}));

vi.mock('../../../modules/report/services/report.api', () => ({
  reportApi: { getSalesReport: vi.fn(), getOccupancyMatrix: vi.fn() },
}));

vi.mock('../../../modules/booking/services/booking.api', () => ({
  bookingApi: { getTenantBookings: vi.fn() },
}));

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>
  );
}

const mockProperties = [
  {
    id: 'prop-1',
    title: 'Villa Nuansa Asri',
    city: 'Bandung',
    address: 'Jl. Lembang No. 10',
    coverImage: null,
    averageRating: 4.9,
    totalReviews: 24,
    createdAt: '2026-01-01',
    category: { id: 'c1', name: 'Villa', slug: 'villa' },
  },
];

const mockSalesReport = {
  totalRevenue: 38400000,
  totalBookings: 1,
  breakdown: [
    {
      id: 'tx-1',
      bookingCode: 'BK-1001',
      propertyName: 'Villa Nuansa Asri',
      roomName: 'Deluxe Room',
      userName: 'Ardi Rahman',
      userEmail: 'ardi@test.com',
      checkInDate: '2026-10-15',
      checkOutDate: '2026-10-18',
      totalPrice: 38400000,
      paymentMethod: 'MANUAL_TRANSFER',
      status: 'PROCESSED',
      createdAt: new Date().toISOString(),
    },
  ],
};

const mockOccupancy = {
  month: 10,
  year: 2026,
  totalDays: 21,
  occupancyRate: 86,
  matrix: [],
};

const mockBookings = [
  {
    id: 'b-1',
    bookingCode: 'BK-1001',
    propertyId: 'prop-1',
    property: { id: 'prop-1', title: 'Villa Nuansa Asri', city: 'Bandung', address: 'Jl. Lembang' },
    room: { id: 'r-1', name: 'Deluxe Room', basePrice: 500000 },
    user: { id: 'u-1', name: 'Ardi Rahman', email: 'ardi@test.com' },
    checkInDate: '2026-10-15',
    checkOutDate: '2026-10-18',
    totalNights: 3,
    guestCount: 2,
    totalPrice: 1500000,
    status: 'PROCESSED' as const,
    createdAt: '2026-10-10',
  },
];

describe('TenantDashboardPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders empty dashboard when tenant has no properties', async () => {
    vi.mocked(propertyApi.getMyProperties).mockResolvedValueOnce({
      success: true, message: 'OK', data: [],
    });
    vi.mocked(reportApi.getSalesReport).mockResolvedValueOnce({
      success: true, message: 'OK', data: { totalRevenue: 0, totalBookings: 0, breakdown: [] },
    });
    vi.mocked(reportApi.getOccupancyMatrix).mockResolvedValueOnce({
      success: true, message: 'OK', data: { month: 10, year: 2026, totalDays: 31, occupancyRate: 0, matrix: [] },
    });
    vi.mocked(bookingApi.getTenantBookings).mockResolvedValue({
      success: true, message: 'OK', data: [], meta: { page: 1, limit: 10, totalItems: 0, totalPages: 0 },
    });

    renderWithProviders(<TenantDashboardPage />);
    await waitFor(() => {
      expect(screen.getByText('Belum Ada Properti Terdaftar')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Tambah Properti Sekarang/i })).toBeInTheDocument();
    });
  });

  it('renders property summary, bar chart, upcoming bookings, and active properties', async () => {
    vi.mocked(propertyApi.getMyProperties).mockResolvedValueOnce({
      success: true, message: 'OK', data: mockProperties as any,
    });
    vi.mocked(reportApi.getSalesReport).mockResolvedValueOnce({
      success: true, message: 'OK', data: mockSalesReport as any,
    });
    vi.mocked(reportApi.getOccupancyMatrix).mockResolvedValueOnce({
      success: true, message: 'OK', data: mockOccupancy as any,
    });
    vi.mocked(bookingApi.getTenantBookings).mockResolvedValue({
      success: true, message: 'OK', data: mockBookings as any, meta: { page: 1, limit: 5, totalItems: 1, totalPages: 1 },
    });

    renderWithProviders(<TenantDashboardPage />);
    await waitFor(() => {
      expect(screen.getByText('Ringkasan properti')).toBeInTheDocument();
    });
    expect(screen.getByText('Reservasi bulan ini')).toBeInTheDocument();
    expect(screen.getByText('86%')).toBeInTheDocument();
    expect(screen.getByText('Rating properti')).toBeInTheDocument();
    expect(screen.getAllByText('4.9')[0]).toBeInTheDocument();
    expect(screen.getByText('24 ulasan')).toBeInTheDocument();
    expect(screen.getByText('Reservasi mendatang')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Lihat semua/i })).toHaveAttribute('href', '/tenant/orders?status=PROCESSED&sortBy=checkIn_asc');
    expect(screen.getByText('Properti Anda')).toBeInTheDocument();
    expect(screen.getByText('Lihat dan kelola properti Anda')).toBeInTheDocument();
    expect(screen.getByText('Villa Nuansa Asri')).toBeInTheDocument();
  });

  it('allows changing month in dashboard filter', async () => {
    vi.mocked(propertyApi.getMyProperties).mockResolvedValue({
      success: true, message: 'OK', data: mockProperties as any,
    });
    vi.mocked(reportApi.getSalesReport).mockResolvedValue({
      success: true, message: 'OK', data: mockSalesReport as any,
    });
    vi.mocked(reportApi.getOccupancyMatrix).mockResolvedValue({
      success: true, message: 'OK', data: mockOccupancy as any,
    });
    vi.mocked(bookingApi.getTenantBookings).mockResolvedValue({
      success: true, message: 'OK', data: [], meta: { page: 1, limit: 5, totalItems: 0, totalPages: 0 },
    });

    renderWithProviders(<TenantDashboardPage />);
    await waitFor(() => {
      expect(screen.getByText('Ringkasan properti')).toBeInTheDocument();
    });

    const monthSelect = screen.getByRole('combobox', { name: /Pilih Bulan/i });
    expect(monthSelect).toBeInTheDocument();
  });
});
