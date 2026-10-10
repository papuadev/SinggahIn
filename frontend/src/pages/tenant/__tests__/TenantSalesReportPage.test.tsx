import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TenantSalesReportPage } from '../TenantSalesReportPage';
import { reportApi } from '../../../modules/report/services/report.api';
import { propertyApi } from '../../../modules/property/services/property.api';

vi.mock('../../../modules/report/services/report.api', () => ({
  reportApi: { getSalesReport: vi.fn() },
}));

vi.mock('../../../modules/property/services/property.api', () => ({
  propertyApi: { getMyProperties: vi.fn() },
}));

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>
  );
}

describe('TenantSalesReportPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(propertyApi.getMyProperties).mockResolvedValue({ success: true, message: 'OK', data: [] });
    vi.mocked(reportApi.getSalesReport).mockResolvedValue({
      success: true, message: 'OK', data: { totalRevenue: 0, totalBookings: 0, breakdown: [] },
    });
  });

  it('renders sales report header, KPI cards, and breakdown table', async () => {
    vi.mocked(propertyApi.getMyProperties).mockResolvedValueOnce({
      success: true, message: 'OK', data: [{ id: 'prop-1', title: 'Villa Nuansa Asri' } as any],
    });
    vi.mocked(reportApi.getSalesReport).mockResolvedValueOnce({
      success: true, message: 'OK',
      data: { totalRevenue: 5000000, totalBookings: 2, breakdown: [{ id: 'prop-1', name: 'Villa Nuansa Asri', totalTransactions: 2, revenue: 5000000 }] },
    });
    renderWithProviders(<TenantSalesReportPage />);
    expect(screen.getByText('Laporan Penjualan')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getAllByText('Villa Nuansa Asri').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('2 Pesanan')).toBeInTheDocument();
    });
  });

  it('initializes with current month, current year, and date range', async () => {
    const now = new Date();
    renderWithProviders(<TenantSalesReportPage />);
    await waitFor(() => {
      expect(reportApi.getSalesReport).toHaveBeenCalledWith(
        expect.objectContaining({
          month: now.getMonth() + 1,
          year: now.getFullYear(),
          sortBy: 'TERTINGGI',
        })
      );
    });
  });

  it('allows changing groupBy filter to TRANSACTION', async () => {
    renderWithProviders(<TenantSalesReportPage />);
    const select = screen.getByDisplayValue('Per Properti');
    fireEvent.change(select, { target: { value: 'TRANSACTION' } });
    await waitFor(() => {
      expect(reportApi.getSalesReport).toHaveBeenCalledWith(expect.objectContaining({ groupBy: 'TRANSACTION' }));
    });
  });

  it('toggles all data mode to fetch all records without date filter', async () => {
    renderWithProviders(<TenantSalesReportPage />);
    const btn = screen.getByRole('button', { name: /semua data/i });
    fireEvent.click(btn);
    await waitFor(() => {
      expect(reportApi.getSalesReport).toHaveBeenCalledWith(
        expect.objectContaining({ allData: true, month: undefined, year: undefined, startDate: undefined, endDate: undefined })
      );
    });
  });

  it('allows changing sort option to TERENDAH', async () => {
    renderWithProviders(<TenantSalesReportPage />);
    const sortSelect = screen.getByDisplayValue('Tertinggi');
    fireEvent.change(sortSelect, { target: { value: 'TERENDAH' } });
    await waitFor(() => {
      expect(reportApi.getSalesReport).toHaveBeenCalledWith(expect.objectContaining({ sortBy: 'TERENDAH' }));
    });
  });

  it('allows customizing date range inputs directly', async () => {
    renderWithProviders(<TenantSalesReportPage />);
    const startInput = screen.getByLabelText('Dari Tanggal');
    fireEvent.change(startInput, { target: { value: '2026-10-15' } });
    await waitFor(() => {
      expect(reportApi.getSalesReport).toHaveBeenCalledWith(
        expect.objectContaining({ startDate: '2026-10-15' })
      );
    });
  });

  it('resets filters back to current month and year on reset button click', async () => {
    const now = new Date();
    renderWithProviders(<TenantSalesReportPage />);
    const sortSelect = screen.getByDisplayValue('Tertinggi');
    fireEvent.change(sortSelect, { target: { value: 'TERENDAH' } });
    await waitFor(() => {
      expect(sortSelect).toHaveValue('TERENDAH');
    });
    fireEvent.click(screen.getByRole('button', { name: /reset/i }));
    await waitFor(() => {
      expect(sortSelect).toHaveValue('TERTINGGI');
      expect(reportApi.getSalesReport).toHaveBeenCalledWith(
        expect.objectContaining({
          month: now.getMonth() + 1,
          year: now.getFullYear(),
          sortBy: 'TERTINGGI',
        })
      );
    });
  });
});
