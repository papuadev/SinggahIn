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
    reorderImages: vi.fn(),
  },
}));

function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

const mockImages: PropertyImage[] = [
  { id: 'img-1', propertyId: 'prop-123', imageUrl: 'https://res.cloudinary.com/demo/image1.webp', publicId: 'image1', isCover: true },
  { id: 'img-2', propertyId: 'prop-123', imageUrl: 'https://res.cloudinary.com/demo/image2.webp', publicId: 'image2', isCover: false },
];

describe('PropertyGalleryManager - Uploaded Image Reorder', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('allows user to sort/reorder already uploaded images using navigation buttons', async () => {
    vi.mocked(propertyApi.reorderImages).mockResolvedValueOnce({
      success: true, message: 'Urutan foto diperbarui', data: [mockImages[1], mockImages[0]],
    });

    renderWithClient(<PropertyGalleryManager propertyId="prop-123" images={mockImages} />);
    const moveRightButtons = screen.getAllByRole('button', { name: /Pindah urutan ke kanan/i });
    expect(moveRightButtons[0]).toBeInTheDocument();
    fireEvent.click(moveRightButtons[0]);

    await waitFor(() => {
      expect(propertyApi.reorderImages).toHaveBeenCalledWith('prop-123', ['img-2', 'img-1']);
    });
  });

  it('allows user to sort/reorder already uploaded images using drag and drop', async () => {
    vi.mocked(propertyApi.reorderImages).mockResolvedValueOnce({
      success: true, message: 'Urutan foto diperbarui', data: [mockImages[1], mockImages[0]],
    });

    renderWithClient(<PropertyGalleryManager propertyId="prop-123" images={mockImages} />);
    const uploadedCard1 = screen.getByText('#1').closest('div[draggable="true"]')!;
    const uploadedCard2 = screen.getByText('#2').closest('div[draggable="true"]')!;

    fireEvent.dragStart(uploadedCard1, {
      dataTransfer: { setData: vi.fn(), getData: vi.fn().mockReturnValue('uploaded:0') },
    });
    fireEvent.drop(uploadedCard2, {
      dataTransfer: { getData: () => 'uploaded:0' },
    });

    await waitFor(() => {
      expect(propertyApi.reorderImages).toHaveBeenCalledWith('prop-123', ['img-2', 'img-1']);
    });
  });

  it('reverts uploaded images order and displays error message if reorder API call fails', async () => {
    vi.mocked(propertyApi.reorderImages).mockRejectedValueOnce(
      new Error('Gagal mengubah urutan foto di server')
    );

    renderWithClient(<PropertyGalleryManager propertyId="prop-123" images={mockImages} />);
    const moveRightButtons = screen.getAllByRole('button', { name: /Pindah urutan ke kanan/i });
    fireEvent.click(moveRightButtons[0]);

    await waitFor(() => {
      expect(screen.getByText(/Gagal mengubah urutan foto di server/i)).toBeInTheDocument();
    });
  });
});
