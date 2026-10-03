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

  it('stages valid image file via file input and uploads only after user clicks upload button', async () => {
    vi.mocked(propertyApi.uploadImages).mockResolvedValueOnce({
      success: true,
      message: 'Uploaded',
      data: mockImages,
    });

    renderWithClient(<PropertyGalleryManager propertyId="prop-123" images={mockImages} />);
    const input = screen.getByLabelText('Unggah foto properti');
    const validFile = new File(['mock content'], 'villa.jpg', { type: 'image/jpeg' });

    fireEvent.change(input, { target: { files: [validFile] } });

    // File should be in staging (preview), not immediately uploaded to Cloudinary
    await waitFor(() => {
      expect(screen.getByText(/Foto Baru Dipilih/i)).toBeInTheDocument();
      expect(screen.getByText('1 Siap Diunggah')).toBeInTheDocument();
    });
    expect(propertyApi.uploadImages).not.toHaveBeenCalled();

    // Now user clicks upload button
    const uploadBtn = screen.getByRole('button', { name: /Unggah 1 Foto/i });
    fireEvent.click(uploadBtn);

    await waitFor(() => {
      expect(propertyApi.uploadImages).toHaveBeenCalledWith('prop-123', [validFile]);
    });
  });

  it('allows user to cancel/delete a staged image before upload without calling Cloudinary API', async () => {
    renderWithClient(<PropertyGalleryManager propertyId="prop-123" images={mockImages} />);
    const input = screen.getByLabelText('Unggah foto properti');
    const fileToCancel = new File(['mock content'], 'cancel-me.jpg', { type: 'image/jpeg' });

    fireEvent.change(input, { target: { files: [fileToCancel] } });

    await waitFor(() => {
      expect(screen.getByText('1 Siap Diunggah')).toBeInTheDocument();
    });

    // User cancels the staged file
    const cancelBtn = screen.getByRole('button', { name: /Batal unggah foto/i });
    fireEvent.click(cancelBtn);

    // Staged list is empty, and uploadImages is NEVER called
    await waitFor(() => {
      expect(screen.queryByText(/Foto Baru Dipilih/i)).not.toBeInTheDocument();
    });
    expect(propertyApi.uploadImages).not.toHaveBeenCalled();
  });

  it('allows user to sort/reorder staged images before uploading', async () => {
    vi.mocked(propertyApi.uploadImages).mockResolvedValueOnce({
      success: true,
      message: 'Uploaded',
      data: mockImages,
    });

    renderWithClient(<PropertyGalleryManager propertyId="prop-123" images={mockImages} />);
    const input = screen.getByLabelText('Unggah foto properti');
    const fileA = new File(['a'], 'foto-a.jpg', { type: 'image/jpeg' });
    const fileB = new File(['b'], 'foto-b.jpg', { type: 'image/jpeg' });

    fireEvent.change(input, { target: { files: [fileA, fileB] } });

    await waitFor(() => {
      expect(screen.getByText('2 Siap Diunggah')).toBeInTheDocument();
    });

    // Move first image to the right (swap A and B)
    const moveRightButtons = screen.getAllByRole('button', { name: /Pindah ke kanan/i });
    fireEvent.click(moveRightButtons[0]);

    // Click upload
    const uploadBtn = screen.getByRole('button', { name: /Unggah 2 Foto/i });
    fireEvent.click(uploadBtn);

    // Order should now be [fileB, fileA]
    await waitFor(() => {
      expect(propertyApi.uploadImages).toHaveBeenCalledWith('prop-123', [fileB, fileA]);
    });
  });

  it('supports drag and drop functionality on image upload area', async () => {
    vi.mocked(propertyApi.uploadImages).mockResolvedValueOnce({
      success: true,
      message: 'Uploaded',
      data: mockImages,
    });

    renderWithClient(<PropertyGalleryManager propertyId="prop-123" images={mockImages} />);
    const dropzone = screen.getByText(/Klik atau seret foto/i).closest('div')!;
    const droppedFile = new File(['content'], 'dropped.jpg', { type: 'image/jpeg' });

    // Drag over activates drag state
    fireEvent.dragOver(dropzone);
    expect(screen.getByText(/Lepaskan file di sini/i)).toBeInTheDocument();

    // Drag leave resets
    fireEvent.dragLeave(dropzone);
    expect(screen.getByText(/Klik atau seret foto/i)).toBeInTheDocument();

    // Drop files
    fireEvent.drop(dropzone, {
      dataTransfer: {
        files: [droppedFile],
      },
    });

    await waitFor(() => {
      expect(screen.getByText('1 Siap Diunggah')).toBeInTheDocument();
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

  it('displays validation error and halts upload when file has XSS injection', async () => {
    renderWithClient(<PropertyGalleryManager propertyId="prop-123" images={mockImages} />);
    const input = screen.getByLabelText('Unggah foto properti');
    const xssFile = new File(['<script>alert("xss")</script>'], 'xss.jpg', { type: 'image/jpeg' });

    fireEvent.change(input, { target: { files: [xssFile] } });

    await waitFor(() => {
      expect(screen.getByText(/terdeteksi potensi injeksi skrip \/ XSS/i)).toBeInTheDocument();
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
