import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TenantDashboardPage } from '../TenantDashboardPage';
import { propertyApi } from '../../../modules/property/services/property.api';

vi.mock('../../../modules/room/components/TenantRoomStatusCalendar', () => ({
  TenantRoomStatusCalendar: ({ propertyId, rooms }: { propertyId: string; rooms: any[] }) => (
    <div data-testid="mock-status-calendar">
      Calendar for {propertyId} with {rooms.length} rooms
    </div>
  ),
}));

vi.mock('../../../modules/property/services/property.api', () => ({
  propertyApi: {
    getMyProperties: vi.fn(),
    getPropertyById: vi.fn(),
  },
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
    createdAt: '2026-01-01',
    category: { id: 'c1', name: 'Villa', slug: 'villa' },
  },
  {
    id: 'prop-2',
    title: 'Hotel Bintang Lima',
    city: 'Jakarta',
    address: 'Jl. Sudirman No. 1',
    coverImage: null,
    createdAt: '2026-01-02',
    category: { id: 'c2', name: 'Hotel', slug: 'hotel' },
  },
];

const mockPropertyDetail = {
  id: 'prop-1',
  tenantId: 't1',
  categoryId: 'c1',
  title: 'Villa Nuansa Asri',
  description: 'Villa sejuk',
  address: 'Jl. Lembang No. 10',
  city: 'Bandung',
  latitude: -6.8,
  longitude: 107.6,
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
  rooms: [{ id: 'r1', name: 'Deluxe Room', basePrice: 400000, capacity: 2, totalUnits: 3 }],
};

describe('TenantDashboardPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders empty dashboard when tenant has no properties', async () => {
    vi.mocked(propertyApi.getMyProperties).mockResolvedValueOnce({
      success: true,
      message: 'OK',
      data: [],
    });

    renderWithProviders(<TenantDashboardPage />);
    await waitFor(() => {
      expect(screen.getByText('Belum Ada Properti Terdaftar')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Tambah Properti Sekarang/i })).toBeInTheDocument();
    });
  });

  it('renders selector and calendar when tenant has properties', async () => {
    vi.mocked(propertyApi.getMyProperties).mockResolvedValueOnce({
      success: true,
      message: 'OK',
      data: mockProperties as any,
    });
    vi.mocked(propertyApi.getPropertyById).mockResolvedValue({
      success: true,
      message: 'OK',
      data: mockPropertyDetail as any,
    });

    renderWithProviders(<TenantDashboardPage />);
    await waitFor(() => {
      expect(screen.getByText('Dasbor & Kalender Kamar')).toBeInTheDocument();
      expect(screen.getByLabelText(/Pilih Properti:/i)).toBeInTheDocument();
      expect(screen.getByTestId('mock-status-calendar')).toBeInTheDocument();
    });
    expect(screen.getByText('Calendar for prop-1 with 1 rooms')).toBeInTheDocument();
  });
});
