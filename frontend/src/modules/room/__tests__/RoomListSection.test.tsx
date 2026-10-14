import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RoomListSection } from '../components/RoomListSection';
import { roomApi } from '../services/room.api';
import { Room } from '../room.types';

vi.mock('../services/room.api', () => ({
  roomApi: {
    getRoomsByProperty: vi.fn(),
    createRoom: vi.fn(),
    updateRoom: vi.fn(),
    deleteRoom: vi.fn(),
  },
}));

function renderWithClient(ui: React.ReactElement) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>);
}

function mockTenRooms(): Room[] {
  return Array.from({ length: 10 }, (_, i) => ({
    id: `room-${i + 1}`,
    propertyId: 'prop-1',
    name: `Tipe Kamar ${String.fromCharCode(65 + i)}`,
    basePrice: (i + 1) * 100000,
    capacity: (i % 4) + 1,
    totalUnits: (i % 3) + 1,
    description: `Deskripsi kamar ${i + 1}`,
  }));
}

let currentMockRooms: Room[] = mockTenRooms();

describe('RoomListSection Integration - Search, Sort & Pagination', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentMockRooms = mockTenRooms();
    vi.mocked(roomApi.getRoomsByProperty).mockImplementation(async (_propId, params) => {
      let list = [...currentMockRooms];
      if (params?.search) {
        const q = params.search.toLowerCase();
        list = list.filter((r) => r.name.toLowerCase().includes(q) || r.description?.toLowerCase().includes(q));
      }
      if (params?.sortBy === 'price_desc') {
        list.sort((a, b) => b.basePrice - a.basePrice);
      } else {
        list.sort((a, b) => a.basePrice - b.basePrice);
      }
      const page = params?.page || 1;
      const limit = params?.limit || 5;
      const start = (page - 1) * limit;
      const paginated = list.slice(start, start + limit);
      return {
        success: true,
        message: 'Success',
        data: paginated,
        meta: {
          page,
          limit,
          totalItems: list.length,
          totalPages: Math.max(1, Math.ceil(list.length / limit)),
        },
      };
    });
  });

  it('renders 10 rooms paginated with 5 items on page 1 and controls', async () => {
    renderWithClient(<RoomListSection propertyId="prop-1" />);

    await waitFor(() => {
      expect(screen.getByText('Tipe Kamar A')).toBeInTheDocument();
      expect(screen.getByText('Tipe Kamar E')).toBeInTheDocument();
      expect(screen.queryByText('Tipe Kamar F')).not.toBeInTheDocument();
      expect(screen.getByText(/1 - 5/)).toBeInTheDocument();
      expect(screen.getByText('10 Tipe')).toBeInTheDocument();
    });
  });

  it('navigates to page 2 when clicking page 2 button', async () => {
    renderWithClient(<RoomListSection propertyId="prop-1" />);
    await waitFor(() => expect(screen.getByText('Tipe Kamar A')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: 'Halaman 2' }));
    await waitFor(() => {
      expect(screen.getByText('Tipe Kamar F')).toBeInTheDocument();
      expect(screen.getByText('Tipe Kamar J')).toBeInTheDocument();
      expect(screen.queryByText('Tipe Kamar A')).not.toBeInTheDocument();
      expect(screen.getByText(/6 - 10/)).toBeInTheDocument();
    });
  });

  it('filters rooms when typing in search input', async () => {
    renderWithClient(<RoomListSection propertyId="prop-1" />);
    await waitFor(() => expect(screen.getByText('Tipe Kamar A')).toBeInTheDocument());

    const searchInput = screen.getByLabelText('Cari tipe kamar');
    fireEvent.change(searchInput, { target: { value: 'Kamar C' } });

    await waitFor(() => {
      expect(screen.getByText('Tipe Kamar C')).toBeInTheDocument();
      expect(screen.queryByText('Tipe Kamar A')).not.toBeInTheDocument();
      expect(screen.queryByText('Tipe Kamar B')).not.toBeInTheDocument();
    });
  });

  it('shows empty search state and resets search on button click', async () => {
    renderWithClient(<RoomListSection propertyId="prop-1" />);
    await waitFor(() => expect(screen.getByText('Tipe Kamar A')).toBeInTheDocument());

    const searchInput = screen.getByLabelText('Cari tipe kamar');
    fireEvent.change(searchInput, { target: { value: 'Tidak Ada Tipe Ini' } });

    await waitFor(() => {
      expect(screen.getByText('Tipe Kamar Tidak Ditemukan')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Bersihkan Pencarian/i }));
    await waitFor(() => {
      expect(screen.getByText('Tipe Kamar A')).toBeInTheDocument();
    });
  });

  it('sorts rooms when changing sort dropdown to price descending', async () => {
    renderWithClient(<RoomListSection propertyId="prop-1" />);
    await waitFor(() => expect(screen.getByText('Tipe Kamar A')).toBeInTheDocument());

    const sortSelect = screen.getByLabelText('Urutkan kamar');
    fireEvent.change(sortSelect, { target: { value: 'price_desc' } });

    await waitFor(() => {
      expect(screen.getByText('Tipe Kamar J')).toBeInTheDocument();
      expect(screen.queryByText('Tipe Kamar A')).not.toBeInTheDocument();
    });
  });
});
