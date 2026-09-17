import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RoomUnavailabilityModal } from '../components/RoomUnavailabilityModal';
import { pricingApi } from '../services/pricing.api';

vi.mock('../services/pricing.api', () => ({
  pricingApi: {
    getRoomUnavailabilities: vi.fn(),
    createRoomUnavailability: vi.fn(),
    deleteRoomUnavailability: vi.fn(),
  },
}));

function renderModal(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

const mockUnavailability = {
  id: 'u-1',
  roomId: 'room-1',
  startDate: '2026-10-01',
  endDate: '2026-10-07',
  reason: 'Renovasi Kamar Mandi',
  createdAt: '2026-01-01',
};

describe('RoomUnavailabilityModal Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders modal with title, form, and active unavailabilities', async () => {
    vi.mocked(pricingApi.getRoomUnavailabilities).mockResolvedValueOnce({
      success: true,
      message: 'OK',
      data: [mockUnavailability],
    });

    renderModal(
      <RoomUnavailabilityModal
        roomId="room-1"
        roomName="Deluxe King Bed"
        isOpen={true}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText(/Blokir Tanggal: Deluxe King Bed/)).toBeInTheDocument();
    expect(screen.getByText('Tanggal Mulai')).toBeInTheDocument();
    expect(screen.getByText('Tanggal Selesai')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Diblokir')).toBeInTheDocument();
      expect(screen.getByText('Renovasi Kamar Mandi')).toBeInTheDocument();
    });
  });

  it('submits a new unavailability block', async () => {
    vi.mocked(pricingApi.getRoomUnavailabilities).mockResolvedValue({
      success: true,
      message: 'OK',
      data: [],
    });
    vi.mocked(pricingApi.createRoomUnavailability).mockResolvedValueOnce({
      success: true,
      message: 'Created',
      data: mockUnavailability,
    });

    renderModal(
      <RoomUnavailabilityModal
        roomId="room-1"
        roomName="Deluxe King Bed"
        isOpen={true}
        onClose={vi.fn()}
      />
    );

    const startInput = screen.getByLabelText(/Tanggal Mulai/i);
    const endInput = screen.getByLabelText(/Tanggal Selesai/i);
    fireEvent.change(startInput, { target: { value: '2026-10-01' } });
    fireEvent.change(endInput, { target: { value: '2026-10-07' } });

    fireEvent.click(screen.getByRole('button', { name: /Simpan Pemblokiran Tanggal/i }));

    await waitFor(() => {
      expect(pricingApi.createRoomUnavailability).toHaveBeenCalledWith('room-1', {
        startDate: '2026-10-01',
        endDate: '2026-10-07',
        reason: undefined,
      });
    });
  });

  it('deletes an unavailability when delete button is clicked', async () => {
    vi.mocked(pricingApi.getRoomUnavailabilities).mockResolvedValue({
      success: true,
      message: 'OK',
      data: [mockUnavailability],
    });
    vi.mocked(pricingApi.deleteRoomUnavailability).mockResolvedValueOnce({
      success: true,
      message: 'Deleted',
      data: null,
    });

    renderModal(
      <RoomUnavailabilityModal
        roomId="room-1"
        roomName="Deluxe King Bed"
        isOpen={true}
        onClose={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Diblokir')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Batalkan blokir' }));

    await waitFor(() => {
      expect(pricingApi.deleteRoomUnavailability).toHaveBeenCalledWith('room-1', 'u-1');
    });
  });
});
