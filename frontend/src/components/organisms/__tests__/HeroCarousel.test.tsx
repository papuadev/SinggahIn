import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HeroCarousel } from '../HeroCarousel';

describe('HeroCarousel Organism', () => {
  it('renders first promotional slide by default', () => {
    render(
      <MemoryRouter>
        <HeroCarousel />
      </MemoryRouter>
    );

    expect(screen.getByText('Staycation Hemat & Nyaman')).toBeInTheDocument();
    expect(screen.getByText('Promo Spesial')).toBeInTheDocument();
    expect(screen.getByText('Jelajahi Sekarang')).toBeInTheDocument();
  });

  it('navigates to next and previous slides using arrow controls', () => {
    render(
      <MemoryRouter>
        <HeroCarousel />
      </MemoryRouter>
    );

    const nextBtn = screen.getByRole('button', { name: /Slide berikutnya/i });
    fireEvent.click(nextBtn);

    expect(screen.getByText('Villa Liburan Keluarga')).toBeInTheDocument();
    expect(screen.getByText('Pilihan Keluarga')).toBeInTheDocument();

    const prevBtn = screen.getByRole('button', { name: /Slide sebelumnya/i });
    fireEvent.click(prevBtn);

    expect(screen.getByText('Staycation Hemat & Nyaman')).toBeInTheDocument();
  });

  it('jumps to specific slide when indicator dot is clicked', () => {
    render(
      <MemoryRouter>
        <HeroCarousel />
      </MemoryRouter>
    );

    const dot3 = screen.getByRole('button', { name: /Pindah ke slide 3/i });
    fireEvent.click(dot3);

    expect(screen.getByText('Penginapan Unik Nusantara')).toBeInTheDocument();
    expect(screen.getByText('Destinasi Favorit')).toBeInTheDocument();
  });

  it('calls onCtaClick handler with category when CTA button is clicked', () => {
    const mockCta = vi.fn();
    render(
      <MemoryRouter>
        <HeroCarousel onCtaClick={mockCta} />
      </MemoryRouter>
    );

    const ctaBtn = screen.getByRole('button', { name: 'Jelajahi Sekarang' });
    fireEvent.click(ctaBtn);

    expect(mockCta).toHaveBeenCalledWith('hotel');
  });
});
