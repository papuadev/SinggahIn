import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PropertyForm } from '../components/PropertyForm';
import { propertyApi } from '../services/property.api';

vi.mock('../components/PropertyMapPin', () => ({
  PropertyMapPin: ({ latitude, longitude, onChange, onLocationDetected }: any) => (
    <div data-testid="mock-map-pin">
      <span>{latitude}, {longitude}</span>
      <button type="button" onClick={() => onChange?.(-6.9, 107.6)}>Geser Pin Peta</button>
      <button type="button" onClick={() => onLocationDetected?.(-6.8888, 107.5555)}>Mock Lokasi Saya</button>
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
    expect(screen.getByPlaceholderText('Otomatis terisi dari saran alamat')).toHaveAttribute('readonly');
    expect(screen.getByPlaceholderText('Contoh: Jl. Kolonel Masturi No. 88')).toBeInTheDocument();
    expect(screen.getByTestId('mock-map-pin')).toBeInTheDocument();
    await waitFor(() => { expect(screen.getByRole('option', { name: 'Villa' })).toBeInTheDocument(); });
  });

  it('shows validation errors when submitted empty', async () => {
    renderWithClient(<PropertyForm onSubmit={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /Simpan Properti/i }));
    await waitFor(() => {
      expect(screen.getByText('Nama properti minimal 3 karakter')).toBeInTheDocument();
      expect(screen.getByText('Kategori properti wajib dipilih')).toBeInTheDocument();
      expect(screen.getByText('Deskripsi properti minimal 10 karakter')).toBeInTheDocument();
    });
  });

  it('calls onSubmit with valid form data', async () => {
    const handleSubmit = vi.fn();
    renderWithClient(<PropertyForm onSubmit={handleSubmit} initialData={{ city: 'Bandung' }} />);
    await waitFor(() => { expect(screen.getByRole('option', { name: 'Villa' })).toBeInTheDocument(); });
    fireEvent.change(screen.getByPlaceholderText('Contoh: Villa Alam Asri'), { target: { value: 'Villa Sejuk' } });
    fireEvent.change(screen.getByRole('combobox', { name: /Kategori Properti/i }), { target: { value: 'cat-villa' } });
    fireEvent.change(screen.getByPlaceholderText(/Jelaskan daya tarik/i), { target: { value: 'Villa asri kolam renang privat.' } });
    fireEvent.change(screen.getByPlaceholderText('Contoh: Jl. Kolonel Masturi No. 88'), { target: { value: 'Jl. Kolonel 99' } });
    fireEvent.click(screen.getByRole('button', { name: /Simpan Properti/i }));
    await waitFor(() => {
      expect(handleSubmit.mock.calls[0][0]).toEqual(
        expect.objectContaining({ title: 'Villa Sejuk', city: 'Bandung' })
      );
    });
  });

  it('ensures city field is read-only and cannot be manually edited', () => {
    renderWithClient(<PropertyForm onSubmit={vi.fn()} />);
    const cityInput = screen.getByPlaceholderText('Otomatis terisi dari saran alamat');
    expect(cityInput).toHaveAttribute('readonly');
  });

  it('updates coordinates when pin moves and detects address from map', async () => {
    vi.mocked(propertyApi.reverseGeocode).mockResolvedValueOnce({
      success: true, message: 'OK', data: { formattedAddress: 'Jl. Tangkuban Perahu No. 10', city: 'Subang' },
    });
    renderWithClient(<PropertyForm onSubmit={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /Geser Pin Peta/i }));
    fireEvent.click(screen.getByRole('button', { name: /Deteksi Alamat dari Peta/i }));
    await waitFor(() => {
      expect(screen.getByDisplayValue('Jl. Tangkuban Perahu No. 10')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Subang')).toBeInTheDocument();
    });
  });

  it('auto-fills address and city when Lokasi Saya is triggered', async () => {
    vi.mocked(propertyApi.reverseGeocode).mockResolvedValueOnce({
      success: true, message: 'OK', data: { formatted: 'Jl. Dipatiukur No. 35, Bandung', city: 'Bandung' },
    });
    renderWithClient(<PropertyForm onSubmit={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /Mock Lokasi Saya/i }));
    await waitFor(() => {
      expect(screen.getByDisplayValue('Jl. Dipatiukur No. 35, Bandung')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Bandung')).toBeInTheDocument();
      expect(screen.getByText(/Lokasi saat ini terdeteksi/i)).toBeInTheDocument();
    });
  });

  it('searches addresses and updates coordinates and form fields when autocomplete suggestion is clicked', async () => {
    const sug = { latitude: -6.875, longitude: 107.615, formattedAddress: 'Jl. Dago 123', city: 'Bandung' };
    vi.mocked(propertyApi.searchGeocode).mockResolvedValueOnce({ success: true, message: 'OK', data: [sug] });
    renderWithClient(<PropertyForm onSubmit={vi.fn()} />);
    fireEvent.change(screen.getByPlaceholderText('Contoh: Jl. Kolonel Masturi No. 88'), { target: { value: 'Dago' } });
    fireEvent.click(await screen.findByText('Jl. Dago 123'));
    await waitFor(() => {
      expect(screen.getByDisplayValue('Jl. Dago 123')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Bandung')).toBeInTheDocument();
      expect(screen.getByText('-6.875, 107.615')).toBeInTheDocument();
    });
  });
});

