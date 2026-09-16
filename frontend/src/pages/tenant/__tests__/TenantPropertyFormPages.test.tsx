import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TenantPropertyCreatePage } from '../TenantPropertyCreatePage';
import { TenantPropertyEditPage } from '../TenantPropertyEditPage';
import { propertyApi } from '../../../modules/property/services/property.api';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: 'prop-123' }),
  };
});

vi.mock('../../../modules/property/components/PropertyForm', () => ({
  PropertyForm: ({ onSubmit, initialData }: { onSubmit: (data: any) => void; initialData?: any }) => (
    <div data-testid="mock-property-form">
      <span>{initialData?.title}</span>
      <button
        type="button"
        onClick={() =>
          onSubmit({
            title: 'Properti Test',
            description: 'Deskripsi lengkap 12345',
            categoryId: 'cat-villa',
            address: 'Jl. Merdeka No. 1',
            city: 'Bandung',
            latitude: -6.9,
            longitude: 107.6,
          })
        }
      >
        Submit Form
      </button>
    </div>
  ),
}));

vi.mock('../../../modules/property/components/PropertyGalleryManager', () => ({
  PropertyGalleryManager: ({ propertyId }: { propertyId: string }) => (
    <div data-testid="mock-gallery-manager">Gallery for {propertyId}</div>
  ),
}));

vi.mock('../../../modules/room/components/RoomListSection', () => ({
  RoomListSection: ({ propertyId }: { propertyId: string }) => (
    <div data-testid="mock-rooms-section">Rooms for {propertyId}</div>
  ),
}));

vi.mock('../../../modules/property/services/property.api', () => ({
  propertyApi: {
    createProperty: vi.fn(),
    getPropertyById: vi.fn(),
    updateProperty: vi.fn(),
  },
}));

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>
  );
}

describe('Tenant Property Create & Edit Pages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders TenantPropertyCreatePage and creates property on submit', async () => {
    vi.mocked(propertyApi.createProperty).mockResolvedValue({
      success: true,
      message: 'Created',
      data: { id: 'new-prop' } as any,
    });

    renderWithProviders(<TenantPropertyCreatePage />);
    expect(screen.getByText('Tambah Properti Baru')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Submit Form' }));
    await waitFor(() => {
      expect(propertyApi.createProperty).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith('/tenant/properties');
    });
  });

  it('renders TenantPropertyEditPage with property data and updates on submit', async () => {
    vi.mocked(propertyApi.getPropertyById).mockResolvedValue({
      success: true,
      message: 'OK',
      data: {
        id: 'prop-123',
        tenantId: 'tenant-1',
        title: 'Villa Nuansa Asri',
        description: 'Villa sejuk di pegunungan',
        categoryId: 'cat-villa',
        address: 'Jl. Lembang No. 10',
        city: 'Bandung',
        latitude: -6.8,
        longitude: 107.6,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      },
    });
    vi.mocked(propertyApi.updateProperty).mockResolvedValue({
      success: true,
      message: 'Updated',
      data: { id: 'prop-123' } as any,
    });

    renderWithProviders(<TenantPropertyEditPage />);
    await waitFor(() => {
      expect(screen.getByText('Ubah Properti')).toBeInTheDocument();
      expect(screen.getByText('Villa Nuansa Asri')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Submit Form' }));
    await waitFor(() => {
      expect(propertyApi.updateProperty).toHaveBeenCalledWith('prop-123', expect.any(Object));
      expect(mockNavigate).toHaveBeenCalledWith('/tenant/properties');
    });
  });

  it('switches tabs between info, gallery, and rooms in TenantPropertyEditPage', async () => {
    vi.mocked(propertyApi.getPropertyById).mockResolvedValue({
      success: true,
      message: 'OK',
      data: {
        id: 'prop-123',
        tenantId: 'tenant-1',
        title: 'Villa Nuansa Asri',
        description: 'Villa sejuk di pegunungan',
        categoryId: 'cat-villa',
        address: 'Jl. Lembang No. 10',
        city: 'Bandung',
        latitude: -6.8,
        longitude: 107.6,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
        images: [],
      },
    });

    renderWithProviders(<TenantPropertyEditPage />);
    await waitFor(() => {
      expect(screen.getByText('Informasi Dasar')).toBeInTheDocument();
      expect(screen.getByTestId('mock-property-form')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Galeri Foto/i }));
    expect(screen.getByTestId('mock-gallery-manager')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Tipe & Tarif Kamar/i }));
    expect(screen.getByTestId('mock-rooms-section')).toBeInTheDocument();
  });
});
