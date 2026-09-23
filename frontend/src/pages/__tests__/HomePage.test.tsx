import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HomePage } from '../HomePage';

vi.mock('../../modules/property/services/property.api', () => ({
  propertyApi: {
    searchGeocode: vi.fn(),
  },
}));

describe('HomePage Landing Page', () => {
  it('renders landing page with HeroCarousel, FloatingSearchWidget, and ValueProps', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    // Hero Carousel
    expect(screen.getByText('Staycation Hemat & Nyaman')).toBeInTheDocument();

    // Floating Search Widget
    expect(screen.getByPlaceholderText(/Mau menginap di mana/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cari Penginapan/i })).toBeInTheDocument();

    // Value Props Section
    expect(screen.getByText('Mengapa Memilih SinggahIn?')).toBeInTheDocument();
    expect(screen.getByText('Harga Transparan & Dinamis')).toBeInTheDocument();
    expect(screen.getByText('Properti Terverifikasi')).toBeInTheDocument();
    expect(screen.getByText('Pembayaran Fleksibel & Aman')).toBeInTheDocument();
  });
});
