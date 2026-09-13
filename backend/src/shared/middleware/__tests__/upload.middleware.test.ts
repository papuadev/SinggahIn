import { describe, it, expect } from 'vitest';
import express, { Request, Response } from 'express';
import request from 'supertest';
import { uploadSingleImage, uploadMultipleImages } from '../upload.middleware';
import { errorHandler } from '../error.middleware';

function createTestApp() {
  const app = express();
  app.post(
    '/test-upload',
    uploadSingleImage('avatar'),
    (req: Request, res: Response) => {
      res.status(200).json({
        filename: req.file?.originalname,
        size: req.file?.size,
        mimetype: req.file?.mimetype,
      });
    }
  );
  app.post(
    '/test-upload-multiple',
    uploadMultipleImages('images', 3),
    (req: Request, res: Response) => {
      const files = (req.files as Express.Multer.File[]) || [];
      res.status(200).json({
        count: files.length,
        filenames: files.map((f) => f.originalname),
      });
    }
  );
  app.use(errorHandler);
  return app;
}

describe('Upload Middleware (Multer Memory Storage & 1MB Limit)', () => {
  const app = createTestApp();

  describe('uploadSingleImage', () => {
    it('should successfully accept valid image under 1MB into memory buffer', async () => {
      const smallBuffer = Buffer.from('fake-image-content');
      const res = await request(app)
        .post('/test-upload')
        .attach('avatar', smallBuffer, {
          filename: 'avatar.png',
          contentType: 'image/png',
        });

      expect(res.status).toBe(200);
      expect(res.body.filename).toBe('avatar.png');
      expect(res.body.mimetype).toBe('image/png');
    });

    it('should reject non-image MIME types with 400 Bad Request', async () => {
      const textBuffer = Buffer.from('hello text');
      const res = await request(app)
        .post('/test-upload')
        .attach('avatar', textBuffer, {
          filename: 'document.txt',
          contentType: 'text/plain',
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Hanya file gambar');
    });

    it('should reject files exceeding 1MB limit with 400 Bad Request', async () => {
      const oversizedBuffer = Buffer.alloc(1024 * 1024 + 10 * 1024);
      const res = await request(app)
        .post('/test-upload')
        .attach('avatar', oversizedBuffer, {
          filename: 'large.jpg',
          contentType: 'image/jpeg',
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Ukuran file maksimal 1MB');
    });

    it('should reject request when avatar file field is missing', async () => {
      const res = await request(app)
        .post('/test-upload')
        .send({ someField: 'value' });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain("File 'avatar' wajib diunggah");
    });
  });

  describe('uploadMultipleImages', () => {
    it('should accept multiple valid images under maxCount', async () => {
      const buf1 = Buffer.from('img1');
      const buf2 = Buffer.from('img2');
      const res = await request(app)
        .post('/test-upload-multiple')
        .attach('images', buf1, { filename: 'p1.png', contentType: 'image/png' })
        .attach('images', buf2, { filename: 'p2.jpg', contentType: 'image/jpeg' });

      expect(res.status).toBe(200);
      expect(res.body.count).toBe(2);
      expect(res.body.filenames).toEqual(['p1.png', 'p2.jpg']);
    });

    it('should reject when file count exceeds maxCount', async () => {
      const buf = Buffer.from('img');
      const res = await request(app)
        .post('/test-upload-multiple')
        .attach('images', buf, { filename: '1.jpg', contentType: 'image/jpeg' })
        .attach('images', buf, { filename: '2.jpg', contentType: 'image/jpeg' })
        .attach('images', buf, { filename: '3.jpg', contentType: 'image/jpeg' })
        .attach('images', buf, { filename: '4.jpg', contentType: 'image/jpeg' });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Maksimal 3 file gambar yang dapat diunggah');
    });

    it('should reject when no files are uploaded', async () => {
      const res = await request(app)
        .post('/test-upload-multiple')
        .send({ dummy: 'val' });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain("Minimal 1 file gambar 'images' wajib diunggah");
    });

    it('should reject if any image exceeds 1MB', async () => {
      const normalBuf = Buffer.from('normal');
      const bigBuf = Buffer.alloc(1024 * 1024 + 10 * 1024);
      const res = await request(app)
        .post('/test-upload-multiple')
        .attach('images', normalBuf, { filename: 'ok.png', contentType: 'image/png' })
        .attach('images', bigBuf, { filename: 'too-big.jpg', contentType: 'image/jpeg' });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Ukuran file maksimal 1MB');
    });
  });
});
