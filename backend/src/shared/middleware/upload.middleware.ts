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

function checkFileMime(mimetype: string): string | null {
  if (!ALLOWED_MIME_TYPES.has(mimetype)) {
    return 'Hanya file gambar (.jpg, .jpeg, .png, .gif, .webp) yang diperbolehkan.';
  }
  return null;
}

function fileFilter(_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback): void {
  const err = validateFilename(file.originalname) || checkFileMime(file.mimetype);
  if (err) return cb(AppError.badRequest(err));
  cb(null, true);
}

const uploader = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
  fileFilter,
});

function resolveMulterMessage(code: string, maxCount?: number): string | null {
  if (code === 'LIMIT_FILE_SIZE') return 'Ukuran file maksimal 1MB.';
  if (code === 'LIMIT_UNEXPECTED_FILE') {
    return maxCount ? `Maksimal ${maxCount} file gambar yang dapat diunggah.` : 'Jumlah file melebihi batas.';
  }
  return null;
}

function handleMulterError(err: unknown, next: NextFunction, maxCount?: number): void {
  if (!(err instanceof MulterError)) return next(err);
  const msg = resolveMulterMessage(err.code, maxCount);
  if (msg) return next(AppError.badRequest(msg));
  next(err);
}

function checkSingleFile(file: Express.Multer.File | undefined, fieldName: string) {
  if (!file) throw AppError.badRequest(`File '${fieldName}' wajib diunggah.`);
  validateFileSecurity(file);
}

export function uploadSingleImage(fieldName: string) {
  const upload = uploader.single(fieldName);
  return (req: Request, res: Response, next: NextFunction): void => {
    upload(req, res, (err) => {
      if (err) return handleMulterError(err, next);
      try { checkSingleFile(req.file, fieldName); next(); }
      catch (secErr) { next(secErr); }
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

function checkMultipleFiles(files: Express.Multer.File[]) {
  for (const file of files) validateFileSecurity(file);
}

export function uploadMultipleImages(fieldName: string, maxCount = 6) {
  const upload = uploader.array(fieldName, maxCount);
  return (req: Request, res: Response, next: NextFunction): void => {
    upload(req, res, (err) => {
      if (err) return handleMulterError(err, next, maxCount);
      if (!validateFilesList(req.files, fieldName, next)) return;
      try { checkMultipleFiles(req.files as Express.Multer.File[]); next(); }
      catch (secErr) { next(secErr); }
    });
  };
}
