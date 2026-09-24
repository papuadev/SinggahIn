import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { InteractivePriceCalendar } from '../InteractivePriceCalendar';
import { propertyApi } from '../../../../modules/property/services/property.api';

vi.mock('../../../../modules/property/services/property.api', () => ({
  propertyApi: { getCalendar: vi.fn() },
}));

const mockCalendarData = {
  roomId: 'rm-1',
  basePrice: 500000,
  calendar: [
    { date: '2026-10-10', price: 500000, isAvailable: true, reason: null },
    { date: '2026-10-11', price: 650000, isAvailable: true, reason: 'Weekend Rate' },
    { date: '2026-10-12', price: 0, isAvailable: false, reason: 'Sold Out' },
    { date: '2026-10-13', price: 500000, isAvailable: true, reason: null },
    { date: '2026-10-14', price: 500000, isAvailable: true, reason: null },
  ],
};

const mockRooms = [
  { id: 'rm-1', name: 'Deluxe Suite', basePrice: 500000 },
  { id: 'rm-2', name: 'Executive Suite', basePrice: 850000 },
];

function renderCalendar(props: Partial<Parameters<typeof InteractivePriceCalendar>[0]> = {}) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <InteractivePriceCalendar
        propertyId="prop-123"
        rooms={mockRooms}
        initialMonth={10}
        initialYear={2026}
        {...props}
      />
    </QueryClientProvider>
  );
}

describe('InteractivePriceCalendar Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(propertyApi.getCalendar).mockResolvedValue({
      success: true, message: 'OK', data: mockCalendarData,
    });
  });

  it('renders section title, room selector options, and legend chips', async () => {
    renderCalendar();
    expect(screen.getByRole('heading', { name: /Kalender Ketersediaan & Tarif Harian/i })).toBeInTheDocument();
    expect(screen.getByText('Tersedia (Tarif Harian)')).toBeInTheDocument();
    expect(screen.getByText('Penuh / Sold Out')).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /Pilih Tipe Kamar/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Deluxe Suite' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Executive Suite' })).toBeInTheDocument();
  });

  it('renders daily price and sold out badge when data is loaded', async () => {
    renderCalendar();
    await waitFor(() => {
      expect(screen.getByText('Penuh')).toBeInTheDocument();
    });
    expect(screen.getAllByText('500K').length).toBeGreaterThan(0);
    expect(screen.getByText('650K')).toBeInTheDocument();
  });

  it('disables date cell that is Sold Out', async () => {
    renderCalendar();
    await waitFor(() => {
      expect(screen.getByText('Penuh')).toBeInTheDocument();
    });
    const soldOutDayBtn = screen.getByText('Penuh').closest('button');
    expect(soldOutDayBtn).toHaveAttribute('aria-disabled', 'true');
    expect(soldOutDayBtn).toBeDisabled();
  });

  it('navigates to next month when clicking next button', async () => {
    renderCalendar();
    await waitFor(() => {
      expect(propertyApi.getCalendar).toHaveBeenCalled();
    });
    const nextBtn = screen.getByRole('button', { name: /Bulan Berikutnya/i });
    fireEvent.click(nextBtn);
    await waitFor(() => {
      expect(propertyApi.getCalendar).toHaveBeenCalledWith(
        'prop-123',
        expect.objectContaining({ month: 11, year: 2026 })
      );
    });
  });

  it('allows switching selected room type and re-fetches calendar', async () => {
    const handleRoomChange = vi.fn();
    renderCalendar({ onRoomChange: handleRoomChange });
    const select = screen.getByRole('combobox', { name: /Pilih Tipe Kamar/i });
    fireEvent.change(select, { target: { value: 'rm-2' } });
    expect(handleRoomChange).toHaveBeenCalledWith('rm-2');
    await waitFor(() => {
      expect(propertyApi.getCalendar).toHaveBeenCalledWith(
        'prop-123',
        expect.objectContaining({ roomId: 'rm-2' })
      );
    });
  });

  it('calls onSelectDates when a valid date is clicked', async () => {
    const handleSelectDates = vi.fn();
    renderCalendar({ onSelectDates: handleSelectDates });
    await waitFor(() => {
      expect(screen.getByText('650K')).toBeInTheDocument();
    });
    const day10Btn = screen.getAllByText('500K')[0].closest('button')!;
    fireEvent.click(day10Btn);
    expect(handleSelectDates).toHaveBeenCalledWith('2026-10-10', '');
  });

  it('displays warning when selecting range that includes Sold Out dates (AC-004)', async () => {
    const handleSelectDates = vi.fn();
    renderCalendar({ checkIn: '2026-10-10', onSelectDates: handleSelectDates });
    await waitFor(() => {
      expect(screen.getByText('Penuh')).toBeInTheDocument();
    });
    const day14Btn = screen.getAllByText('14')[0].closest('button')!;
    fireEvent.click(day14Btn);
    expect(screen.getByText(/Rentang tanggal memuat tanggal yang tidak tersedia/i)).toBeInTheDocument();
  });
});
