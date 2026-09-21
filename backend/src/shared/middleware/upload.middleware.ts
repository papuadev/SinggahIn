import { Request, Response, NextFunction } from 'express';
import multer, { MulterError } from 'multer';
import { AppError } from '../utils/app-error';
import {
  ALLOWED_MIME_TYPES,
  validateFilename,
  validateFileSecurity,
} from '../utils/image-security.util';

export const MAX_FILE_SIZE_BYTES = 1 * 1024 * 1024; // 1MB (CON-004)
export { ALLOWED_MIME_TYPES };

function fileFilter(
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
): void {
  const filenameErr = validateFilename(file.originalname);
  if (filenameErr) {
    cb(AppError.badRequest(filenameErr));
    return;
  }
  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    cb(
      AppError.badRequest(
        'Hanya file gambar (.jpg, .jpeg, .png, .gif, .webp) yang diperbolehkan.'
      )
    );
    return;
  }
  cb(null, true);
}

const uploader = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
  fileFilter,
});

function handleMulterError(
  err: unknown,
  next: NextFunction,
  maxCount?: number
): void {
  if (!(err instanceof MulterError)) return next(err);
  if (err.code === 'LIMIT_FILE_SIZE') {
    return next(AppError.badRequest('Ukuran file maksimal 1MB.'));
  }
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    const msg = maxCount
      ? `Maksimal ${maxCount} file gambar yang dapat diunggah.`
      : 'Jumlah file melebihi batas.';
    return next(AppError.badRequest(msg));
  }
  next(err);
}

export function uploadSingleImage(fieldName: string) {
  const upload = uploader.single(fieldName);
  return (req: Request, res: Response, next: NextFunction): void => {
    upload(req, res, (err) => {
      if (err) return handleMulterError(err, next);
      if (!req.file) {
        return next(AppError.badRequest(`File '${fieldName}' wajib diunggah.`));
      }
      try {
        validateFileSecurity(req.file);
      } catch (secErr) {
        return next(secErr);
      }
      next();
    });
  };
}

function validateFilesList(
  files: unknown,
  field: string,
  next: NextFunction
): boolean {
  const list = files as Express.Multer.File[] | undefined;
  if (!list || list.length === 0) {
    next(AppError.badRequest(`Minimal 1 file gambar '${field}' wajib diunggah.`));
    return false;
  }
  return true;
}

export function uploadMultipleImages(fieldName: string, maxCount = 6) {
  const upload = uploader.array(fieldName, maxCount);
  return (req: Request, res: Response, next: NextFunction): void => {
    upload(req, res, (err) => {
      if (err) return handleMulterError(err, next, maxCount);
      if (!validateFilesList(req.files, fieldName, next)) return;
      const files = req.files as Express.Multer.File[];
      for (const file of files) {
        try {
          validateFileSecurity(file);
        } catch (secErr) {
          return next(secErr);
        }
      }
      next();
    });
  };
}
