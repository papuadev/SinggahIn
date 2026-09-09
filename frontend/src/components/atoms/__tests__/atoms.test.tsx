import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../Button';
import { Input } from '../Input';
import { Label } from '../Label';
import { Alert } from '../Alert';
import { RoleBadge } from '../Badge';
import { Spinner } from '../Spinner';

describe('Atomic Design Atoms', () => {
  it('renders Button and triggers click event', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Kirim</Button>);
    const btn = screen.getByRole('button', { name: /kirim/i });
    fireEvent.click(btn);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('disables Button and shows spinner when isLoading is true', () => {
    render(<Button isLoading>Simpan</Button>);
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders Input with left icon and handles changes', () => {
    const handleChange = vi.fn();
    render(
      <Input
        placeholder="Alamat Email"
        leftIcon={<span data-testid="icon">@</span>}
        onChange={handleChange}
      />
    );
    const input = screen.getByPlaceholderText('Alamat Email');
    fireEvent.change(input, { target: { value: 'test@mail.com' } });
    expect(handleChange).toHaveBeenCalled();
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('renders Label with required asterisk', () => {
    render(<Label required>Nama Lengkap</Label>);
    expect(screen.getByText('Nama Lengkap')).toBeInTheDocument();
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('renders Alert with variant and title', () => {
    render(
      <Alert variant="error" title="Gagal">
        Email salah
      </Alert>
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Gagal')).toBeInTheDocument();
    expect(screen.getByText('Email salah')).toBeInTheDocument();
  });

  it('renders RoleBadge with correct text for USER and TENANT', () => {
    const { rerender } = render(<RoleBadge role="USER" />);
    expect(screen.getByText(/Penyewa/i)).toBeInTheDocument();

    rerender(<RoleBadge role="TENANT" />);
    expect(screen.getByText(/Pemilik/i)).toBeInTheDocument();
  });

  it('renders Spinner with accessible label', () => {
    render(<Spinner size="lg" />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Memuat...');
  });
});
