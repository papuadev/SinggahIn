import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TenantPropertyListPage } from '../TenantPropertyListPage';
import { propertyApi } from '../../../modules/property/services/property.api';

vi.mock('../../../modules/property/services/property.api', () => ({
  propertyApi: {
    getMyProperties: vi.fn(),
    deleteProperty: vi.fn(),
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

const mockProperty = {
  id: 'prop-123',
  tenantId: 'tenant-1',
  title: 'Villa Sunset Indah',
  description: 'Villa cantik tepi pantai dengan kolam renang pribadi.',
  categoryId: 'cat-villa',
  address: 'Jl. Pantai Kuta No. 88',
  city: 'Badung',
  latitude: -8.7,
  longitude: 115.1,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  category: { id: 'cat-villa', name: 'Villa', slug: 'villa', description: null },
};

describe('TenantPropertyListPage Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders empty state when property list is empty', async () => {
    vi.mocked(propertyApi.getMyProperties).mockResolvedValue({
      success: true,
      message: 'OK',
      data: [],
    });

    renderWithProviders(<TenantPropertyListPage />);
    await waitFor(() => {
      expect(screen.getByText('Belum Ada Properti')).toBeInTheDocument();
      expect(screen.getByText('Tambah Properti Pertama')).toBeInTheDocument();
    });
  });

  it('renders property card list with details', async () => {
    vi.mocked(propertyApi.getMyProperties).mockResolvedValue({
      success: true,
      message: 'OK',
      data: [mockProperty],
    });

    renderWithProviders(<TenantPropertyListPage />);
    await waitFor(() => {
      expect(screen.getByText('Villa Sunset Indah')).toBeInTheDocument();
      expect(screen.getByText('Badung')).toBeInTheDocument();
      expect(screen.getByText('Jl. Pantai Kuta No. 88')).toBeInTheDocument();
      expect(screen.getByText('Villa')).toBeInTheDocument();
    });
  });

  it('opens delete confirmation modal and executes delete mutation', async () => {
    vi.mocked(propertyApi.getMyProperties).mockResolvedValue({
      success: true,
      message: 'OK',
      data: [mockProperty],
    });
    vi.mocked(propertyApi.deleteProperty).mockResolvedValue({
      success: true,
      message: 'Deleted',
      data: null,
    });

    renderWithProviders(<TenantPropertyListPage />);
    await waitFor(() => {
      expect(screen.getByText('Villa Sunset Indah')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Hapus/i }));
    expect(screen.getByText(/Yakin ingin menghapus properti "Villa Sunset Indah"\?/i)).toBeInTheDocument();

    const confirmBtn = screen.getByRole('button', { name: 'Hapus Properti' });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(propertyApi.deleteProperty).toHaveBeenCalledWith('prop-123');
    });
  });
});
