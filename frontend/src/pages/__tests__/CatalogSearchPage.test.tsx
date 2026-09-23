import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CatalogSearchPage } from '../CatalogSearchPage';
import { propertyApi } from '../../modules/property/services/property.api';

vi.mock('../../modules/property/services/property.api', () => ({
  propertyApi: {
    getCatalog: vi.fn(),
    searchGeocode: vi.fn(),
  },
}));

const mockCatalogResponse = {
  success: true as const,
  message: 'OK',
  data: [
    {
      id: 'prop-1',
      title: 'Villa Nuansa Asri Dago',
      city: 'Bandung',
      address: 'Jl. Dago Atas No. 45',
      category: { name: 'Villa', slug: 'villa' },
      coverImage: 'https://images.unsplash.com/photo-1580587771525',
      averageRating: 4.8,
      totalReviews: 24,
      pricing: {
        averageNightRate: 750000,
        totalStayPrice: 2250000,
        totalNights: 3,
      },
    },
    {
      id: 'prop-2',
      title: 'Hotel Grand Royal',
      city: 'Bandung',
      address: 'Jl. Merdeka No. 10',
      category: { name: 'Hotel', slug: 'hotel' },
      coverImage: null,
      averageRating: 0,
      totalReviews: 0,
      pricing: {
        averageNightRate: 500000,
        totalStayPrice: 1500000,
        totalNights: 3,
      },
    },
  ],
  meta: {
    page: 1,
    limit: 12,
    totalItems: 2,
    totalPages: 1,
  },
};

function renderWithClient(ui: React.ReactElement, initialEntries = ['/search']) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>
    </QueryClientProvider>
  );
}

describe('CatalogSearchPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    vi.mocked(propertyApi.getCatalog).mockReturnValue(new Promise(() => {}));

    renderWithClient(<CatalogSearchPage />);

    expect(screen.getAllByLabelText(/Memuat penginapan/i).length).toBeGreaterThan(0);
  });

  it('renders property cards and result counter when data is fetched', async () => {
    vi.mocked(propertyApi.getCatalog).mockResolvedValueOnce(mockCatalogResponse);

    renderWithClient(<CatalogSearchPage />, ['/search?city=Bandung']);

    await waitFor(() => {
      expect(propertyApi.getCatalog).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
      expect(screen.getByText('Villa Nuansa Asri Dago')).toBeInTheDocument();
    });
  });

  it('renders empty state when no properties found', async () => {
    vi.mocked(propertyApi.getCatalog).mockResolvedValueOnce({
      success: true as const,
      message: 'OK',
      data: [],
      meta: { page: 1, limit: 12, totalItems: 0, totalPages: 0 },
    });

    renderWithClient(<CatalogSearchPage />, ['/search?city=Jayapura']);

    await waitFor(() => {
      expect(screen.getByText(/Tidak Ada Penginapan Ditemukan/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Reset Filter Pencarian/i })).toBeInTheDocument();
    });
  });

  it('updates sorting when sort select changes', async () => {
    vi.mocked(propertyApi.getCatalog).mockResolvedValue(mockCatalogResponse);

    renderWithClient(<CatalogSearchPage />);

    await waitFor(() => {
      expect(screen.getByText('Villa Nuansa Asri Dago')).toBeInTheDocument();
    });

    const sortSelect = screen.getByLabelText(/Urutkan hasil pencarian/i);
    fireEvent.change(sortSelect, { target: { value: 'price_desc' } });

    await waitFor(() => {
      expect(propertyApi.getCatalog).toHaveBeenCalledWith(
        expect.objectContaining({
          sortBy: 'price',
          sortOrder: 'desc',
        })
      );
    });
  });

  it('renders error state on API failure', async () => {
    vi.mocked(propertyApi.getCatalog).mockRejectedValueOnce(new Error('Network error'));

    renderWithClient(<CatalogSearchPage />);

    await waitFor(() => {
      expect(screen.getByText(/Gagal Memuat Penginapan/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Coba Lagi/i })).toBeInTheDocument();
    });
  });

  it('renders pagination when totalPages > 1', async () => {
    vi.mocked(propertyApi.getCatalog).mockResolvedValueOnce({
      ...mockCatalogResponse,
      meta: { page: 1, limit: 12, totalItems: 24, totalPages: 2 },
    });

    renderWithClient(<CatalogSearchPage />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Navigasi halaman properti/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Halaman 2' })).toBeInTheDocument();
    });
  });
});
