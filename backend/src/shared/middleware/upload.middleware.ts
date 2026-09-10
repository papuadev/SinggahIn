import { Request, Response, NextFunction } from 'express';
import multer, { MulterError } from 'multer';
import { AppError } from '../utils/app-error';

export const MAX_FILE_SIZE_BYTES = 1 * 1024 * 1024; // 1MB (CON-004)

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
]);

function fileFilter(
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
): void {
  if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
    cb(null, true);
    return;
  }
  cb(AppError.badRequest('Hanya file gambar (.jpg, .jpeg, .png, .gif, .webp) yang diperbolehkan.'));
}

const uploader = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
  fileFilter,
});

function handleMulterError(err: unknown, next: NextFunction): void {
  if (err instanceof MulterError && err.code === 'LIMIT_FILE_SIZE') {
    next(AppError.badRequest('Ukuran file maksimal 1MB.'));
    return;
  }
  next(err);
}

export function uploadSingleImage(fieldName: string) {
  const upload = uploader.single(fieldName);
  return (req: Request, res: Response, next: NextFunction): void => {
    upload(req, res, (err) => {
      if (err) {
        handleMulterError(err, next);
        return;
      }
      if (!req.file) {
        next(AppError.badRequest(`File '${fieldName}' wajib diunggah.`));
        return;
      }
      next();
    });
  };
}
