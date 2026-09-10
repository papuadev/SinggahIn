import { v2 as cloudinary, UploadApiOptions, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export interface UploadResult {
  secureUrl: string;
  publicId: string;
}

function handleStreamCompletion(
  error: unknown,
  result: UploadApiResponse | undefined,
  resolve: (res: UploadResult) => void,
  reject: (err: unknown) => void
): void {
  if (error || !result) {
    reject(error || new Error('Gagal mengunggah gambar ke Cloudinary.'));
    return;
  }
  resolve({ secureUrl: result.secure_url, publicId: result.public_id });
}

export function uploadToCloudinary(
  buffer: Buffer,
  folder = 'singgahin/avatars',
  customOptions: UploadApiOptions = {}
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, format: 'webp', resource_type: 'image', ...customOptions },
      (err, res) => handleStreamCompletion(err, res, resolve, reject)
    );
    Readable.from(buffer).pipe(stream);
  });
}

export async function deleteFromCloudinary(publicId: string): Promise<void> {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch {
    // Continue execution even if deletion fails
  }
}
