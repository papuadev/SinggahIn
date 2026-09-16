import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PropertyGalleryManager } from '../components/PropertyGalleryManager';
import { propertyApi } from '../services/property.api';
import { PropertyImage } from '../property.types';

vi.mock('../services/property.api', () => ({
  propertyApi: {
    uploadImages: vi.fn(),
    deleteImage: vi.fn(),
    setCoverImage: vi.fn(),
  },
}));

function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

const mockImages: PropertyImage[] = [
  {
    id: 'img-1',
    propertyId: 'prop-123',
    imageUrl: 'https://res.cloudinary.com/demo/image1.webp',
    publicId: 'image1',
    isCover: true,
  },
  {
    id: 'img-2',
    propertyId: 'prop-123',
    imageUrl: 'https://res.cloudinary.com/demo/image2.webp',
    publicId: 'image2',
    isCover: false,
  },
];

describe('PropertyGalleryManager Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders gallery header and image cards with cover badge', () => {
    renderWithClient(<PropertyGalleryManager propertyId="prop-123" images={mockImages} />);

    expect(screen.getByText('Galeri Foto Properti')).toBeInTheDocument();
    expect(screen.getByText('2 / 6 Foto')).toBeInTheDocument();
    expect(screen.getByText('Sampul Utama')).toBeInTheDocument();
    expect(screen.getByText('Jadikan Sampul')).toBeInTheDocument();
  });

  it('triggers setCoverImage when clicking Jadikan Sampul button', async () => {
    vi.mocked(propertyApi.setCoverImage).mockResolvedValueOnce({
      success: true,
      message: 'Cover set',
      data: { ...mockImages[1], isCover: true },
    });

    renderWithClient(<PropertyGalleryManager propertyId="prop-123" images={mockImages} />);
    const setCoverBtn = screen.getByRole('button', { name: /Jadikan Sampul/i });
    fireEvent.click(setCoverBtn);

    await waitFor(() => {
      expect(propertyApi.setCoverImage).toHaveBeenCalledWith('prop-123', 'img-2');
    });
  });

  it('triggers deleteImage when clicking delete button', async () => {
    vi.mocked(propertyApi.deleteImage).mockResolvedValueOnce({
      success: true,
      message: 'Deleted',
      data: null,
    });

    renderWithClient(<PropertyGalleryManager propertyId="prop-123" images={mockImages} />);
    const deleteButtons = screen.getAllByRole('button', { name: /Hapus foto/i });
    fireEvent.click(deleteButtons[1]);

    await waitFor(() => {
      expect(propertyApi.deleteImage).toHaveBeenCalledWith('prop-123', 'img-2');
    });
  });

  it('uploads valid image file via file input', async () => {
    vi.mocked(propertyApi.uploadImages).mockResolvedValueOnce({
      success: true,
      message: 'Uploaded',
      data: mockImages,
    });

    renderWithClient(<PropertyGalleryManager propertyId="prop-123" images={mockImages} />);
    const input = screen.getByLabelText('Unggah foto properti');
    const validFile = new File(['mock content'], 'villa.jpg', { type: 'image/jpeg' });

    fireEvent.change(input, { target: { files: [validFile] } });

    await waitFor(() => {
      expect(propertyApi.uploadImages).toHaveBeenCalledWith('prop-123', [validFile]);
    });
  });

  it('displays client-side validation error when file exceeds 1MB', async () => {
    renderWithClient(<PropertyGalleryManager propertyId="prop-123" images={mockImages} />);
    const input = screen.getByLabelText('Unggah foto properti');
    const largeBlob = new Blob(['x'.repeat(1.5 * 1024 * 1024)], { type: 'image/jpeg' });
    const largeFile = new File([largeBlob], 'big.jpg', { type: 'image/jpeg' });

    fireEvent.change(input, { target: { files: [largeFile] } });

    await waitFor(() => {
      expect(screen.getByText(/Ukuran gambar maksimal 1MB/i)).toBeInTheDocument();
      expect(propertyApi.uploadImages).not.toHaveBeenCalled();
    });
  });

  it('shows disabled message when 6 images already reached', () => {
    const fullImages: PropertyImage[] = Array.from({ length: 6 }, (_, i) => ({
      id: `img-${i}`,
      propertyId: 'prop-123',
      imageUrl: `https://res.cloudinary.com/demo/image${i}.webp`,
      publicId: `image${i}`,
      isCover: i === 0,
    }));

    renderWithClient(<PropertyGalleryManager propertyId="prop-123" images={fullImages} />);
    expect(screen.getByText('Batas maksimal 6 foto telah tercapai.')).toBeInTheDocument();
  });
});
