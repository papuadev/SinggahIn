import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  validateImageFile,
  validateImageBatch,
  MAX_IMAGE_FILE_SIZE,
} from '../schemas/property-image.schema';
import { propertyApi } from '../services/property.api';
import { apiClient } from '../../../libs/axios';

vi.mock('../../../libs/axios', () => ({
  apiClient: {
    post: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
  },
}));

function createMockFile(name: string, size: number, type: string): File {
  const blob = new Blob(['a'.repeat(size)], { type });
  return new File([blob], name, { type });
}

describe('Property Image Validation Schema', () => {
  it('accepts valid JPEG, PNG, and WebP images under 1MB', () => {
    const file = createMockFile('villa.jpg', 500 * 1024, 'image/jpeg');
    expect(validateImageFile(file)).toBeNull();

    const png = createMockFile('villa.png', 800 * 1024, 'image/png');
    expect(validateImageFile(png)).toBeNull();

    const webp = createMockFile('villa.webp', 300 * 1024, 'image/webp');
    expect(validateImageFile(webp)).toBeNull();
  });

  it('rejects file larger than 1MB per CON-004', () => {
    const oversizedFile = createMockFile(
      'large.jpg',
      MAX_IMAGE_FILE_SIZE + 1024,
      'image/jpeg'
    );
    expect(validateImageFile(oversizedFile)).toBe('Ukuran gambar maksimal 1MB per file.');
  });

  it('rejects unsupported mime types', () => {
    const pdf = createMockFile('doc.pdf', 100 * 1024, 'application/pdf');
    expect(validateImageFile(pdf)).toBe('Format file harus JPG, JPEG, PNG, atau WebP.');
  });

  it('validates batch image limits (max 6 images total)', () => {
    const files = [
      createMockFile('f1.jpg', 100 * 1024, 'image/jpeg'),
      createMockFile('f2.jpg', 100 * 1024, 'image/jpeg'),
      createMockFile('f3.jpg', 100 * 1024, 'image/jpeg'),
    ];
    expect(validateImageBatch([], 0)).toBe('Pilih minimal 1 file gambar.');
    expect(validateImageBatch(files, 4)).toBe('Maksimal total 6 foto per properti.');
    expect(validateImageBatch(files, 2)).toBeNull();
  });
});

describe('Property Image API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls uploadImages with FormData', async () => {
    const files = [createMockFile('photo.jpg', 100, 'image/jpeg')];
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      data: { success: true, message: 'Uploaded', data: [] },
    });

    const res = await propertyApi.uploadImages('prop-1', files);
    expect(apiClient.post).toHaveBeenCalledWith(
      '/properties/prop-1/images',
      expect.any(FormData),
      expect.objectContaining({ headers: { 'Content-Type': 'multipart/form-data' } })
    );
    expect(res.success).toBe(true);
  });

  it('calls deleteImage with property and image ids', async () => {
    vi.mocked(apiClient.delete).mockResolvedValueOnce({
      data: { success: true, message: 'Deleted', data: null },
    });

    const res = await propertyApi.deleteImage('prop-1', 'img-1');
    expect(apiClient.delete).toHaveBeenCalledWith('/properties/prop-1/images/img-1');
    expect(res.success).toBe(true);
  });

  it('calls setCoverImage with property and image ids', async () => {
    vi.mocked(apiClient.patch).mockResolvedValueOnce({
      data: { success: true, message: 'Cover updated', data: {} },
    });

    const res = await propertyApi.setCoverImage('prop-1', 'img-1');
    expect(apiClient.patch).toHaveBeenCalledWith('/properties/prop-1/images/img-1/cover');
    expect(res.success).toBe(true);
  });
});
