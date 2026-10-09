import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ManualTransferSection } from '../components/ManualTransferSection';

describe('ManualTransferSection', () => {
  it('renders bank account info and file dropzone when no existing proof', () => {
    render(<ManualTransferSection isUploading={false} uploadError={null} onUpload={vi.fn()} />);
    expect(screen.getByText('Instruksi Transfer Bank')).toBeInTheDocument();
    expect(screen.getByText('8820 1928 3810')).toBeInTheDocument();
    expect(screen.getByText(/Pilih atau Seret Foto Bukti Transfer/i)).toBeInTheDocument();
  });

  it('renders uploadSuccess toast when provided', () => {
    render(<ManualTransferSection isUploading={false} uploadError={null} uploadSuccess="Bukti pembayaran berhasil diunggah!" onUpload={vi.fn()} />);
    expect(screen.getByRole('status')).toHaveTextContent('Bukti pembayaran berhasil diunggah!');
  });

  it('renders existing proof image preview and hides dropzone when existingProofUrl is present', () => {
    const url = 'https://res.cloudinary.com/demo/image/upload/sample.jpg';
    render(<ManualTransferSection isUploading={false} uploadError={null} existingProofUrl={url} onUpload={vi.fn()} />);
    expect(screen.getByAltText('Bukti Pembayaran')).toHaveAttribute('src', url);
    expect(screen.getByText(/Bukti transfer berhasil diunggah/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Buka Gambar Penuh/i })).toHaveAttribute('href', url);
    expect(screen.queryByText(/Pilih atau Seret Foto Bukti Transfer/i)).not.toBeInTheDocument();
  });

  it('toggles back to upload dropzone when Unggah Ulang is clicked', () => {
    const url = 'https://res.cloudinary.com/demo/image/upload/sample.jpg';
    render(<ManualTransferSection isUploading={false} uploadError={null} existingProofUrl={url} onUpload={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /Unggah Ulang/i }));
    expect(screen.getByText(/Pilih atau Seret Foto Bukti Transfer/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Batal/i })).toBeInTheDocument();
  });
});
