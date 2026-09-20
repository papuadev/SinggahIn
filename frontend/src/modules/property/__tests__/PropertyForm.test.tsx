import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PropertyForm } from '../components/PropertyForm';
import { propertyApi } from '../services/property.api';

vi.mock('../components/PropertyMapPin', () => ({
  PropertyMapPin: ({
    latitude,
    longitude,
    onChange,
    onLocationDetected,
  }: {
    latitude: number;
    longitude: number;
    onChange?: (lat: number, lng: number) => void;
    onLocationDetected?: (lat: number, lng: number) => void;
  }) => (
    <div data-testid="mock-map-pin">
      <span>{latitude}, {longitude}</span>
      <button type="button" onClick={() => onChange?.(-6.9, 107.6)}>
        Geser Pin Peta
      </button>
      <button type="button" onClick={() => onLocationDetected?.(-6.8888, 107.5555)}>
        Mock Lokasi Saya
      </button>
    </div>
  ),
}));

vi.mock('../services/property.api', () => ({
  propertyApi: {
    getCategories: vi.fn(),
    reverseGeocode: vi.fn(),
    searchGeocode: vi.fn(),
  },
}));

function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe('PropertyForm Component Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(propertyApi.getCategories).mockResolvedValue({
      success: true,
      message: 'OK',
      data: [
        { id: 'cat-villa', name: 'Villa', slug: 'villa', description: null },
        { id: 'cat-hotel', name: 'Hotel', slug: 'hotel', description: null },
      ],
    });
  });

  it('renders all form fields and loads categories into select dropdown', async () => {
    renderWithClient(<PropertyForm onSubmit={vi.fn()} />);

    expect(screen.getByPlaceholderText('Contoh: Villa Alam Asri')).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /Kategori Properti/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Jelaskan daya tarik/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Contoh: Bandung')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Contoh: Jl. Kolonel Masturi No. 88')).toBeInTheDocument();
    expect(screen.getByTestId('mock-map-pin')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'Villa' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Hotel' })).toBeInTheDocument();
    });
  });

  it('shows validation errors when submitted empty', async () => {
    renderWithClient(<PropertyForm onSubmit={vi.fn()} />);

    const submitBtn = screen.getByRole('button', { name: /Simpan Properti/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Nama properti minimal 3 karakter')).toBeInTheDocument();
      expect(screen.getByText('Kategori properti wajib dipilih')).toBeInTheDocument();
      expect(screen.getByText('Deskripsi properti minimal 10 karakter')).toBeInTheDocument();
    });
  });

  it('calls onSubmit with valid form data', async () => {
    const handleSubmit = vi.fn();
    renderWithClient(<PropertyForm onSubmit={handleSubmit} />);

    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'Villa' })).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText('Contoh: Villa Alam Asri'), { target: { value: 'Villa Sejuk Bandung' } });
    fireEvent.change(screen.getByRole('combobox', { name: /Kategori Properti/i }), { target: { value: 'cat-villa' } });
    fireEvent.change(screen.getByPlaceholderText(/Jelaskan daya tarik/i), { target: { value: 'Villa asri dengan kolam renang privat dan pemandangan lembah.' } });
    fireEvent.change(screen.getByPlaceholderText('Contoh: Bandung'), { target: { value: 'Bandung' } });
    fireEvent.change(screen.getByPlaceholderText('Contoh: Jl. Kolonel Masturi No. 88'), { target: { value: 'Jl. Kolonel Masturi No. 99' } });

    fireEvent.click(screen.getByRole('button', { name: /Simpan Properti/i }));

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledTimes(1);
      expect(handleSubmit.mock.calls[0][0]).toEqual(
        expect.objectContaining({
          title: 'Villa Sejuk Bandung',
          categoryId: 'cat-villa',
          city: 'Bandung',
          address: 'Jl. Kolonel Masturi No. 99',
        })
      );
    });
  });

  it('updates coordinates when pin moves and detects address from map', async () => {
    vi.mocked(propertyApi.reverseGeocode).mockResolvedValueOnce({
      success: true,
      message: 'OK',
      data: { formattedAddress: 'Jl. Tangkuban Perahu No. 10', city: 'Subang' },
    });

    renderWithClient(<PropertyForm onSubmit={vi.fn()} />);

    const moveBtn = screen.getByRole('button', { name: /Geser Pin Peta/i });
    fireEvent.click(moveBtn);

    const detectBtn = screen.getByRole('button', { name: /Deteksi Alamat dari Peta/i });
    fireEvent.click(detectBtn);

    await waitFor(() => {
      expect(propertyApi.reverseGeocode).toHaveBeenCalledWith(-6.9, 107.6);
      expect(screen.getByDisplayValue('Jl. Tangkuban Perahu No. 10')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Subang')).toBeInTheDocument();
    });
  });

  it('auto-fills address and city when Lokasi Saya is triggered', async () => {
    vi.mocked(propertyApi.reverseGeocode).mockResolvedValueOnce({
      success: true,
      message: 'OK',
      data: { formatted: 'Jl. Dipatiukur No. 35, Bandung', city: 'Bandung' },
    });

    renderWithClient(<PropertyForm onSubmit={vi.fn()} />);

    const lokasiSayaBtn = screen.getByRole('button', { name: /Mock Lokasi Saya/i });
    fireEvent.click(lokasiSayaBtn);

    await waitFor(() => {
      expect(propertyApi.reverseGeocode).toHaveBeenCalledWith(-6.8888, 107.5555);
      expect(screen.getByDisplayValue('Jl. Dipatiukur No. 35, Bandung')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Bandung')).toBeInTheDocument();
      expect(screen.getByText(/Lokasi saat ini terdeteksi/i)).toBeInTheDocument();
    });
  });

  it('searches addresses and updates coordinates and form fields when autocomplete suggestion is clicked', async () => {
    vi.mocked(propertyApi.searchGeocode).mockResolvedValueOnce({
      success: true,
      message: 'OK',
      data: [
        {
          latitude: -6.875,
          longitude: 107.615,
          formattedAddress: 'Jl. Ir. H. Juanda No. 123, Dago, Bandung',
          city: 'Bandung',
        },
      ],
    });

    renderWithClient(<PropertyForm onSubmit={vi.fn()} />);

    const addressInput = screen.getByPlaceholderText('Contoh: Jl. Kolonel Masturi No. 88');
    fireEvent.change(addressInput, { target: { value: 'Dago' } });

    const suggestion = await screen.findByText('Jl. Ir. H. Juanda No. 123, Dago, Bandung');
    expect(suggestion).toBeInTheDocument();

    fireEvent.click(suggestion);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Jl. Ir. H. Juanda No. 123, Dago, Bandung')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Bandung')).toBeInTheDocument();
      expect(screen.getByText('-6.875, 107.615')).toBeInTheDocument();
    });
  });
});

