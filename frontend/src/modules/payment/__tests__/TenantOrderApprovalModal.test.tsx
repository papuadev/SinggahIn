import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TenantOrderApprovalModal } from '../components/TenantOrderApprovalModal';
import { Booking } from '../../booking/booking.types';

const baseBooking: Booking = {
  id: 'bk-test-1',
  bookingCode: 'SGH-20261015-TEST',
  userId: 'u1',
  roomId: 'r1',
  propertyId: 'p1',
  checkInDate: '2026-10-15',
  checkOutDate: '2026-10-17',
  guestCount: 2,
  totalPrice: 1500000,
  status: 'WAITING_CONFIRMATION',
  isForceMajeure: false,
  expiresAt: '2026-10-15T12:00:00Z',
  createdAt: '2026-10-14T10:00:00Z',
  updatedAt: '2026-10-14T10:00:00Z',
  property: {
    id: 'p1',
    title: 'Grand Aston Resort',
    city: 'Bali',
    address: 'Jl. Pantai Kuta No. 1',
    images: [{ imageUrl: 'https://cdn.example.com/prop.jpg', isCover: true }],
  },
  room: { id: 'r1', name: 'Deluxe Ocean View', basePrice: 750000 },
  user: { id: 'u1', name: 'Budi Santoso', email: 'budi@example.com', phoneNumber: '08123456789' },
  payment: {
    id: 'pay-1',
    bookingId: 'bk-test-1',
    paymentMethod: 'MANUAL_TRANSFER',
    status: 'WAITING_CONFIRMATION',
    amount: 1500000,
    paymentProofUrl: 'https://cdn.example.com/transfer-proof.jpg',
    createdAt: '2026-10-14T10:00:00Z',
  },
};

describe('TenantOrderApprovalModal', () => {
  it('renders 2-column layout with property card, guest info, and manual transfer proof', () => {
    render(
      <TenantOrderApprovalModal
        isOpen={true}
        onClose={vi.fn()}
        booking={baseBooking}
        onApprove={vi.fn()}
        onReject={vi.fn()}
        onEmergency={vi.fn()}
        isLoading={false}
      />
    );

    expect(screen.getByText('Grand Aston Resort')).toBeInTheDocument();
    expect(screen.getByText('Deluxe Ocean View')).toBeInTheDocument();
    expect(screen.getByText('Budi Santoso')).toBeInTheDocument();
    expect(screen.getByText('Transfer Manual')).toBeInTheDocument();
    expect(screen.queryByText('MANUAL_TRANSFER')).not.toBeInTheDocument();
    expect(screen.getByText('Bukti Transfer Pembayaran')).toBeInTheDocument();
    expect(screen.getByText('Lihat Ukuran Penuh')).toBeInTheDocument();
  });

  it('renders yellow card with custom text for PAYMENT_GATEWAY with WAITING_PAYMENT status', () => {
    const pendingGatewayBooking: Booking = {
      ...baseBooking,
      status: 'WAITING_PAYMENT',
      payment: {
        ...baseBooking.payment!,
        paymentMethod: 'PAYMENT_GATEWAY',
        status: 'PENDING',
      },
    };

    render(
      <TenantOrderApprovalModal
        isOpen={true}
        onClose={vi.fn()}
        booking={pendingGatewayBooking}
        onApprove={vi.fn()}
        onReject={vi.fn()}
        onEmergency={vi.fn()}
        isLoading={false}
      />
    );

    expect(screen.queryByText('Bukti Transfer Pembayaran')).not.toBeInTheDocument();
    expect(screen.getByText('Menunggu Pembayaran (Payment Gateway)')).toBeInTheDocument();
    expect(screen.getByText(/sedang menunggu pembayaran oleh tamu via Midtrans/i)).toBeInTheDocument();
    expect(screen.getByText('Payment Gateway')).toBeInTheDocument();
    expect(screen.queryByText('PAYMENT_GATEWAY')).not.toBeInTheDocument();
  });

  it('renders green card for PAYMENT_GATEWAY with completed/settlement status', () => {
    const successGatewayBooking: Booking = {
      ...baseBooking,
      status: 'PROCESSED',
      payment: {
        ...baseBooking.payment!,
        paymentMethod: 'PAYMENT_GATEWAY',
        status: 'SETTLEMENT',
      },
    };

    render(
      <TenantOrderApprovalModal
        isOpen={true}
        onClose={vi.fn()}
        booking={successGatewayBooking}
        onApprove={vi.fn()}
        onReject={vi.fn()}
        onEmergency={vi.fn()}
        isLoading={false}
      />
    );

    expect(screen.queryByText('Bukti Transfer Pembayaran')).not.toBeInTheDocument();
    expect(screen.getByText('Pembayaran Berhasil (Payment Gateway)')).toBeInTheDocument();
  });

  it('opens in-app lightbox overlay without opening a new tab when clicking Lihat Ukuran Penuh', () => {
    const openSpy = vi.spyOn(window, 'open');

    render(
      <TenantOrderApprovalModal
        isOpen={true}
        onClose={vi.fn()}
        booking={baseBooking}
        onApprove={vi.fn()}
        onReject={vi.fn()}
        onEmergency={vi.fn()}
        isLoading={false}
      />
    );

    const fullBtn = screen.getByText('Lihat Ukuran Penuh');
    fireEvent.click(fullBtn);

    expect(openSpy).not.toHaveBeenCalled();
    const lightbox = screen.getByRole('dialog', { name: /Bukti Transfer Ukuran Penuh/i });
    expect(lightbox).toBeInTheDocument();

    const closeBtn = screen.getByRole('button', { name: /Tutup pratinjau bukti/i });
    fireEvent.click(closeBtn);
    expect(screen.queryByRole('dialog', { name: /Bukti Transfer Ukuran Penuh/i })).not.toBeInTheDocument();
  });
});
