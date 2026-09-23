import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HomePage } from '../HomePage';

vi.mock('../../modules/property/services/property.api', () => ({
  propertyApi: {
    searchGeocode: vi.fn(),
    getCatalog: vi.fn().mockResolvedValue({
      success: true,
      message: 'OK',
      data: [
        {
          id: 'rec-1',
          title: 'Villa Nuansa Dago',
          city: 'Bandung',
          address: 'Jl. Dago',
          category: { name: 'Villa', slug: 'villa' },
          coverImage: null,
          averageRating: 4.9,
          totalReviews: 20,
          pricing: { averageNightRate: 800000, totalStayPrice: 800000, totalNights: 1 },
        },
      ],
      meta: { page: 1, limit: 4, totalItems: 1, totalPages: 1 },
    }),
  },
}));

describe('HomePage Landing Page', () => {
  it('renders landing page with HeroCarousel, FloatingSearchWidget, recommendations, and ValueProps', async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    // Hero Carousel
    expect(screen.getByText('Staycation Hemat & Nyaman')).toBeInTheDocument();

    // Floating Search Widget
    expect(screen.getByPlaceholderText(/Mau menginap di mana/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cari Penginapan/i })).toBeInTheDocument();

    // Recommendation Sections
    expect(screen.getByText('Favorit Tamu & Rating Tertinggi')).toBeInTheDocument();
    expect(screen.getByText('Jelajahi Penginapan Pilihan')).toBeInTheDocument();

    // Value Props Section
    expect(screen.getByText('Mengapa Memilih SinggahIn?')).toBeInTheDocument();
    expect(screen.getByText('Harga Transparan & Dinamis')).toBeInTheDocument();
    expect(screen.getByText('Properti Terverifikasi')).toBeInTheDocument();
    expect(screen.getByText('Pembayaran Fleksibel & Aman')).toBeInTheDocument();
  });
});
