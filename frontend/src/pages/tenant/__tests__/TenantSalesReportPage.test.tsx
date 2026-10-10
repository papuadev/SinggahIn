import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TenantSalesReportPage } from '../TenantSalesReportPage';
import { reportApi } from '../../../modules/report/services/report.api';
import { propertyApi } from '../../../modules/property/services/property.api';

vi.mock('../../../modules/report/services/report.api', () => ({
  reportApi: {
    getSalesReport: vi.fn(),
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

describe('TenantSalesReportPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders sales report header, KPI cards, and breakdown table', async () => {
    vi.mocked(propertyApi.getMyProperties).mockResolvedValueOnce({
      success: true,
      message: 'OK',
      data: [{ id: 'prop-1', title: 'Villa Nuansa Asri' } as any],
    });
    vi.mocked(reportApi.getSalesReport).mockResolvedValueOnce({
      success: true,
      message: 'OK',
      data: {
        totalRevenue: 5000000,
        totalBookings: 2,
        breakdown: [
          { id: 'prop-1', name: 'Villa Nuansa Asri', totalTransactions: 2, revenue: 5000000 },
        ],
      },
    });

    renderWithProviders(<TenantSalesReportPage />);

    expect(screen.getByText('Laporan Penjualan')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getAllByText('Villa Nuansa Asri').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('2 Pesanan')).toBeInTheDocument();
    });
  });

  it('allows changing groupBy filter to TRANSACTION', async () => {
    vi.mocked(propertyApi.getMyProperties).mockResolvedValueOnce({ success: true, message: 'OK', data: [] });
    vi.mocked(reportApi.getSalesReport).mockResolvedValue({
      success: true,
      message: 'OK',
      data: { totalRevenue: 0, totalBookings: 0, breakdown: [] },
    });

    renderWithProviders(<TenantSalesReportPage />);

    const select = screen.getByDisplayValue('Per Properti');
    fireEvent.change(select, { target: { value: 'TRANSACTION' } });

    await waitFor(() => {
      expect(reportApi.getSalesReport).toHaveBeenCalledWith(
        expect.objectContaining({ groupBy: 'TRANSACTION' })
      );
    });
  });
});
