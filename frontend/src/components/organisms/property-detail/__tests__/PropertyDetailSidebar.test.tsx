import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { PropertyDetailSidebar } from '../PropertyDetailSidebar';
import { pricingApi } from '../../../../modules/room/services/pricing.api';
import { useAuthStore } from '../../../../stores/auth.store';

const mockRooms = [
  { id: 'r1', name: 'Deluxe Suite', basePrice: 500000 },
  { id: 'r2', name: 'Family Room', basePrice: 850000 },
];

function renderSidebar(ui: React.ReactElement) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>
  );
}

describe('PropertyDetailSidebar Component', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isInitialized: true,
      isLoading: false,
      error: null,
      conflict: null,
    });
    vi.spyOn(pricingApi, 'calculateStayPricing').mockResolvedValue({
      success: true, message: 'OK',
      data: {
        roomId: 'r1', checkInDate: '2026-10-01', checkOutDate: '2026-10-03',
        totalNights: 2, basePrice: 500000, averageNightRate: 500000, totalStayPrice: 1000000,
        dailyBreakdown: [],
      },
    });
  });

  it('does not render room selector dropdown when property has only 1 room', () => {
    renderSidebar(
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
    renderSidebar(
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
    renderSidebar(
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

  it('renders dynamic stay pricing total when backend returns surcharges', async () => {
    vi.spyOn(pricingApi, 'calculateStayPricing').mockResolvedValueOnce({
      success: true, message: 'OK',
      data: {
        roomId: 'r1', checkInDate: '2026-10-01', checkOutDate: '2026-10-03',
        totalNights: 2, basePrice: 500000, averageNightRate: 650000, totalStayPrice: 1300000,
        dailyBreakdown: [],
      },
    });
    renderSidebar(
      <PropertyDetailSidebar
        propertyId="p1"
        rooms={mockRooms}
        selectedRoomId="r1"
        checkIn="2026-10-01"
        checkOut="2026-10-03"
      />
    );
    await waitFor(() => {
      expect(screen.getByText(/1\.300\.000/i)).toBeInTheDocument();
      expect(screen.getByText('Tarif rata-rata')).toBeInTheDocument();
    });
  });

  it('disables Pesan Sekarang button and displays login prompt when unauthenticated', () => {
    renderSidebar(
      <PropertyDetailSidebar
        propertyId="p1"
        rooms={mockRooms}
        selectedRoomId="r1"
        checkIn="2026-10-01"
        checkOut="2026-10-03"
      />
    );

    const button = screen.getByRole('button', { name: /Pesan Sekarang/i });
    expect(button).toBeDisabled();

    expect(
      screen.getByText(/Silahkan login sebagai user untuk mengaktifkan fitur ini\./i)
    ).toBeInTheDocument();
    const loginLink = screen.getByRole('link', { name: /Login/i });
    expect(loginLink).toBeInTheDocument();
    expect(loginLink).toHaveAttribute('href', '/login?role=USER');
  });

  it('enables Pesan Sekarang button and hides login prompt when user is authenticated', () => {
    useAuthStore.setState({
      user: { id: 'u1', email: 'user@test.com', name: 'User Test', role: 'USER', avatarUrl: null },
      isAuthenticated: true,
      isInitialized: true,
      isLoading: false,
    });

    renderSidebar(
      <PropertyDetailSidebar
        propertyId="p1"
        rooms={mockRooms}
        selectedRoomId="r1"
        checkIn="2026-10-01"
        checkOut="2026-10-03"
      />
    );

    const button = screen.getByRole('button', { name: /Pesan Sekarang/i });
    expect(button).toBeEnabled();

    expect(
      screen.queryByText(/Silahkan login sebagai user untuk mengaktifkan fitur ini\./i)
    ).not.toBeInTheDocument();
  });
});
