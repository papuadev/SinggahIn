import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TenantRoomStatusCalendar } from '../components/TenantRoomStatusCalendar';

vi.mock('../../../components/organisms/property-detail/InteractivePriceCalendar', () => ({
  InteractivePriceCalendar: ({ propertyId, rooms }: { propertyId: string; rooms: any[] }) => (
    <div data-testid="mock-interactive-calendar">
      Calendar for {propertyId} with {rooms.length} rooms
    </div>
  ),
}));

describe('TenantRoomStatusCalendar Component', () => {
  it('renders empty rooms message when rooms is empty', () => {
    render(<TenantRoomStatusCalendar propertyId="prop-1" rooms={[]} />);
    expect(screen.getByText('Belum Ada Tipe Kamar')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-interactive-calendar')).not.toBeInTheDocument();
  });

  it('renders allotment info banner and InteractivePriceCalendar when rooms exist', () => {
    const mockRooms = [
      { id: 'room-1', name: 'Deluxe King Bed', basePrice: 500000 },
      { id: 'room-2', name: 'Standard Twin Bed', basePrice: 350000 },
    ];

    render(<TenantRoomStatusCalendar propertyId="prop-1" rooms={mockRooms} />);
    expect(screen.getByText('Pemantauan Alokasi Kamar (Allotment Monitor)')).toBeInTheDocument();
    expect(screen.getByTestId('mock-interactive-calendar')).toBeInTheDocument();
    expect(screen.getByText('Calendar for prop-1 with 2 rooms')).toBeInTheDocument();
  });
});
