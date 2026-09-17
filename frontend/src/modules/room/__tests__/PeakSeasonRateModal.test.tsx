import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PeakSeasonRateModal } from '../components/PeakSeasonRateModal';
import { pricingApi } from '../services/pricing.api';

vi.mock('../services/pricing.api', () => ({
  pricingApi: {
    getRoomRates: vi.fn(),
    createRoomRate: vi.fn(),
    deleteRoomRate: vi.fn(),
    bulkCreatePropertyRates: vi.fn(),
  },
}));

function renderModal(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

const mockRate = {
  id: 'rate-1',
  roomId: 'room-1',
  startDate: '2026-12-20',
  endDate: '2027-01-05',
  adjustmentType: 'PERCENTAGE' as const,
  adjustmentValue: 25,
  reason: 'Libur Akhir Tahun',
  createdAt: '2026-01-01',
};

describe('PeakSeasonRateModal Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders modal with title, form, and active rates list', async () => {
    vi.mocked(pricingApi.getRoomRates).mockResolvedValueOnce({
      success: true,
      message: 'OK',
      data: [mockRate],
    });

    renderModal(
      <PeakSeasonRateModal
        roomId="room-1"
        roomName="Deluxe King Bed"
        propertyId="prop-1"
        isOpen={true}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText(/Tarif Musiman: Deluxe King Bed/)).toBeInTheDocument();
    expect(screen.getByText('Tanggal Mulai')).toBeInTheDocument();
    expect(screen.getByText('Tipe Penyesuaian')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('+25%')).toBeInTheDocument();
      expect(screen.getByText('Libur Akhir Tahun')).toBeInTheDocument();
    });
  });

  it('submits a new peak rate', async () => {
    vi.mocked(pricingApi.getRoomRates).mockResolvedValue({
      success: true,
      message: 'OK',
      data: [],
    });
    vi.mocked(pricingApi.createRoomRate).mockResolvedValueOnce({
      success: true,
      message: 'Created',
      data: mockRate,
    });

    renderModal(
      <PeakSeasonRateModal
        roomId="room-1"
        roomName="Deluxe King Bed"
        propertyId="prop-1"
        isOpen={true}
        onClose={vi.fn()}
      />
    );

    const startInput = screen.getByLabelText(/Tanggal Mulai/i);
    const endInput = screen.getByLabelText(/Tanggal Selesai/i);
    fireEvent.change(startInput, { target: { value: '2026-12-20' } });
    fireEvent.change(endInput, { target: { value: '2027-01-05' } });

    fireEvent.click(screen.getByRole('button', { name: /Simpan Tarif Musiman/i }));

    await waitFor(() => {
      expect(pricingApi.createRoomRate).toHaveBeenCalled();
    });
  });

  it('submits a nominal rate (+Rp 150.000) for holiday', async () => {
    vi.mocked(pricingApi.getRoomRates).mockResolvedValue({
      success: true,
      message: 'OK',
      data: [],
    });
    vi.mocked(pricingApi.createRoomRate).mockResolvedValueOnce({
      success: true,
      message: 'Created',
      data: { ...mockRate, adjustmentType: 'NOMINAL', adjustmentValue: 150000 },
    });

    renderModal(
      <PeakSeasonRateModal
        roomId="room-1"
        roomName="Deluxe King Bed"
        propertyId="prop-1"
        isOpen={true}
        onClose={vi.fn()}
      />
    );

    fireEvent.change(screen.getByLabelText(/Tanggal Mulai/i), { target: { value: '2026-05-01' } });
    fireEvent.change(screen.getByLabelText(/Tanggal Selesai/i), { target: { value: '2026-05-05' } });
    fireEvent.change(screen.getByLabelText(/Tipe Penyesuaian/i), { target: { value: 'NOMINAL' } });
    fireEvent.change(screen.getByLabelText(/Nominal \(Rp\)/i), { target: { value: '150000' } });

    fireEvent.click(screen.getByRole('button', { name: /Simpan Tarif Musiman/i }));

    await waitFor(() => {
      expect(pricingApi.createRoomRate).toHaveBeenCalledWith(
        'room-1',
        expect.objectContaining({
          startDate: '2026-05-01',
          endDate: '2026-05-05',
          adjustmentType: 'NOMINAL',
          adjustmentValue: 150000,
        })
      );
    });
  });

  it('deletes a peak rate when delete button is clicked', async () => {
    vi.mocked(pricingApi.getRoomRates).mockResolvedValue({
      success: true,
      message: 'OK',
      data: [mockRate],
    });
    vi.mocked(pricingApi.deleteRoomRate).mockResolvedValueOnce({
      success: true,
      message: 'Deleted',
      data: null,
    });

    renderModal(
      <PeakSeasonRateModal
        roomId="room-1"
        roomName="Deluxe King Bed"
        propertyId="prop-1"
        isOpen={true}
        onClose={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('+25%')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Hapus tarif' }));

    await waitFor(() => {
      expect(pricingApi.deleteRoomRate).toHaveBeenCalledWith('room-1', 'rate-1');
    });
  });
});
