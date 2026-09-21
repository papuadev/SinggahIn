import path from 'path';
import { AppError } from './app-error';

export const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
]);

export const ALLOWED_EXTENSIONS = new Set([
  '.jpg', '.jpeg', '.png', '.gif', '.webp',
]);

export const DANGEROUS_EXTENSIONS = [
  /\.svg/i, /\.html?/i, /\.xhtml/i, /\.xml/i, /\.js/i, /\.mjs/i,
  /\.php/i, /\.phtml/i, /\.cgi/i, /\.pl/i, /\.py/i, /\.sh/i,
  /\.bash/i, /\.exe/i, /\.bat/i, /\.cmd/i, /\.vbs/i, /\.jsp/i, /\.asp/i,
];

export const SCRIPT_INJECTION_PATTERNS = [
  /<\s*script/i, /javascript\s*:/i, /vbscript\s*:/i, /<\s*svg/i,
  /<\s*html/i, /<\s*body/i, /<\s*iframe/i, /<\s*object/i, /<\s*embed/i,
  /<\s*form/i, /<\s*link/i, /<\s*style/i, /<\s*meta/i, /<\s*\?xml/i,
  /xmlns\s*=\s*['"][^'"]*svg/i, /data:\s*text\/html/i, /data:\s*image\/svg\+xml/i,
  /onload\s*=/i, /onerror\s*=/i, /onclick\s*=/i, /onmouseover\s*=/i,
  /onfocus\s*=/i, /onblur\s*=/i, /<!(?:DOCTYPE|ENTITY)/i,
];

function checkPathAndNull(filename: string): string | null {
  if (
    filename.includes('\0') ||
    filename.includes('..') ||
    filename.includes('/') ||
    filename.includes('\\')
  ) {
    return 'Nama file terindikasi path traversal atau karakter terlarang.';
  }
  return null;
}

function checkFilenameXss(filename: string): string | null {
  if (
    /[<>"'`;&$|]/.test(filename) ||
    /script/i.test(filename) ||
    /javascript:/i.test(filename)
  ) {
    return 'Nama file mengandung karakter atau pola berisiko keamanan (XSS injection).';
  }
  return null;
}

function checkExtension(ext: string): string | null {
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return 'Hanya file gambar (.jpg, .jpeg, .png, .gif, .webp) yang diperbolehkan.';
  }
  return null;
}

function checkDoubleExtension(nameWithoutExt: string): string | null {
  for (const pattern of DANGEROUS_EXTENSIONS) {
    if (pattern.test(nameWithoutExt)) {
      return 'File terindikasi double extension berbahaya.';
    }
  }
  return null;
}

export function validateFilename(filename: string): string | null {
  if (!filename || filename.trim().length === 0) {
    return 'Nama file tidak boleh kosong.';
  }
  const xssErr = checkFilenameXss(filename);
  if (xssErr) return xssErr;
  const pathErr = checkPathAndNull(filename);
  if (pathErr) return pathErr;

  const lowerName = filename.toLowerCase();
  const ext = path.extname(lowerName);
  const extErr = checkExtension(ext);
  if (extErr) return extErr;

  return checkDoubleExtension(lowerName.slice(0, -ext.length));
}

function isJpeg(b: Buffer): boolean {
  return b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;
}

function isPng(b: Buffer): boolean {
  return (
    b.length >= 8 &&
    b[0] === 0x89 &&
    b[1] === 0x50 &&
    b[2] === 0x4e &&
    b[3] === 0x47
  );
}

function isGif(b: Buffer): boolean {
  return (
    b.length >= 4 &&
    b[0] === 0x47 &&
    b[1] === 0x49 &&
    b[2] === 0x46 &&
    b[3] === 0x38
  );
}

function isWebp(b: Buffer): boolean {
  return (
    b.length >= 12 &&
    b[0] === 0x52 &&
    b[1] === 0x49 &&
    b[2] === 0x46 &&
    b[3] === 0x46 &&
    b[8] === 0x57 &&
    b[9] === 0x45 &&
    b[10] === 0x42 &&
    b[11] === 0x50
  );
}

export function hasValidImageMagicBytes(buffer: Buffer): boolean {
  if (!buffer || buffer.length < 3) return false;
  return isJpeg(buffer) || isPng(buffer) || isGif(buffer) || isWebp(buffer);
}

export function detectScriptInjection(buffer: Buffer): string | null {
  if (!buffer || buffer.length === 0) return null;
  const textSample = buffer.toString('latin1').replace(/\0/g, '');
  for (const pattern of SCRIPT_INJECTION_PATTERNS) {
    if (pattern.test(textSample)) {
      return 'File terindikasi membahayakan keamanan (terdeteksi potensi injeksi skrip / XSS).';
    }
  }
  return null;
}

export function validateFileSecurity(file: Express.Multer.File): void {
  const filenameErr = validateFilename(file.originalname);
  if (filenameErr) throw AppError.badRequest(filenameErr);

  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    throw AppError.badRequest(
      'Hanya file gambar (.jpg, .jpeg, .png, .gif, .webp) yang diperbolehkan.'
    );
  }

  if (!hasValidImageMagicBytes(file.buffer)) {
    throw AppError.badRequest(
      'File gambar tidak valid atau header file tidak sesuai (magic bytes mismatch).'
    );
  }

  const scriptErr = detectScriptInjection(file.buffer);
  if (scriptErr) throw AppError.badRequest(scriptErr);
}
