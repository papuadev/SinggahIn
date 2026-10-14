import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PaymentMethodSwitcher } from '../components/PaymentMethodSwitcher';

describe('PaymentMethodSwitcher', () => {
  it('renders both payment options and marks current active', () => {
    render(
      <PaymentMethodSwitcher
        currentMethod="MANUAL_TRANSFER"
        isSwitching={false}
        onSwitch={vi.fn()}
      />
    );
    expect(screen.getByText('Transfer Bank Manual')).toBeInTheDocument();
    expect(screen.getByText('Pembayaran Otomatis')).toBeInTheDocument();
  });

  it('calls onSwitch when user clicks inactive method', () => {
    const handleSwitch = vi.fn();
    render(
      <PaymentMethodSwitcher
        currentMethod="MANUAL_TRANSFER"
        isSwitching={false}
        onSwitch={handleSwitch}
      />
    );
    fireEvent.click(screen.getByText('Pembayaran Otomatis'));
    expect(handleSwitch).toHaveBeenCalledWith('PAYMENT_GATEWAY');
  });


  it('shows loading message when isSwitching is true', () => {
    render(
      <PaymentMethodSwitcher
        currentMethod="MANUAL_TRANSFER"
        isSwitching={true}
        onSwitch={vi.fn()}
      />
    );
    expect(screen.getByText(/Mengubah metode.../i)).toBeInTheDocument();
  });

  it('displays switch error when provided', () => {
    render(
      <PaymentMethodSwitcher
        currentMethod="MANUAL_TRANSFER"
        isSwitching={false}
        switchError="Jaringan bermasalah, gagal ganti metode"
        onSwitch={vi.fn()}
      />
    );
    expect(screen.getByText('Jaringan bermasalah, gagal ganti metode')).toBeInTheDocument();
  });
});
