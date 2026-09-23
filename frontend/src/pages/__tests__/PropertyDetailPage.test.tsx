import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PropertyDetailPage } from '../PropertyDetailPage';
import { propertyApi } from '../../modules/property/services/property.api';
import { roomApi } from '../../modules/room/services/room.api';

vi.mock('../../modules/property/services/property.api', () => ({
  propertyApi: { getPropertyById: vi.fn() },
}));

vi.mock('../../modules/room/services/room.api', () => ({
  roomApi: { getRoomsByProperty: vi.fn() },
}));

vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="map-container">{children}</div>
  ),
  TileLayer: () => <div data-testid="tile-layer" />,
  Marker: React.forwardRef((_props: any, _ref: any) => <div data-testid="marker" />),
  useMap: () => ({ setView: vi.fn(), getZoom: vi.fn().mockReturnValue(14) }),
  useMapEvents: () => null,
}));

const mockProperty = {
  id: 'clprop123',
  tenantId: 'tenant1',
  categoryId: 'cat1',
  title: 'Villa Nuansa Asri Dago',
  description: 'Villa modern di kawasan sejuk Dago Atas Bandung.',
  address: 'Jl. Dago Giri No. 88',
  city: 'Bandung',
  latitude: -6.87123,
  longitude: 107.61234,
  createdAt: '2026-09-01T00:00:00.000Z',
  updatedAt: '2026-09-01T00:00:00.000Z',
  category: { id: 'cat1', name: 'Villa', slug: 'villa', description: null },
  images: [
    {
      id: 'img1',
      propertyId: 'clprop123',
      imageUrl: 'https://images.unsplash.com/cover.webp',
      publicId: 'c1',
      isCover: true,
    },
    {
      id: 'img2',
      propertyId: 'clprop123',
      imageUrl: 'https://images.unsplash.com/room.webp',
      publicId: 'c2',
      isCover: false,
    },
  ],
  rooms: [
    {
      id: 'rm1',
      name: 'Deluxe Mountain Suite',
      basePrice: 750000,
      capacity: 2,
      totalUnits: 3,
      description: 'Kamar luas dengan balkon panorama gunung.',
    },
    {
      id: 'rm2',
      name: 'Family Garden Suite',
      basePrice: 1200000,
      capacity: 4,
      totalUnits: 2,
      description: 'Kamar keluarga dengan akses langsung ke taman.',
    },
  ],
  averageRating: 4.9,
  totalReviews: 18,
};

function renderComponent(initialRoute = '/properties/clprop123') {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialRoute]}>
        <Routes>
          <Route path="/properties/:id" element={<PropertyDetailPage />} />
          <Route path="/search" element={<div>Halaman Katalog</div>} />
          <Route path="/checkout" element={<div>Halaman Checkout</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('PropertyDetailPage Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading skeleton while query is in progress', () => {
    vi.mocked(propertyApi.getPropertyById).mockImplementationOnce(
      () => new Promise(() => {})
    );
    renderComponent();
    expect(screen.getByRole('status', { name: /memuat detail properti/i })).toBeInTheDocument();
  });

  it('renders not found state when property does not exist', async () => {
    vi.mocked(propertyApi.getPropertyById).mockRejectedValueOnce(new Error('Not found'));
    renderComponent('/properties/non-existent');
    await waitFor(() => {
      expect(screen.getByText('Properti Tidak Ditemukan')).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /kembali ke katalog/i })).toBeInTheDocument();
  });

  it('renders complete property detail, header, facilities, rooms, and map', async () => {
    vi.mocked(propertyApi.getPropertyById).mockResolvedValueOnce({
      success: true,
      message: 'Detail properti berhasil diambil.',
      data: mockProperty as any,
    });

    renderComponent('/properties/clprop123?checkIn=2026-10-01&checkOut=2026-10-03');

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: 'Villa Nuansa Asri Dago' })).toBeInTheDocument();
    });

    expect(screen.getByText('Villa')).toBeInTheDocument();
    expect(screen.getAllByText(/Jl\. Dago Giri No\. 88, Bandung/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('4.9')).toBeInTheDocument();
    expect(screen.getByText('(18 ulasan)')).toBeInTheDocument();
    expect(screen.getByText(/Villa modern di kawasan sejuk/i)).toBeInTheDocument();
    expect(screen.getByText('WiFi Kecepatan Tinggi')).toBeInTheDocument();
    expect(screen.getByText('Deluxe Mountain Suite')).toBeInTheDocument();
    expect(screen.getByText('Family Garden Suite')).toBeInTheDocument();
    expect(screen.getByText('Maks. 2 Tamu')).toBeInTheDocument();
    expect(screen.getByText('3 unit tersedia')).toBeInTheDocument();
    expect(screen.getByTestId('map-container')).toBeInTheDocument();
  });

  it('triggers booking action navigating to checkout when Pesan Kamar is clicked', async () => {
    vi.mocked(propertyApi.getPropertyById).mockResolvedValueOnce({
      success: true,
      message: 'Detail properti berhasil diambil.',
      data: mockProperty as any,
    });

    renderComponent('/properties/clprop123?checkIn=2026-10-01&checkOut=2026-10-03');

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: 'Villa Nuansa Asri Dago' })).toBeInTheDocument();
    });

    const bookButtons = screen.getAllByRole('button', { name: /pesan kamar/i });
    fireEvent.click(bookButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Halaman Checkout')).toBeInTheDocument();
    });
  });

  it('falls back to roomApi when property.rooms is empty', async () => {
    vi.mocked(propertyApi.getPropertyById).mockResolvedValueOnce({
      success: true,
      message: 'OK',
      data: { ...mockProperty, rooms: [] } as any,
    });
    vi.mocked(roomApi.getRoomsByProperty).mockResolvedValueOnce({
      success: true,
      message: 'OK',
      data: [{ id: 'rf1', name: 'Fallback Suite', basePrice: 500000, capacity: 2, totalUnits: 1 }] as any,
    });

    renderComponent('/properties/clprop123');
    await waitFor(() => {
      expect(screen.getByText('Fallback Suite')).toBeInTheDocument();
    });
  });
});
