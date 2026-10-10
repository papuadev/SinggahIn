import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TenantOccupancyMatrixPage } from '../TenantOccupancyMatrixPage';
import { reportApi } from '../../../modules/report/services/report.api';
import { propertyApi } from '../../../modules/property/services/property.api';

vi.mock('../../../modules/report/services/report.api', () => ({
  reportApi: {
    getOccupancyMatrix: vi.fn(),
  },
}));

vi.mock('../../../modules/property/services/property.api', () => ({
  propertyApi: {
    getMyProperties: vi.fn(),
  },
}));

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>
  );
}

describe('TenantOccupancyMatrixPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders occupancy matrix page, rate banner, and grid table', async () => {
    vi.mocked(propertyApi.getMyProperties).mockResolvedValueOnce({
      success: true,
      message: 'OK',
      data: [{ id: 'prop-1', title: 'Villa Lembang' } as any],
    });
    vi.mocked(reportApi.getOccupancyMatrix).mockResolvedValueOnce({
      success: true,
      message: 'OK',
      data: {
        month: 10,
        year: 2026,
        totalDays: 31,
        occupancyRate: 50.0,
        matrix: [
          {
            propertyId: 'prop-1',
            propertyName: 'Villa Lembang',
            roomId: 'room-1',
            roomName: 'Deluxe Room',
            totalUnits: 1,
            days: [
              { date: '2026-10-01', day: 1, status: 'BOOKED', bookedUnits: 1, blockedUnits: 0, availableUnits: 0 },
              { date: '2026-10-02', day: 2, status: 'AVAILABLE', bookedUnits: 0, blockedUnits: 0, availableUnits: 1 },
            ],
          },
        ],
      },
    });

    renderWithProviders(<TenantOccupancyMatrixPage />);

    expect(screen.getByText('Matriks Okupansi Properti')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('50%')).toBeInTheDocument();
      expect(screen.getByText('Deluxe Room')).toBeInTheDocument();
      expect(screen.getByText('Villa Lembang (1 unit)')).toBeInTheDocument();
    });
  });

  it('allows changing month filter', async () => {
    vi.mocked(propertyApi.getMyProperties).mockResolvedValueOnce({ success: true, message: 'OK', data: [] });
    vi.mocked(reportApi.getOccupancyMatrix).mockResolvedValue({
      success: true,
      message: 'OK',
      data: { month: 11, year: 2026, totalDays: 30, occupancyRate: 0, matrix: [] },
    });

    renderWithProviders(<TenantOccupancyMatrixPage />);

    const monthSelect = screen.getByDisplayValue('Oktober');
    fireEvent.change(monthSelect, { target: { value: '11' } });

    await waitFor(() => {
      expect(reportApi.getOccupancyMatrix).toHaveBeenCalledWith(
        expect.objectContaining({ month: 11 })
      );
    });
  });
});
