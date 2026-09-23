import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PropertyDetailFacilities } from '../PropertyDetailFacilities';

describe('PropertyDetailFacilities Component', () => {
  it('renders default facilities when facilities prop is not provided', () => {
    render(<PropertyDetailFacilities />);
    expect(screen.getByText('WiFi Kecepatan Tinggi')).toBeInTheDocument();
    expect(screen.getByText('Air Conditioning (AC)')).toBeInTheDocument();
    expect(screen.getByText('Kolam Renang')).toBeInTheDocument();
  });

  it('renders custom selected facilities when passed', () => {
    render(
      <PropertyDetailFacilities
        facilities={['Kolam Renang', 'Resepsionis 24 Jam']}
      />
    );
    expect(screen.getByText('Kolam Renang')).toBeInTheDocument();
    expect(screen.getByText('Resepsionis 24 Jam')).toBeInTheDocument();
    expect(screen.queryByText('WiFi Kecepatan Tinggi')).not.toBeInTheDocument();
  });

  it('renders fallback category when an unknown facility is passed', () => {
    render(
      <PropertyDetailFacilities
        facilities={['Bilyard & Game Room']}
      />
    );
    expect(screen.getByText('Bilyard & Game Room')).toBeInTheDocument();
    expect(screen.getByText('Fasilitas')).toBeInTheDocument();
  });
});
