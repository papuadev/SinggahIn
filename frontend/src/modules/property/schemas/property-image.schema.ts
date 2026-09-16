export const MAX_IMAGE_FILE_SIZE = 1 * 1024 * 1024; // 1MB per CON-004
export const MAX_PROPERTY_IMAGES = 6;
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return 'Format file harus JPG, JPEG, PNG, atau WebP.';
  }
  if (file.size > MAX_IMAGE_FILE_SIZE) {
    return 'Ukuran gambar maksimal 1MB per file.';
  }
  return null;
}

export function validateImageBatch(
  files: File[],
  currentCount: number
): string | null {
  if (files.length === 0) {
    return 'Pilih minimal 1 file gambar.';
  }
  if (currentCount + files.length > MAX_PROPERTY_IMAGES) {
    return `Maksimal total ${MAX_PROPERTY_IMAGES} foto per properti.`;
  }
  for (const file of files) {
    const error = validateImageFile(file);
    if (error) return `${file.name}: ${error}`;
  }
  return null;
}
