import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  validateFilenameSecurity,
  validateImageFile,
  validateImageContentSecurity,
  validateImageBatch,
  validateImageBatchAsync,
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

function createMockFile(name: string, contentOrSize: string | number, type: string): File {
  const content = typeof contentOrSize === 'number' ? 'a'.repeat(contentOrSize) : contentOrSize;
  const blob = new Blob([content], { type });
  return new File([blob], name, { type });
}

describe('Property Image Validation Schema & Security Guards', () => {
  it('validates filename security against traversal, XSS, and double extensions', () => {
    expect(validateFilenameSecurity('')).toContain('tidak boleh kosong');
    expect(validateFilenameSecurity('../secret.png')).toContain('path traversal');
    expect(validateFilenameSecurity('<script>alert(1)</script>.png')).toContain('XSS injection');
    expect(validateFilenameSecurity('exploit.php.jpg')).toContain('double extension');
    expect(validateFilenameSecurity('virus.exe')).toContain('Format file harus JPG');
    expect(validateFilenameSecurity('villa.jpg')).toBeNull();
  });

  it('accepts valid JPEG, PNG, and WebP images under 1MB', () => {
    expect(validateImageFile(createMockFile('villa.jpg', 500 * 1024, 'image/jpeg'))).toBeNull();
    expect(validateImageFile(createMockFile('villa.png', 800 * 1024, 'image/png'))).toBeNull();
    expect(validateImageFile(createMockFile('villa.webp', 300 * 1024, 'image/webp'))).toBeNull();
  });

  it('rejects file larger than 1MB per CON-004', () => {
    const oversized = createMockFile('large.jpg', MAX_IMAGE_FILE_SIZE + 1024, 'image/jpeg');
    expect(validateImageFile(oversized)).toBe('Ukuran gambar maksimal 1MB per file.');
  });

  it('rejects unsupported mime types', () => {
    const pdf = createMockFile('doc.pdf', 100 * 1024, 'application/pdf');
    expect(validateImageFile(pdf)).toBe('Format file harus JPG, JPEG, PNG, atau WebP.');
  });

  it('intercepts XSS injection payload in file content asynchronously', async () => {
    const xssFile = createMockFile('clean.jpg', '<script>alert("xss")</script>', 'image/jpeg');
    const err = await validateImageContentSecurity(xssFile);
    expect(err).toContain('terdeteksi potensi injeksi skrip / XSS');

    const svgFile = createMockFile('img.png', '<svg onload=alert(1)>', 'image/png');
    expect(await validateImageContentSecurity(svgFile)).toContain('injeksi skrip / XSS');

    const safeFile = createMockFile('safe.png', 'pure-binary-content', 'image/png');
    expect(await validateImageContentSecurity(safeFile)).toBeNull();
  });

  it('validates batch image limits and content security asynchronously', async () => {
    const files = [
      createMockFile('f1.jpg', 100 * 1024, 'image/jpeg'),
      createMockFile('f2.jpg', 100 * 1024, 'image/jpeg'),
    ];
    expect(validateImageBatch([], 0)).toBe('Pilih minimal 1 file gambar.');
    expect(validateImageBatch(files, 5)).toBe('Maksimal total 6 foto per properti.');
    expect(await validateImageBatchAsync(files, 2)).toBeNull();

    const maliciousBatch = [
      createMockFile('ok.jpg', 'clean', 'image/jpeg'),
      createMockFile('bad.jpg', '<script>alert(1)</script>', 'image/jpeg'),
    ];
    const batchErr = await validateImageBatchAsync(maliciousBatch, 0);
    expect(batchErr).toContain('bad.jpg: File terindikasi membahayakan keamanan');
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
