export const MAX_IMAGE_FILE_SIZE = 1 * 1024 * 1024; // 1MB per CON-004
export const MAX_PROPERTY_IMAGES = 6;
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg', 'image/jpg', 'image/png', 'image/webp',
];

export const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

export const DANGEROUS_EXTENSIONS = [
  '.svg', '.html', '.htm', '.xhtml', '.xml', '.js', '.mjs',
  '.php', '.phtml', '.cgi', '.pl', '.py', '.sh', '.bash',
  '.exe', '.bat', '.cmd', '.vbs', '.jsp', '.asp',
];

export const SCRIPT_INJECTION_PATTERNS = [
  /<\s*script/i, /javascript\s*:/i, /vbscript\s*:/i, /<\s*svg/i,
  /<\s*html/i, /<\s*body/i, /<\s*iframe/i, /<\s*object/i, /<\s*embed/i,
  /<\s*form/i, /<\s*link/i, /<\s*style/i, /<\s*meta/i, /<\s*\?xml/i,
  /xmlns\s*=\s*['"][^'"]*svg/i, /data:\s*text\/html/i, /data:\s*image\/svg\+xml/i,
  /onload\s*=/i, /onerror\s*=/i, /onclick\s*=/i, /onmouseover\s*=/i,
  /onfocus\s*=/i, /onblur\s*=/i, /<!(?:DOCTYPE|ENTITY)/i,
];

function checkPathTraversal(filename: string): string | null {
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

function checkXssInFilename(filename: string): string | null {
  if (
    /[<>"'`;&$|]/.test(filename) ||
    /script/i.test(filename) ||
    /javascript:/i.test(filename)
  ) {
    return 'Nama file mengandung karakter atau pola berisiko keamanan (XSS injection).';
  }
  return null;
}

function checkExtensionValidity(lowerName: string): string | null {
  const lastDot = lowerName.lastIndexOf('.');
  if (lastDot === -1) return 'Format file harus JPG, JPEG, PNG, atau WebP.';
  const ext = lowerName.slice(lastDot);
  if (!ALLOWED_IMAGE_EXTENSIONS.includes(ext)) {
    return 'Format file harus JPG, JPEG, PNG, atau WebP.';
  }
  return null;
}

function checkDangerousDoubleExt(lowerName: string): string | null {
  const lastDot = lowerName.lastIndexOf('.');
  const nameBefore = lowerName.slice(0, lastDot);
  for (const danger of DANGEROUS_EXTENSIONS) {
    if (nameBefore.includes(danger)) {
      return 'File terindikasi double extension berbahaya.';
    }
  }
  return null;
}

export function validateFilenameSecurity(filename: string): string | null {
  if (!filename || filename.trim().length === 0) {
    return 'Nama file tidak boleh kosong.';
  }
  const xssErr = checkXssInFilename(filename);
  if (xssErr) return xssErr;
  const pathErr = checkPathTraversal(filename);
  if (pathErr) return pathErr;
  const lower = filename.toLowerCase();
  const extErr = checkExtensionValidity(lower);
  if (extErr) return extErr;
  return checkDangerousDoubleExt(lower);
}

export function validateImageFile(file: File): string | null {
  const filenameErr = validateFilenameSecurity(file.name);
  if (filenameErr) return filenameErr;
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return 'Format file harus JPG, JPEG, PNG, atau WebP.';
  }
  if (file.size > MAX_IMAGE_FILE_SIZE) {
    return 'Ukuran gambar maksimal 1MB per file.';
  }
  return null;
}

function readFileSampleText(slice: Blob): Promise<string> {
  if (typeof slice.text === 'function') {
    return slice.text();
  }
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string) || '');
    reader.onerror = () => resolve('');
    reader.readAsText(slice);
  });
}

export async function validateImageContentSecurity(file: File): Promise<string | null> {
  const syncErr = validateImageFile(file);
  if (syncErr) return syncErr;
  try {
    const rawText = await readFileSampleText(file.slice(0, 8192));
    const text = rawText.replace(/\0/g, '');
    for (const pattern of SCRIPT_INJECTION_PATTERNS) {
      if (pattern.test(text)) {
        return 'File terindikasi membahayakan keamanan (terdeteksi potensi injeksi skrip / XSS).';
      }
    }
  } catch {
    // Fallback: let backend perform deep binary inspection
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

export async function validateImageBatchAsync(
  files: File[],
  currentCount: number
): Promise<string | null> {
  const syncErr = validateImageBatch(files, currentCount);
  if (syncErr) return syncErr;
  for (const file of files) {
    const secErr = await validateImageContentSecurity(file);
    if (secErr) return `${file.name}: ${secErr}`;
  }
  return null;
}
