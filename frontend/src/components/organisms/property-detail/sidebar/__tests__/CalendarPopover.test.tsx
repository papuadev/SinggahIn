import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CalendarPopover, DateTriggerBox } from '../CalendarPopover';
import { propertyApi } from '../../../../../modules/property/services/property.api';

vi.mock('../../../../../modules/property/services/property.api', () => ({
  propertyApi: { getCalendar: vi.fn() },
}));

const mockCalendarData = {
  roomId: 'rm-1',
  basePrice: 500000,
  calendar: [
    { date: '2026-10-10', price: 500000, isAvailable: true, reason: null },
    { date: '2026-10-11', price: 650000, isAvailable: true, reason: null },
  ],
};

function renderPopover(props: Partial<Parameters<typeof CalendarPopover>[0]> = {}) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <CalendarPopover
        isOpen={true}
        onClose={vi.fn()}
        propertyId="prop-1"
        rooms={[{ id: 'rm-1', name: 'Deluxe Room', basePrice: 500000 }]}
        {...props}
      />
    </QueryClientProvider>
  );
}

describe('CalendarPopover & DateTriggerBox Components', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(propertyApi.getCalendar).mockResolvedValue({
      success: true,
      message: 'OK',
      data: mockCalendarData,
    });
  });

  describe('DateTriggerBox', () => {
    it('renders placeholder when no dates provided and handles click', () => {
      const handleClick = vi.fn();
      render(
        <DateTriggerBox
          onClick={handleClick}
          isOpen={false}
        />
      );
      expect(screen.getByText('TANGGAL MENGINAP')).toBeInTheDocument();
      expect(screen.getAllByText('Pilih tanggal').length).toBe(2);

      fireEvent.click(screen.getByRole('button', { name: /buka kalender/i }));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('renders formatted check-in and check-out dates', () => {
      render(
        <DateTriggerBox
          checkIn="2026-10-10"
          checkOut="2026-10-15"
          onClick={vi.fn()}
          isOpen={true}
        />
      );
      expect(screen.getByText('10 Okt 2026')).toBeInTheDocument();
      expect(screen.getByText('15 Okt 2026')).toBeInTheDocument();
    });
  });

  describe('CalendarPopover Modal', () => {
    it('does not render modal dialog when isOpen is false', () => {
      renderPopover({ isOpen: false });
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('renders modal dialog with spacious layout, title, and buttons when isOpen is true', () => {
      renderPopover({ isOpen: true });
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /pilih tanggal menginap/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /tutup kalender/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /reset pilihan/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /terapkan tanggal/i })).toBeDisabled();
    });

    it('calls onClose when close icon is clicked', () => {
      const handleClose = vi.fn();
      renderPopover({ isOpen: true, onClose: handleClose });
      const closeBtn = screen.getByRole('button', { name: /tutup kalender/i });
      fireEvent.click(closeBtn);
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('calls onDates with empty strings when Reset Pilihan is clicked', () => {
      const handleDates = vi.fn();
      renderPopover({ isOpen: true, onDates: handleDates, inDate: '2026-10-10' });
      const resetBtn = screen.getByRole('button', { name: /reset pilihan/i });
      fireEvent.click(resetBtn);
      expect(handleDates).toHaveBeenCalledWith('', '');
    });

    it('enables Terapkan Tanggal when both checkIn and checkOut exist and calls onClose on click', () => {
      const handleClose = vi.fn();
      renderPopover({
        isOpen: true,
        onClose: handleClose,
        inDate: '2026-10-10',
        outDate: '2026-10-12',
      });
      const applyBtn = screen.getByRole('button', { name: /terapkan tanggal/i });
      expect(applyBtn).not.toBeDisabled();
      fireEvent.click(applyBtn);
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when Escape key is pressed', () => {
      const handleClose = vi.fn();
      renderPopover({ isOpen: true, onClose: handleClose });
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when clicking outside the popover', () => {
      const handleClose = vi.fn();
      renderPopover({ isOpen: true, onClose: handleClose });
      fireEvent.mouseDown(document.body);
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });
});
