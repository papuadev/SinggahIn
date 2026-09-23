import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PropertyCard } from '../PropertyCard';
import { CatalogPropertyItem } from '../../../modules/property/property.types';

const mockProperty: CatalogPropertyItem = {
  id: 'prop-101',
  title: 'Villa Nuansa Asri Dago',
  city: 'Bandung',
  address: 'Jl. Dago Atas No. 45',
  category: { name: 'Villa', slug: 'villa' },
  coverImage: 'https://images.unsplash.com/photo-1580587771525',
  averageRating: 4.85,
  totalReviews: 24,
  pricing: {
    averageNightRate: 750000,
    totalStayPrice: 2250000,
    totalNights: 3,
  },
};

describe('PropertyCard Organism', () => {
  it('renders property details, cover image, category badge, and location', () => {
    render(
      <MemoryRouter>
        <PropertyCard property={mockProperty} />
      </MemoryRouter>
    );

    expect(screen.getByText('Villa Nuansa Asri Dago')).toBeInTheDocument();
    expect(screen.getByText('Bandung')).toBeInTheDocument();
    expect(screen.getByText('Villa')).toBeInTheDocument();
    const img = screen.getByRole('img', { name: /Villa Nuansa Asri Dago/i });
    expect(img).toHaveAttribute('src', mockProperty.coverImage);
  });

  it('renders placeholder when cover image is null', () => {
    const propWithoutImage = { ...mockProperty, coverImage: null };
    render(
      <MemoryRouter>
        <PropertyCard property={propWithoutImage} />
      </MemoryRouter>
    );

    expect(screen.getByLabelText(/Foto placeholder Villa Nuansa Asri Dago/i)).toBeInTheDocument();
    expect(screen.getByText('Foto Belum Tersedia')).toBeInTheDocument();
  });

  it('renders average rating and reviews count when reviews exist', () => {
    render(
      <MemoryRouter>
        <PropertyCard property={mockProperty} />
      </MemoryRouter>
    );

    expect(screen.getByText('4.8')).toBeInTheDocument();
    expect(screen.getByText('(24)')).toBeInTheDocument();
  });

  it('renders Baru badge when property has zero reviews', () => {
    const newProperty = { ...mockProperty, averageRating: 0, totalReviews: 0 };
    render(
      <MemoryRouter>
        <PropertyCard property={newProperty} />
      </MemoryRouter>
    );

    expect(screen.getByText('Baru')).toBeInTheDocument();
  });

  it('displays dominant average night rate and multi-night total stay price', () => {
    render(
      <MemoryRouter>
        <PropertyCard property={mockProperty} />
      </MemoryRouter>
    );

    expect(screen.getByText(/Rp 750\.000/i)).toBeInTheDocument();
    expect(screen.getByText('/ malam')).toBeInTheDocument();
    expect(screen.getByText(/Total Rp 2\.250\.000 untuk 3 malam/i)).toBeInTheDocument();
  });

  it('preserves check-in and check-out query parameters in link destination', () => {
    render(
      <MemoryRouter>
        <PropertyCard
          property={mockProperty}
          checkIn="2026-10-01"
          checkOut="2026-10-04"
        />
      </MemoryRouter>
    );

    const link = screen.getByRole('link', { name: /Lihat detail Villa Nuansa Asri Dago/i });
    expect(link).toHaveAttribute(
      'href',
      '/properties/prop-101?checkIn=2026-10-01&checkOut=2026-10-04'
    );
  });
});
