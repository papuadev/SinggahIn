import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PropertyFacilitiesSelector } from '../components/PropertyFacilitiesSelector';

describe('PropertyFacilitiesSelector Component', () => {
  it('renders all 8 available facility chips', () => {
    render(<PropertyFacilitiesSelector onChange={vi.fn()} />);
    expect(screen.getByText('WiFi')).toBeInTheDocument();
    expect(screen.getByText('AC')).toBeInTheDocument();
    expect(screen.getByText('Kolam Renang')).toBeInTheDocument();
    expect(screen.getByText('Parkir Gratis')).toBeInTheDocument();
    expect(screen.getByText('Resepsionis 24 Jam')).toBeInTheDocument();
    expect(screen.getByText('Dapur')).toBeInTheDocument();
    expect(screen.getByText('Smart TV')).toBeInTheDocument();
    expect(screen.getByText('Keamanan 24 Jam')).toBeInTheDocument();
  });

  it('selects facility chip and triggers onChange with added item', () => {
    const handleChange = vi.fn();
    render(<PropertyFacilitiesSelector selected={['WiFi Kecepatan Tinggi']} onChange={handleChange} />);
    const acButton = screen.getByRole('button', { name: /AC/i });
    fireEvent.click(acButton);
    expect(handleChange).toHaveBeenCalledWith(['WiFi Kecepatan Tinggi', 'Air Conditioning (AC)']);
  });

  it('unselects already selected facility chip and triggers onChange without it', () => {
    const handleChange = vi.fn();
    render(
      <PropertyFacilitiesSelector
        selected={['WiFi Kecepatan Tinggi', 'Kolam Renang']}
        onChange={handleChange}
      />
    );
    const wifiButton = screen.getByRole('button', { name: /WiFi/i });
    fireEvent.click(wifiButton);
    expect(handleChange).toHaveBeenCalledWith(['Kolam Renang']);
  });
});
