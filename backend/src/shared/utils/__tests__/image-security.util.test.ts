import { describe, it, expect } from 'vitest';
import {
  validateFilename,
  hasValidImageMagicBytes,
  detectScriptInjection,
  validateFileSecurity,
} from '../image-security.util';

const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const JPG_MAGIC = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46]);
const GIF_MAGIC = Buffer.from([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]);
const WEBP_MAGIC = Buffer.from([
  0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50,
]);

describe('Image Security Utility', () => {
  describe('validateFilename', () => {
    it('returns error for empty filename', () => {
      expect(validateFilename('')).toContain('tidak boleh kosong');
      expect(validateFilename('   ')).toContain('tidak boleh kosong');
    });

    it('rejects path traversal and null bytes', () => {
      expect(validateFilename('../photo.jpg')).toContain('path traversal');
      expect(validateFilename('sub/photo.jpg')).toContain('path traversal');
      expect(validateFilename('photo.jpg\0.png')).toContain('path traversal');
    });

    it('rejects filenames with XSS injection characters', () => {
      expect(validateFilename('<script>alert(1)</script>.png')).toContain('XSS injection');
      expect(validateFilename('img"onclick="alert(1).jpg')).toContain('XSS injection');
      expect(validateFilename('javascript:void(0).png')).toContain('XSS injection');
    });

    it('rejects disallowed extensions', () => {
      expect(validateFilename('file.exe')).toContain('Hanya file gambar');
      expect(validateFilename('doc.pdf')).toContain('Hanya file gambar');
      expect(validateFilename('vector.svg')).toContain('Hanya file gambar');
    });

    it('rejects double extension containing dangerous extensions', () => {
      expect(validateFilename('exploit.php.jpg')).toContain('double extension');
      expect(validateFilename('xss.html.png')).toContain('double extension');
      expect(validateFilename('payload.js.webp')).toContain('double extension');
    });

    it('accepts safe valid filenames', () => {
      expect(validateFilename('villa.jpg')).toBeNull();
      expect(validateFilename('ROOM_2026.PNG')).toBeNull();
      expect(validateFilename('view.webp')).toBeNull();
    });
  });

  describe('hasValidImageMagicBytes', () => {
    it('identifies valid JPEG, PNG, GIF, and WebP headers', () => {
      expect(hasValidImageMagicBytes(JPG_MAGIC)).toBe(true);
      expect(hasValidImageMagicBytes(PNG_MAGIC)).toBe(true);
      expect(hasValidImageMagicBytes(GIF_MAGIC)).toBe(true);
      expect(hasValidImageMagicBytes(WEBP_MAGIC)).toBe(true);
    });

    it('rejects buffers without valid magic bytes', () => {
      expect(hasValidImageMagicBytes(Buffer.from('hello-world'))).toBe(false);
      expect(hasValidImageMagicBytes(Buffer.from([0x00, 0x01]))).toBe(false);
      expect(hasValidImageMagicBytes(Buffer.alloc(0))).toBe(false);
    });
  });

  describe('detectScriptInjection', () => {
    it('detects embedded script and svg tags', () => {
      const scriptBuf = Buffer.from('data <script>alert("xss")</script> data');
      expect(detectScriptInjection(scriptBuf)).toContain('injeksi skrip / XSS');

      const svgBuf = Buffer.from('<svg onload="alert(1)">');
      expect(detectScriptInjection(svgBuf)).toContain('injeksi skrip / XSS');
    });

    it('detects html tags and event handlers', () => {
      const htmlBuf = Buffer.from('<iframe src="malicious.com"></iframe>');
      expect(detectScriptInjection(htmlBuf)).toContain('injeksi skrip / XSS');

      const eventBuf = Buffer.from('image content onerror=alert(1)');
      expect(detectScriptInjection(eventBuf)).toContain('injeksi skrip / XSS');
    });

    it('detects null-byte obfuscated payloads', () => {
      const nullByteScript = Buffer.from('<\0s\0c\0r\0i\0p\0t\0>', 'binary');
      expect(detectScriptInjection(nullByteScript)).toContain('injeksi skrip / XSS');
    });

    it('returns null for clean image buffer', () => {
      const cleanBuf = Buffer.concat([PNG_MAGIC, Buffer.from('clean-binary-data')]);
      expect(detectScriptInjection(cleanBuf)).toBeNull();
    });
  });

  describe('validateFileSecurity', () => {
    it('accepts a fully compliant image file', () => {
      const file = {
        originalname: 'hotel.jpg',
        mimetype: 'image/jpeg',
        buffer: Buffer.concat([JPG_MAGIC, Buffer.from('clean-content')]),
      } as Express.Multer.File;

      expect(() => validateFileSecurity(file)).not.toThrow();
    });

    it('throws AppError when magic bytes or xss validation fails', () => {
      const badMagic = {
        originalname: 'fake.png',
        mimetype: 'image/png',
        buffer: Buffer.from('not an image'),
      } as Express.Multer.File;
      expect(() => validateFileSecurity(badMagic)).toThrow('magic bytes mismatch');

      const xssFile = {
        originalname: 'xss.png',
        mimetype: 'image/png',
        buffer: Buffer.concat([PNG_MAGIC, Buffer.from('<script>alert(1)</script>')]),
      } as Express.Multer.File;
      expect(() => validateFileSecurity(xssFile)).toThrow('injeksi skrip / XSS');
    });
  });
});
