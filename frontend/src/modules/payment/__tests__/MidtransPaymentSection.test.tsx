import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MidtransPaymentSection } from '../components/MidtransPaymentSection';

describe('MidtransPaymentSection', () => {
  it('renders header, gateway badges, and pay button', () => {
    render(
      <MemoryRouter>
        <MidtransPaymentSection isPayingSnap={false} snapError={null} onPay={vi.fn()} />
      </MemoryRouter>
    );
    expect(screen.getByText('Metode Pembayaran Otomatis')).toBeInTheDocument();
    expect(screen.getByText('QRIS')).toBeInTheDocument();
    expect(screen.getByText('GoPay')).toBeInTheDocument();
    expect(screen.getByText('BCA / BNI / BRI VA')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Bayar Sekarang/i })).toBeInTheDocument();
  });

  it('renders channel badges as inactive visual badges (not interactive buttons)', () => {
    render(
      <MemoryRouter>
        <MidtransPaymentSection isPayingSnap={false} snapError={null} onPay={vi.fn()} />
      </MemoryRouter>
    );
    expect(screen.queryByRole('button', { name: 'QRIS' })).not.toBeInTheDocument();
    expect(screen.getByText('QRIS')).toHaveClass('select-none');
  });

  it('triggers onPay when clicking the main Bayar Sekarang button', () => {
    const handlePay = vi.fn();
    render(
      <MemoryRouter>
        <MidtransPaymentSection isPayingSnap={false} snapError={null} onPay={handlePay} />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByRole('button', { name: /Bayar Sekarang/i }));
    expect(handlePay).toHaveBeenCalledTimes(1);
  });

  it('renders SnapErrorAlert when snapError is provided', () => {
    const errorMsg = 'Kunci konfigurasi belum valid.';
    render(
      <MemoryRouter>
        <MidtransPaymentSection isPayingSnap={false} snapError={errorMsg} onPay={vi.fn()} />
      </MemoryRouter>
    );
    expect(screen.getByText('Gagal Memulai Pembayaran Otomatis')).toBeInTheDocument();
    expect(screen.getByText(errorMsg)).toBeInTheDocument();
  });

  it('renders PaidNotice when isPaid is true', () => {
    render(
      <MemoryRouter>
        <MidtransPaymentSection isPayingSnap={false} snapError={null} onPay={vi.fn()} isPaid={true} />
      </MemoryRouter>
    );
    expect(screen.getByText(/Pembayaran telah berhasil diverifikasi/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Bayar Sekarang/i })).not.toBeInTheDocument();
  });

  it('renders pending Virtual Account info and action buttons when pendingPayment has vaNumber', () => {
    const pending = { bank: 'BCA', vaNumber: '1234567890' };
    render(
      <MemoryRouter>
        <MidtransPaymentSection isPayingSnap={false} snapError={null} onPay={vi.fn()} pendingPayment={pending} />
      </MemoryRouter>
    );
    expect(screen.getByText(/Menunggu Pembayaran Virtual Account/i)).toBeInTheDocument();
    expect(screen.getByText('1234567890')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Buka Rincian Pembayaran/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Pilih Ulang Metode Pembayaran Otomatis/i })).toBeInTheDocument();
  });

  it('triggers onReset when clicking Pilih Ulang Metode Pembayaran Otomatis', () => {
    const handleReset = vi.fn();
    const pending = { bank: 'BCA', vaNumber: '1234567890' };
    render(
      <MemoryRouter>
        <MidtransPaymentSection isPayingSnap={false} snapError={null} onPay={vi.fn()} pendingPayment={pending} onReset={handleReset} />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByRole('button', { name: /Pilih Ulang Metode Pembayaran Otomatis/i }));
    expect(handleReset).toHaveBeenCalledTimes(1);
  });

  it('renders pending QRIS image when pendingPayment has qrUrl', () => {
    const pending = { qrUrl: 'https://api.sandbox.midtrans.com/v2/qris/test/qr-code' };
    render(
      <MemoryRouter>
        <MidtransPaymentSection isPayingSnap={false} snapError={null} onPay={vi.fn()} pendingPayment={pending} />
      </MemoryRouter>
    );
    expect(screen.getByText('QRIS Pembayaran')).toBeInTheDocument();
    expect(screen.getByAltText('QR Code Pembayaran')).toHaveAttribute('src', pending.qrUrl);
  });
});
