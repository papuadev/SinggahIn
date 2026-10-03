import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HomePage } from '../HomePage';
import { propertyApi } from '../../modules/property/services/property.api';

vi.mock('../../modules/property/services/property.api', () => ({
  propertyApi: {
    searchGeocode: vi.fn(),
    getCatalog: vi.fn(),
  },
}));

const mockCatalogItem = {
  id: 'rec-1',
  title: 'Villa Nuansa Dago',
  city: 'Bandung',
  address: 'Jl. Dago',
  category: { name: 'Villa', slug: 'villa' },
  coverImage: null,
  averageRating: 4.9,
  totalReviews: 20,
  pricing: { averageNightRate: 800000, totalStayPrice: 800000, totalNights: 1 },
};

function renderHome(initialEntries = ['/']) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>
        <HomePage />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('HomePage Landing Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(propertyApi.getCatalog).mockResolvedValue({
      success: true,
      message: 'OK',
      data: [mockCatalogItem],
      meta: { page: 1, limit: 4, totalItems: 1, totalPages: 1 },
    });
  });

  it('renders landing page with HeroCarousel, FloatingSearchWidget, recommendations, and ValueProps', async () => {
    renderHome();

    expect(screen.getByText('Staycation Hemat & Nyaman')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Mau menginap di mana/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cari Penginapan/i })).toBeInTheDocument();
    expect(screen.getByText('Favorit Tamu & Rating Tertinggi')).toBeInTheDocument();
    expect(screen.getByText('Jelajahi Penginapan Pilihan')).toBeInTheDocument();
    expect(screen.getByText('Mengapa Memilih SinggahIn?')).toBeInTheDocument();
  });

  it('updates recommendations when a category filter chip is clicked', async () => {
    renderHome();

    const villaChip = screen.getByRole('button', { name: 'Villa' });
    fireEvent.click(villaChip);

    await waitFor(() => {
      expect(propertyApi.getCatalog).toHaveBeenCalledWith(
        expect.objectContaining({ category: 'villa' })
      );
    });
  });

  it('resets category filter when Semua chip is clicked', async () => {
    renderHome(['/?category=villa']);

    const allChip = screen.getByRole('button', { name: 'Semua' });
    fireEvent.click(allChip);

    await waitFor(() => {
      expect(propertyApi.getCatalog).toHaveBeenCalledWith(
        expect.objectContaining({ category: undefined })
      );
    });
  });

  it('renders empty category state with reset button when filtered category has 0 properties', async () => {
    vi.mocked(propertyApi.getCatalog).mockResolvedValue({
      success: true,
      message: 'OK',
      data: [],
      meta: { page: 1, limit: 4, totalItems: 0, totalPages: 0 },
    });

    renderHome(['/?category=homestay']);

    await waitFor(() => {
      expect(screen.getByText(/Belum ada properti untuk kategori/i)).toBeInTheDocument();
    });

    const resetBtn = screen.getByRole('button', { name: /Tampilkan Semua Penginapan/i });
    fireEvent.click(resetBtn);

    await waitFor(() => {
      expect(propertyApi.getCatalog).toHaveBeenCalledWith(
        expect.objectContaining({ category: undefined })
      );
    });
  });
});
