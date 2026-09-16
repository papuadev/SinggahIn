import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RoomCard } from '../components/RoomCard';
import { RoomDeleteConfirmModal } from '../components/RoomDeleteConfirmModal';
import { RoomFormModal } from '../components/RoomFormModal';
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
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

const mockRoom: Room = {
  id: 'room-1',
  propertyId: 'prop-1',
  name: 'Deluxe Queen Room',
  basePrice: 350000,
  capacity: 2,
  totalUnits: 5,
  description: 'Kamar nyaman dengan pemandangan taman.',
};

describe('RoomCard Component', () => {
  it('renders room details and triggers callbacks', () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    render(<RoomCard room={mockRoom} onEdit={onEdit} onDelete={onDelete} />);

    expect(screen.getByText('Deluxe Queen Room')).toBeInTheDocument();
    expect(screen.getByText(/350\.000/)).toBeInTheDocument();
    expect(screen.getByText('2 Tamu')).toBeInTheDocument();
    expect(screen.getByText('5 Unit Tersedia')).toBeInTheDocument();
    expect(screen.getByText('Kamar nyaman dengan pemandangan taman.')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Ubah'));
    expect(onEdit).toHaveBeenCalledWith(mockRoom);

    fireEvent.click(screen.getByText('Hapus'));
    expect(onDelete).toHaveBeenCalledWith(mockRoom);
  });
});

describe('RoomDeleteConfirmModal Component', () => {
  it('renders prompt and handles confirm & cancel', () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn();
    render(
      <RoomDeleteConfirmModal
        room={mockRoom}
        isOpen={true}
        onClose={onClose}
        onConfirm={onConfirm}
      />
    );

    expect(screen.getByText('Hapus Tipe Kamar')).toBeInTheDocument();
    expect(screen.getByText('Deluxe Queen Room')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Batal'));
    expect(onClose).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByText('Ya, Hapus Kamar'));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});

describe('RoomFormModal Component', () => {
  it('renders inputs, populates initialData and submits', async () => {
    const onSubmit = vi.fn();
    const onClose = vi.fn();
    render(
      <RoomFormModal
        isOpen={true}
        onClose={onClose}
        onSubmit={onSubmit}
        initialData={mockRoom}
      />
    );

    const nameInput = screen.getByDisplayValue('Deluxe Queen Room');
    const priceInput = screen.getByDisplayValue('350000');
    expect(nameInput).toBeInTheDocument();
    expect(priceInput).toBeInTheDocument();

    fireEvent.change(nameInput, { target: { value: 'Deluxe King Suite' } });
    fireEvent.click(screen.getByText('Simpan Kamar'));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
    });
  });
});

describe('RoomListSection Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders empty state when no rooms are returned', async () => {
    vi.mocked(roomApi.getRoomsByProperty).mockResolvedValueOnce({
      success: true,
      message: 'Success',
      data: [],
    });

    renderWithClient(<RoomListSection propertyId="prop-1" />);

    await waitFor(() => {
      expect(screen.getByText('Belum Ada Tipe Kamar')).toBeInTheDocument();
    });
  });

  it('renders rooms list when data is available', async () => {
    vi.mocked(roomApi.getRoomsByProperty).mockResolvedValueOnce({
      success: true,
      message: 'Success',
      data: [mockRoom],
    });

    renderWithClient(<RoomListSection propertyId="prop-1" />);

    await waitFor(() => {
      expect(screen.getByText('Deluxe Queen Room')).toBeInTheDocument();
      expect(screen.getByText('1 Tipe')).toBeInTheDocument();
    });
  });
});
