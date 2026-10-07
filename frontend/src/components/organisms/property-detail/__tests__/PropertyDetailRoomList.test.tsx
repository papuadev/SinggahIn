import { it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PropertyDetailRoomList } from '../PropertyDetailRoomList';
import { PropertyRoomSummary } from '../../../../modules/property/property.types';

function createMockRooms(count = 3): PropertyRoomSummary[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `rm-${i + 1}`,
    name: `Room ${String.fromCharCode(65 + i)}`,
    basePrice: (i + 1) * 200000,
    capacity: (i % 3) + 1,
    totalUnits: (i % 2) + 2,
    description: `Description for Room ${String.fromCharCode(65 + i)}`,
  }));
}

function renderList(rooms: PropertyRoomSummary[] = [], onBook = vi.fn()) {
  return render(
    <PropertyDetailRoomList
      propertyId="prop-123"
      rooms={rooms}
      checkIn="2026-10-10"
      checkOut="2026-10-12"
      onBookRoom={onBook}
    />
  );
}

it('renders empty state when rooms array is empty', () => {
  renderList([]);
  expect(screen.getByText('Belum Ada Tipe Kamar')).toBeInTheDocument();
});

it('renders room controls and dates badge', () => {
  renderList(createMockRooms(2));
  expect(screen.getByPlaceholderText('Cari tipe kamar...')).toBeInTheDocument();
  expect(screen.getByLabelText('Urutkan kamar')).toBeInTheDocument();
  expect(screen.getByText('2026-10-10 - 2026-10-12')).toBeInTheDocument();
});

it('sorts rooms by price descending', () => {
  renderList(createMockRooms(3));
  const select = screen.getByLabelText('Urutkan kamar');
  fireEvent.change(select, { target: { value: 'price_desc' } });
  const headings = screen.getAllByRole('heading', { level: 3 });
  expect(headings[0]).toHaveTextContent('Room C');
  expect(headings[2]).toHaveTextContent('Room A');
});

it('sorts rooms by name descending', () => {
  renderList(createMockRooms(3));
  const select = screen.getByLabelText('Urutkan kamar');
  fireEvent.change(select, { target: { value: 'name_desc' } });
  const headings = screen.getAllByRole('heading', { level: 3 });
  expect(headings[0]).toHaveTextContent('Room C');
});

it('filters rooms by search query', () => {
  renderList(createMockRooms(3));
  const searchInput = screen.getByPlaceholderText('Cari tipe kamar...');
  fireEvent.change(searchInput, { target: { value: 'Room B' } });
  expect(screen.getByText('Room B')).toBeInTheDocument();
  expect(screen.queryByText('Room A')).not.toBeInTheDocument();
  expect(screen.queryByText('Room C')).not.toBeInTheDocument();
});

it('shows empty search result and clears query on reset', () => {
  renderList(createMockRooms(3));
  const searchInput = screen.getByPlaceholderText('Cari tipe kamar...');
  fireEvent.change(searchInput, { target: { value: 'NonExistent' } });
  expect(screen.getByText('Tipe Kamar Tidak Ditemukan')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /bersihkan pencarian/i }));
  expect(screen.getByText('Room A')).toBeInTheDocument();
});

it('paginates rooms when count exceeds page size', () => {
  renderList(createMockRooms(7));
  expect(screen.getByText('Room A')).toBeInTheDocument();
  expect(screen.queryByText('Room F')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Halaman 2' }));
  expect(screen.getByText('Room F')).toBeInTheDocument();
  expect(screen.queryByText('Room A')).not.toBeInTheDocument();
});

it('triggers onBookRoom when Pesan Kamar button is clicked', () => {
  const handleBook = vi.fn();
  renderList(createMockRooms(1), handleBook);
  fireEvent.click(screen.getByRole('button', { name: /pesan kamar/i }));
  expect(handleBook).toHaveBeenCalledWith('rm-1');
});
