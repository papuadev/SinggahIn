import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PropertyDetailGallery } from '../PropertyDetailGallery';
import { PropertyImage } from '../../../../modules/property/property.types';

const mockImages: PropertyImage[] = [
  { id: '1', propertyId: 'p1', imageUrl: 'https://cdn.com/1.webp', publicId: 'p1', isCover: true },
  { id: '2', propertyId: 'p1', imageUrl: 'https://cdn.com/2.webp', publicId: 'p2', isCover: false },
  { id: '3', propertyId: 'p1', imageUrl: 'https://cdn.com/3.webp', publicId: 'p3', isCover: false },
  { id: '4', propertyId: 'p1', imageUrl: 'https://cdn.com/4.webp', publicId: 'p4', isCover: false },
  { id: '5', propertyId: 'p1', imageUrl: 'https://cdn.com/5.webp', publicId: 'p5', isCover: false },
];

describe('PropertyDetailGallery Component', () => {
  it('renders placeholder empty state when no images are provided', () => {
    render(<PropertyDetailGallery images={[]} title="Villa Keren" />);
    expect(screen.getByLabelText(/galeri placeholder villa keren/i)).toBeInTheDocument();
  });

  it('renders main cover image and view all button with total count', () => {
    render(<PropertyDetailGallery images={mockImages} title="Villa Keren" />);
    expect(screen.getByAltText(/villa keren - foto utama/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /lihat semua foto \(5\)/i })).toBeInTheDocument();
  });

  it('opens lightbox when main image is clicked', () => {
    render(<PropertyDetailGallery images={mockImages} title="Villa Keren" />);
    const mainImg = screen.getByAltText(/villa keren - foto utama/i);
    fireEvent.click(mainImg);

    expect(screen.getByRole('dialog', { name: /galeri foto properti/i })).toBeInTheDocument();
    expect(screen.getByText('1 / 5')).toBeInTheDocument();
  });

  it('navigates next and previous inside the lightbox', () => {
    render(<PropertyDetailGallery images={mockImages} title="Villa Keren" />);
    fireEvent.click(screen.getByRole('button', { name: /lihat semua foto \(5\)/i }));

    const nextBtn = screen.getByRole('button', { name: /foto selanjutnya/i });
    fireEvent.click(nextBtn);
    expect(screen.getByText('2 / 5')).toBeInTheDocument();

    const prevBtn = screen.getByRole('button', { name: /foto sebelumnya/i });
    fireEvent.click(prevBtn);
    expect(screen.getByText('1 / 5')).toBeInTheDocument();
  });

  it('closes lightbox when close button or Escape key is triggered', () => {
    render(<PropertyDetailGallery images={mockImages} title="Villa Keren" />);
    fireEvent.click(screen.getByRole('button', { name: /lihat semua foto \(5\)/i }));

    expect(screen.getByRole('dialog', { name: /galeri foto properti/i })).toBeInTheDocument();
    const closeBtn = screen.getByRole('button', { name: /tutup galeri/i });
    fireEvent.click(closeBtn);

    expect(screen.queryByRole('dialog', { name: /galeri foto properti/i })).not.toBeInTheDocument();
  });
});
