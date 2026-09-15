import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PropertyMapPin } from '../components/PropertyMapPin';

vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="map-container">{children}</div>
  ),
  TileLayer: () => <div data-testid="tile-layer" />,
  Marker: ({ position, draggable }: { position: [number, number]; draggable?: boolean }) => (
    <div
      data-testid="marker"
      data-position={JSON.stringify(position)}
      data-draggable={draggable}
    />
  ),
  useMap: () => ({ setView: vi.fn(), getZoom: vi.fn().mockReturnValue(14) }),
  useMapEvents: vi.fn(),
}));

describe('PropertyMapPin Component', () => {
  it('renders map container and coordinates display', () => {
    render(<PropertyMapPin latitude={-6.9175} longitude={107.6191} />);

    expect(screen.getByTestId('map-container')).toBeInTheDocument();
    expect(screen.getByText(/-6.91750, 107.61910/i)).toBeInTheDocument();
  });

  it('renders fallback hint when coordinates are zero or empty', () => {
    render(<PropertyMapPin latitude={0} longitude={0} />);

    expect(screen.getByText('Geser pin atau klik peta')).toBeInTheDocument();
  });

  it('renders "Lokasi Saya" button when editable and onChange is provided', () => {
    const handleChange = vi.fn();
    render(<PropertyMapPin latitude={-6.9} longitude={107.6} onChange={handleChange} />);

    expect(screen.getByRole('button', { name: /Lokasi Saya/i })).toBeInTheDocument();
  });

  it('hides "Lokasi Saya" button in readonly mode', () => {
    render(<PropertyMapPin latitude={-6.9} longitude={107.6} readonly={true} />);

    expect(screen.queryByRole('button', { name: /Lokasi Saya/i })).not.toBeInTheDocument();
  });

  it('handles geolocation successfully when button clicked', () => {
    const handleChange = vi.fn();
    const mockGeolocation = {
      getCurrentPosition: vi.fn().mockImplementationOnce((success) => {
        success({
          coords: {
            latitude: -6.8888,
            longitude: 107.5555,
          },
        });
      }),
    };
    (global as unknown as { navigator: { geolocation: typeof mockGeolocation } }).navigator.geolocation =
      mockGeolocation;

    render(<PropertyMapPin latitude={-6.9} longitude={107.6} onChange={handleChange} />);
    const btn = screen.getByRole('button', { name: /Lokasi Saya/i });
    fireEvent.click(btn);

    expect(handleChange).toHaveBeenCalledWith(-6.8888, 107.5555);
  });
});
