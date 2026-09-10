import { describe, it, expect } from 'vitest';
import express, { Request, Response, NextFunction } from 'express';
import request from 'supertest';
import { uploadSingleImage } from '../upload.middleware';
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
  app.use(errorHandler);
  return app;
}

describe('Upload Middleware (Multer Memory Storage & 1MB Limit)', () => {
  const app = createTestApp();

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
    // 1MB + 10KB
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
