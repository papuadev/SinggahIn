import { it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PropertyDetailRoomList } from '../PropertyDetailRoomList';
import { PropertyRoomSummary } from '../../../../modules/property/property.types';
import { Room } from '../../../../modules/room/room.types';
import { pricingApi } from '../../../../modules/room/services/pricing.api';
import { roomApi } from '../../../../modules/room/services/room.api';

vi.mock('../../../../modules/room/services/room.api', () => ({
  roomApi: {
    getRoomsByProperty: vi.fn(),
  },
}));

let currentRooms: PropertyRoomSummary[] = [];

function createMockRooms(count = 3): Room[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `rm-${i + 1}`,
    propertyId: 'prop-123',
    name: `Room ${String.fromCharCode(65 + i)}`,
    basePrice: (i + 1) * 200000,
    capacity: (i % 3) + 1,
    totalUnits: (i % 2) + 2,
    description: `Description for Room ${String.fromCharCode(65 + i)}`,
  }));
}

function renderList(rooms: Room[] = [], onBook = vi.fn()) {
  currentRooms = rooms;
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <PropertyDetailRoomList
        propertyId="prop-123"
        rooms={rooms}
        checkIn="2026-10-10"
        checkOut="2026-10-12"
        onBookRoom={onBook}
      />
    </QueryClientProvider>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(roomApi.getRoomsByProperty).mockImplementation(async (_propId, params) => {
    let result = [...currentRooms];
    if (params?.search) {
      const q = params.search.toLowerCase();
      result = result.filter(
        (r) => r.name.toLowerCase().includes(q) || r.description?.toLowerCase().includes(q)
      );
    }
    if (params?.sortBy === 'price_desc') {
      result.sort((a, b) => b.basePrice - a.basePrice);
    } else if (params?.sortBy === 'name_desc') {
      result.sort((a, b) => b.name.localeCompare(a.name));
    } else if (params?.sortBy === 'name_asc') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (params?.sortBy === 'units_desc') {
      result.sort((a, b) => b.totalUnits - a.totalUnits);
    } else {
      result.sort((a, b) => a.basePrice - b.basePrice);
    }
    const page = params?.page || 1;
    const limit = params?.limit || 5;
    const start = (page - 1) * limit;
    const paginated = result.slice(start, start + limit) as Room[];
    return {
      success: true,
      message: 'OK',
      data: paginated,
      meta: {
        page,
        limit,
        totalItems: result.length,
        totalPages: Math.max(1, Math.ceil(result.length / limit)),
      },
    };
  });

  vi.spyOn(pricingApi, 'calculateStayPricing').mockResolvedValue({
    success: true, message: 'OK',
    data: {
      roomId: 'rm-1', checkInDate: '2026-10-10', checkOutDate: '2026-10-12',
      totalNights: 2, basePrice: 200000, averageNightRate: 200000, totalStayPrice: 400000,
      dailyBreakdown: [],
    },
  });
});

it('renders empty state when rooms array is empty', () => {
  renderList([]);
  expect(screen.getByText('Belum Ada Tipe Kamar')).toBeInTheDocument();
});

it('renders room controls and dates badge', () => {
  renderList(createMockRooms(2));
  expect(screen.getByPlaceholderText('Cari tipe kamar...')).toBeInTheDocument();
  expect(screen.getByLabelText('Urutkan kamar')).toBeInTheDocument();
  expect(screen.getByText('2026-10-10 - 2026-10-12')).toBeInTheDocument();
});

it('sorts rooms by price descending', () => {
  renderList(createMockRooms(3));
  const select = screen.getByLabelText('Urutkan kamar');
  fireEvent.change(select, { target: { value: 'price_desc' } });
  const headings = screen.getAllByRole('heading', { level: 3 });
  expect(headings[0]).toHaveTextContent('Room C');
  expect(headings[2]).toHaveTextContent('Room A');
});

it('sorts rooms by name descending', () => {
  renderList(createMockRooms(3));
  const select = screen.getByLabelText('Urutkan kamar');
  fireEvent.change(select, { target: { value: 'name_desc' } });
  const headings = screen.getAllByRole('heading', { level: 3 });
  expect(headings[0]).toHaveTextContent('Room C');
});

it('filters rooms by search query', () => {
  renderList(createMockRooms(3));
  const searchInput = screen.getByPlaceholderText('Cari tipe kamar...');
  fireEvent.change(searchInput, { target: { value: 'Room B' } });
  expect(screen.getByText('Room B')).toBeInTheDocument();
  expect(screen.queryByText('Room A')).not.toBeInTheDocument();
  expect(screen.queryByText('Room C')).not.toBeInTheDocument();
});

it('shows empty search result and clears query on reset', () => {
  renderList(createMockRooms(3));
  const searchInput = screen.getByPlaceholderText('Cari tipe kamar...');
  fireEvent.change(searchInput, { target: { value: 'NonExistent' } });
  expect(screen.getByText('Tipe Kamar Tidak Ditemukan')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /bersihkan pencarian/i }));
  expect(screen.getByText('Room A')).toBeInTheDocument();
});

it('paginates rooms when count exceeds page size', () => {
  renderList(createMockRooms(7));
  expect(screen.getByText('Room A')).toBeInTheDocument();
  expect(screen.queryByText('Room F')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Halaman 2' }));
  expect(screen.getByText('Room F')).toBeInTheDocument();
  expect(screen.queryByText('Room A')).not.toBeInTheDocument();
});

it('triggers onBookRoom when Pesan Sekarang button is clicked', () => {
  const handleBook = vi.fn();
  renderList(createMockRooms(1), handleBook);
  fireEvent.click(screen.getByRole('button', { name: /pesan sekarang/i }));
  expect(handleBook).toHaveBeenCalledWith('rm-1');
});

it('renders dynamic pricing when dates are selected', async () => {
  vi.spyOn(pricingApi, 'calculateStayPricing').mockResolvedValueOnce({
    success: true, message: 'OK',
    data: {
      roomId: 'rm-1', checkInDate: '2026-10-10', checkOutDate: '2026-10-12',
      totalNights: 2, basePrice: 200000, averageNightRate: 250000, totalStayPrice: 500000,
      dailyBreakdown: [],
    },
  });
  renderList(createMockRooms(1));
  await waitFor(() => {
    expect(screen.getByText(/Tarif rata-rata/i)).toBeInTheDocument();
    expect(screen.getByText(/500\.000/i)).toBeInTheDocument();
  });
});

it('queries server-side API with search, sort, and pagination parameters', async () => {
  renderList(createMockRooms(5));
  await waitFor(() => {
    expect(roomApi.getRoomsByProperty).toHaveBeenCalledWith(
      'prop-123',
      expect.objectContaining({
        page: 1,
        limit: 5,
        sortBy: 'price_asc',
      })
    );
  });

  const searchInput = screen.getByPlaceholderText('Cari tipe kamar...');
  fireEvent.change(searchInput, { target: { value: 'Room C' } });

  await waitFor(() => {
    expect(roomApi.getRoomsByProperty).toHaveBeenCalledWith(
      'prop-123',
      expect.objectContaining({
        search: 'Room C',
        page: 1,
      })
    );
  });

  const select = screen.getByLabelText('Urutkan kamar');
  fireEvent.change(select, { target: { value: 'price_desc' } });

  await waitFor(() => {
    expect(roomApi.getRoomsByProperty).toHaveBeenCalledWith(
      'prop-123',
      expect.objectContaining({
        sortBy: 'price_desc',
      })
    );
  });
});
