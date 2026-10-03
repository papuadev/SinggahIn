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

describe('RoomListSection Integration - Search, Sort & Pagination', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders 10 rooms paginated with 5 items on page 1 and controls', async () => {
    vi.mocked(roomApi.getRoomsByProperty).mockResolvedValueOnce({
      success: true,
      message: 'Success',
      data: mockTenRooms(),
    });

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
    vi.mocked(roomApi.getRoomsByProperty).mockResolvedValueOnce({
      success: true,
      message: 'Success',
      data: mockTenRooms(),
    });

    renderWithClient(<RoomListSection propertyId="prop-1" />);
    await waitFor(() => expect(screen.getByText('Tipe Kamar A')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: 'Halaman 2' }));
    expect(screen.getByText('Tipe Kamar F')).toBeInTheDocument();
    expect(screen.getByText('Tipe Kamar J')).toBeInTheDocument();
    expect(screen.queryByText('Tipe Kamar A')).not.toBeInTheDocument();
    expect(screen.getByText(/6 - 10/)).toBeInTheDocument();
  });

  it('filters rooms when typing in search input', async () => {
    vi.mocked(roomApi.getRoomsByProperty).mockResolvedValueOnce({
      success: true,
      message: 'Success',
      data: mockTenRooms(),
    });

    renderWithClient(<RoomListSection propertyId="prop-1" />);
    await waitFor(() => expect(screen.getByText('Tipe Kamar A')).toBeInTheDocument());

    const searchInput = screen.getByLabelText('Cari tipe kamar');
    fireEvent.change(searchInput, { target: { value: 'Kamar C' } });

    expect(screen.getByText('Tipe Kamar C')).toBeInTheDocument();
    expect(screen.queryByText('Tipe Kamar A')).not.toBeInTheDocument();
    expect(screen.queryByText('Tipe Kamar B')).not.toBeInTheDocument();
  });

  it('shows empty search state and resets search on button click', async () => {
    vi.mocked(roomApi.getRoomsByProperty).mockResolvedValueOnce({
      success: true,
      message: 'Success',
      data: mockTenRooms(),
    });

    renderWithClient(<RoomListSection propertyId="prop-1" />);
    await waitFor(() => expect(screen.getByText('Tipe Kamar A')).toBeInTheDocument());

    const searchInput = screen.getByLabelText('Cari tipe kamar');
    fireEvent.change(searchInput, { target: { value: 'Tidak Ada Tipe Ini' } });

    expect(screen.getByText('Tipe Kamar Tidak Ditemukan')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Bersihkan Pencarian/i }));
    expect(screen.getByText('Tipe Kamar A')).toBeInTheDocument();
  });

  it('sorts rooms when changing sort dropdown to price descending', async () => {
    vi.mocked(roomApi.getRoomsByProperty).mockResolvedValueOnce({
      success: true,
      message: 'Success',
      data: mockTenRooms(),
    });

    renderWithClient(<RoomListSection propertyId="prop-1" />);
    await waitFor(() => expect(screen.getByText('Tipe Kamar A')).toBeInTheDocument());

    const sortSelect = screen.getByLabelText('Urutkan kamar');
    fireEvent.change(sortSelect, { target: { value: 'price_desc' } });

    expect(screen.getByText('Tipe Kamar J')).toBeInTheDocument();
    expect(screen.queryByText('Tipe Kamar A')).not.toBeInTheDocument();
  });
});
