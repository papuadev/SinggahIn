import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PropertyDetailSidebar } from '../PropertyDetailSidebar';

const mockRooms = [
  { id: 'r1', name: 'Deluxe Suite', basePrice: 500000 },
  { id: 'r2', name: 'Family Room', basePrice: 850000 },
];

describe('PropertyDetailSidebar Component', () => {
  it('does not render room selector dropdown when property has only 1 room', () => {
    render(
      <PropertyDetailSidebar
        propertyId="p1"
        rooms={[mockRooms[0]]}
        selectedRoomId="r1"
      />
    );

    expect(screen.queryByLabelText(/Pilih Tipe Kamar/i)).not.toBeInTheDocument();
  });

  it('renders room selector with custom dropdown arrow when multiple rooms exist', () => {
    const handleRoomChange = vi.fn();
    render(
      <PropertyDetailSidebar
        propertyId="p1"
        rooms={mockRooms}
        selectedRoomId="r1"
        onRoomChange={handleRoomChange}
      />
    );

    expect(screen.getByText('Tipe Kamar')).toBeInTheDocument();
    const select = screen.getByLabelText(/Pilih Tipe Kamar/i);
    expect(select).toBeInTheDocument();
    expect(select.className).toContain('appearance-none');
    expect(select.className).toContain('pr-10');

    fireEvent.change(select, { target: { value: 'r2' } });
    expect(handleRoomChange).toHaveBeenCalledWith('r2');
  });

  it('calculates total price correctly when dates are selected', () => {
    render(
      <PropertyDetailSidebar
        propertyId="p1"
        rooms={mockRooms}
        selectedRoomId="r1"
        checkIn="2026-10-01"
        checkOut="2026-10-03"
      />
    );

    expect(screen.getByText(/Total \(2 Malam\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Rp 1\.000\.000/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Pesan Sekarang/i })).toBeInTheDocument();
  });
});
