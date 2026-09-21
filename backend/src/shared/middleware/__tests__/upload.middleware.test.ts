import express from 'express';
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { uploadSingleImage, uploadMultipleImages } from '../upload.middleware';
import { errorHandler } from '../error.middleware';

const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const JPG_MAGIC = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46]);

function createTestApp() {
  const app = express();
  app.post(
    '/test-upload',
    uploadSingleImage('avatar'),
    (req, res) => {
      res.json({
        success: true,
        filename: req.file?.originalname,
        size: req.file?.size,
      });
    }
  );
  app.post(
    '/test-upload-multiple',
    uploadMultipleImages('images', 3),
    (req, res) => {
      const files = req.files as Express.Multer.File[];
      res.json({
        success: true,
        count: files.length,
      });
    }
  );
  app.use(errorHandler);
  return app;
}

describe('Upload Middleware (Multer Memory Storage & Security Guard)', () => {
  const app = createTestApp();

  describe('uploadSingleImage', () => {
    it('should successfully accept valid image under 1MB into memory buffer', async () => {
      const smallBuffer = Buffer.concat([PNG_MAGIC, Buffer.from('fake-image-content')]);
      const res = await request(app)
        .post('/test-upload')
        .attach('avatar', smallBuffer, {
          filename: 'avatar.png',
          contentType: 'image/png',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.filename).toBe('avatar.png');
    });

    it('should reject image exceeding 1MB per CON-004', async () => {
      const largeBuffer = Buffer.alloc(1024 * 1024 + 100);
      const res = await request(app)
        .post('/test-upload')
        .attach('avatar', largeBuffer, {
          filename: 'large.jpg',
          contentType: 'image/jpeg',
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Ukuran file maksimal 1MB');
    });

    it('should reject unsupported MIME types', async () => {
      const textBuffer = Buffer.from('plain text');
      const res = await request(app)
        .post('/test-upload')
        .attach('avatar', textBuffer, {
          filename: 'doc.txt',
          contentType: 'text/plain',
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Hanya file gambar');
    });

    it('should reject when file is missing from request', async () => {
      const res = await request(app).post('/test-upload');
      expect(res.status).toBe(400);
      expect(res.body.message).toContain("File 'avatar' wajib diunggah");
    });

    it('should reject file with magic bytes mismatch', async () => {
      const fakeBuffer = Buffer.from('plain text masquerading as png');
      const res = await request(app)
        .post('/test-upload')
        .attach('avatar', fakeBuffer, {
          filename: 'fake.png',
          contentType: 'image/png',
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('magic bytes mismatch');
    });

    it('should reject file containing XSS script injection payload', async () => {
      const maliciousBuffer = Buffer.concat([
        PNG_MAGIC,
        Buffer.from('payload <script>alert("XSS")</script> trailing bytes'),
      ]);
      const res = await request(app)
        .post('/test-upload')
        .attach('avatar', maliciousBuffer, {
          filename: 'xss.png',
          contentType: 'image/png',
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('terdeteksi potensi injeksi skrip / XSS');
    });

    it('should reject file with double extension dangerous pattern', async () => {
      const safeBuffer = Buffer.concat([JPG_MAGIC, Buffer.from('image content')]);
      const res = await request(app)
        .post('/test-upload')
        .attach('avatar', safeBuffer, {
          filename: 'exploit.php.jpg',
          contentType: 'image/jpeg',
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('double extension');
    });
  });

  describe('uploadMultipleImages', () => {
    it('should accept multiple valid images under maxCount', async () => {
      const buf1 = Buffer.concat([PNG_MAGIC, Buffer.from('img1')]);
      const buf2 = Buffer.concat([JPG_MAGIC, Buffer.from('img2')]);
      const res = await request(app)
        .post('/test-upload-multiple')
        .attach('images', buf1, { filename: 'p1.png', contentType: 'image/png' })
        .attach('images', buf2, { filename: 'p2.jpg', contentType: 'image/jpeg' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(2);
    });

    it('should reject when file count exceeds maxCount', async () => {
      const buf = Buffer.concat([JPG_MAGIC, Buffer.from('img')]);
      const res = await request(app)
        .post('/test-upload-multiple')
        .attach('images', buf, { filename: '1.jpg', contentType: 'image/jpeg' })
        .attach('images', buf, { filename: '2.jpg', contentType: 'image/jpeg' })
        .attach('images', buf, { filename: '3.jpg', contentType: 'image/jpeg' })
        .attach('images', buf, { filename: '4.jpg', contentType: 'image/jpeg' });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Maksimal 3 file gambar');
    });

    it('should reject when zero files are uploaded', async () => {
      const res = await request(app).post('/test-upload-multiple');
      expect(res.status).toBe(400);
      expect(res.body.message).toContain("Minimal 1 file gambar 'images' wajib diunggah");
    });

    it('should reject if any image in the batch contains an XSS injection payload', async () => {
      const normalBuf = Buffer.concat([PNG_MAGIC, Buffer.from('clean-image')]);
      const xssBuf = Buffer.concat([
        JPG_MAGIC,
        Buffer.from('malicious payload: javascript:alert(1) in metadata'),
      ]);
      const res = await request(app)
        .post('/test-upload-multiple')
        .attach('images', normalBuf, { filename: 'clean.png', contentType: 'image/png' })
        .attach('images', xssBuf, { filename: 'xss.jpg', contentType: 'image/jpeg' });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('terdeteksi potensi injeksi skrip / XSS');
    });
  });
});
