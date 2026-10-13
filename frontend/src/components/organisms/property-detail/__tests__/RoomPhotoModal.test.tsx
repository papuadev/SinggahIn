import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RoomPhotoModal } from '../RoomPhotoModal';

describe('RoomPhotoModal Component', () => {
  const mockImages = [
    'https://images.unsplash.com/photo-1?w=800',
    'https://images.unsplash.com/photo-2?w=800',
    'https://images.unsplash.com/photo-3?w=800',
  ];

  it('renders modal with room title badge and first photo when open', () => {
    render(<RoomPhotoModal isOpen={true} onClose={vi.fn()} roomName="Deluxe Room" images={mockImages} />);
    expect(screen.getByText('Deluxe Room')).toBeInTheDocument();
    expect(screen.getByAltText('Deluxe Room foto 1')).toBeInTheDocument();
    expect(screen.getByText('1 / 3')).toBeInTheDocument();
  });

  it('navigates next and previous photos using navigation buttons', () => {
    render(<RoomPhotoModal isOpen={true} onClose={vi.fn()} roomName="Deluxe Room" images={mockImages} />);
    const nextBtn = screen.getByRole('button', { name: /Foto berikutnya/i });
    const prevBtn = screen.getByRole('button', { name: /Foto sebelumnya/i });

    fireEvent.click(nextBtn);
    expect(screen.getByAltText('Deluxe Room foto 2')).toBeInTheDocument();
    expect(screen.getByText('2 / 3')).toBeInTheDocument();

    fireEvent.click(prevBtn);
    expect(screen.getByAltText('Deluxe Room foto 1')).toBeInTheDocument();
    expect(screen.getByText('1 / 3')).toBeInTheDocument();
  });

  it('navigates when clicking thumbnail button', () => {
    render(<RoomPhotoModal isOpen={true} onClose={vi.fn()} roomName="Deluxe Room" images={mockImages} />);
    const thumb3 = screen.getByRole('button', { name: /Thumbnail 3/i });
    fireEvent.click(thumb3);
    expect(screen.getByAltText('Deluxe Room foto 3')).toBeInTheDocument();
    expect(screen.getByText('3 / 3')).toBeInTheDocument();
  });

  it('shows fallback notice when isFallback is true', () => {
    render(<RoomPhotoModal isOpen={true} onClose={vi.fn()} roomName="Standard Room" images={['https://photo.cover']} isFallback={true} />);
    expect(screen.getByText(/Menampilkan foto utama penginapan karena tipe kamar ini belum memiliki foto spesifik/i)).toBeInTheDocument();
  });

  it('renders empty photo notice when no images are provided', () => {
    render(<RoomPhotoModal isOpen={true} onClose={vi.fn()} roomName="Empty Room" images={[]} />);
    expect(screen.getByText(/Belum ada foto yang tersedia untuk kamar ini/i)).toBeInTheDocument();
  });

  it('calls onClose when clicking close button', () => {
    const handleClose = vi.fn();
    render(<RoomPhotoModal isOpen={true} onClose={handleClose} roomName="Deluxe Room" images={mockImages} />);
    fireEvent.click(screen.getByRole('button', { name: /Tutup foto kamar/i }));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
