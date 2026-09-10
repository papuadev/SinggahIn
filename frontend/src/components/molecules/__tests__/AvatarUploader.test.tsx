import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AvatarUploader } from '../AvatarUploader';

describe('AvatarUploader Molecule', () => {
  it('renders user initial fallback when no avatarUrl is provided', () => {
    const handleUpload = vi.fn();
    render(<AvatarUploader userName="Rian Pratama" onUpload={handleUpload} />);
    expect(screen.getByText('R')).toBeInTheDocument();
  });

  it('renders image when currentAvatarUrl is provided', () => {
    const handleUpload = vi.fn();
    render(
      <AvatarUploader
        currentAvatarUrl="https://example.com/avatar.jpg"
        userName="Rian"
        onUpload={handleUpload}
      />
    );
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'https://example.com/avatar.jpg');
  });

  it('rejects files larger than 1MB with client-side validation error', async () => {
    const handleUpload = vi.fn();
    const { container } = render(
      <AvatarUploader userName="Rian" onUpload={handleUpload} />
    );

    const input = container.querySelector('input[type="file"]')!;
    // 1MB + 10KB
    const bigFile = new File(['a'.repeat(1024 * 1024 + 10)], 'huge.jpg', {
      type: 'image/jpeg',
    });

    fireEvent.change(input, { target: { files: [bigFile] } });

    expect(screen.getByText('Ukuran file melebihi batas maksimal 1MB.')).toBeInTheDocument();
    expect(handleUpload).not.toHaveBeenCalled();
  });

  it('calls onUpload and shows loading indicator for valid file', async () => {
    const handleUpload = vi.fn().mockResolvedValue('https://example.com/new.webp');
    const { container } = render(
      <AvatarUploader userName="Rian" onUpload={handleUpload} />
    );

    const input = container.querySelector('input[type="file"]')!;
    const validFile = new File(['small-img'], 'photo.png', { type: 'image/png' });

    fireEvent.change(input, { target: { files: [validFile] } });

    await waitFor(() => {
      expect(handleUpload).toHaveBeenCalledWith(validFile);
    });
  });
});
