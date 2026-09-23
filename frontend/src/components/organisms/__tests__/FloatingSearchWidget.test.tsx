import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { FloatingSearchWidget } from '../FloatingSearchWidget';
import { propertyApi } from '../../../modules/property/services/property.api';

vi.mock('../../../modules/property/services/property.api', () => ({
  propertyApi: {
    searchGeocode: vi.fn(),
  },
}));

describe('FloatingSearchWidget Organism', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all search controls and category chips', () => {
    render(
      <MemoryRouter>
        <FloatingSearchWidget />
      </MemoryRouter>
    );

    expect(screen.getByPlaceholderText(/Mau menginap di mana/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Tanggal check-in/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Tanggal check-out/i)).toBeInTheDocument();
    expect(screen.getByText('1 Tamu')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Villa' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cari Penginapan/i })).toBeInTheDocument();
  });

  it('selects popular destination when chip is clicked', () => {
    render(
      <MemoryRouter>
        <FloatingSearchWidget />
      </MemoryRouter>
    );

    const bandungChip = screen.getByRole('button', { name: 'Bandung' });
    fireEvent.click(bandungChip);

    const input = screen.getByPlaceholderText(/Mau menginap di mana/i) as HTMLInputElement;
    expect(input.value).toBe('Bandung');
  });

  it('fetches OpenCage suggestions and allows selection', async () => {
    vi.mocked(propertyApi.searchGeocode).mockResolvedValueOnce({
      success: true,
      message: 'OK',
      data: [
        {
          city: 'Yogyakarta',
          formattedAddress: 'Jl. Malioboro, Yogyakarta',
          latitude: -7.79,
          longitude: 110.36,
        },
      ],
    });

    render(
      <MemoryRouter>
        <FloatingSearchWidget />
      </MemoryRouter>
    );

    const input = screen.getByPlaceholderText(/Mau menginap di mana/i);
    fireEvent.change(input, { target: { value: 'Malio' } });

    await waitFor(() => {
      expect(propertyApi.searchGeocode).toHaveBeenCalledWith('Malio', 5);
    });

    const suggestionItem = await screen.findByText('Jl. Malioboro, Yogyakarta');
    fireEvent.click(suggestionItem);

    expect((input as HTMLInputElement).value).toBe('Yogyakarta');
  });

  it('increments and decrements guest count within bounds', () => {
    render(
      <MemoryRouter>
        <FloatingSearchWidget />
      </MemoryRouter>
    );

    const incBtn = screen.getByRole('button', { name: /Tambah jumlah tamu/i });
    const decBtn = screen.getByRole('button', { name: /Kurangi jumlah tamu/i });

    expect(decBtn).toBeDisabled();

    fireEvent.click(incBtn);
    expect(screen.getByText('2 Tamu')).toBeInTheDocument();
    expect(decBtn).not.toBeDisabled();

    fireEvent.click(decBtn);
    expect(screen.getByText('1 Tamu')).toBeInTheDocument();
    expect(decBtn).toBeDisabled();
  });

  it('submits search criteria with active category and dates', () => {
    const mockSearch = vi.fn();
    render(
      <MemoryRouter>
        <FloatingSearchWidget onSearch={mockSearch} />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Villa' }));
    fireEvent.click(screen.getByRole('button', { name: 'Bali' }));

    const checkInInput = screen.getByLabelText(/Tanggal check-in/i);
    fireEvent.change(checkInInput, { target: { value: '2026-10-01' } });

    const checkOutInput = screen.getByLabelText(/Tanggal check-out/i);
    fireEvent.change(checkOutInput, { target: { value: '2026-10-04' } });

    const submitBtn = screen.getByRole('button', { name: /Cari Penginapan/i });
    fireEvent.click(submitBtn);

    expect(mockSearch).toHaveBeenCalledWith({
      city: 'Bali',
      checkIn: '2026-10-01',
      checkOut: '2026-10-04',
      guests: 1,
      category: 'villa',
    });
  });
});
