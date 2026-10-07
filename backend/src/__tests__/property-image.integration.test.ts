import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import { app } from '../index';
import { prisma } from '../shared/services/prisma.service';
import { signToken } from '../shared/services/token.service';
import { Role } from '@prisma/client';

vi.mock('../shared/services/prisma.service', () => ({
  prisma: {
    property: { findUnique: vi.fn() },
    propertyImage: { findMany: vi.fn(), update: vi.fn() },
    $transaction: vi.fn(),
  },
}));

vi.mock('../shared/services/cloudinary.service', () => ({
  deleteFromCloudinary: vi.fn().mockResolvedValue(undefined),
  uploadToCloudinary: vi.fn().mockResolvedValue({ secureUrl: 'https://cdn/img.webp', publicId: 'p1' }),
}));

describe('Property Image HTTP Integration Tests', () => {
  const validCuid = 'cly1111111111111111111111';
  const validImageId1 = 'cly2222222222222222222222';
  const validImageId2 = 'cly3333333333333333333333';
  const tenantToken = signToken({ userId: 't-123', email: 'tenant@example.com', role: Role.TENANT });

  describe('PATCH /api/v1/properties/:id/images/reorder', () => {
    it('should return 401 when unauthenticated', async () => {
      const res = await request(app)
        .patch(`/api/v1/properties/${validCuid}/images/reorder`)
        .send({ imageIds: [validImageId1, validImageId2] });
      expect(res.status).toBe(401);
    });

    it('should return 403 when user is not TENANT', async () => {
      const userToken = signToken({ userId: 'u-123', email: 'u@example.com', role: Role.USER });
      const res = await request(app)
        .patch(`/api/v1/properties/${validCuid}/images/reorder`)
        .set('Cookie', [`token=${userToken}`])
        .send({ imageIds: [validImageId1, validImageId2] });
      expect(res.status).toBe(403);
    });

    it('should return 400 when imageIds contains invalid cuid format', async () => {
      const res = await request(app)
        .patch(`/api/v1/properties/${validCuid}/images/reorder`)
        .set('Cookie', [`token=${tenantToken}`])
        .send({ imageIds: ['not-a-cuid'] });
      expect(res.status).toBe(400);
    });

    it('should return 200 and reorder images when request is valid', async () => {
      vi.mocked(prisma.property.findUnique).mockResolvedValueOnce({ id: validCuid, tenantId: 't-123' } as any);
      vi.mocked(prisma.propertyImage.findMany)
        .mockResolvedValueOnce([
          { id: validImageId1, propertyId: validCuid, order: 0 } as any,
          { id: validImageId2, propertyId: validCuid, order: 1 } as any,
        ])
        .mockResolvedValueOnce([
          { id: validImageId2, propertyId: validCuid, order: 0 } as any,
          { id: validImageId1, propertyId: validCuid, order: 1 } as any,
        ]);
      vi.mocked(prisma.$transaction).mockResolvedValueOnce([{}, {}]);

      const res = await request(app)
        .patch(`/api/v1/properties/${validCuid}/images/reorder`)
        .set('Cookie', [`token=${tenantToken}`])
        .send({ imageIds: [validImageId2, validImageId1] });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data[0].id).toBe(validImageId2);
      expect(res.body.message).toContain('Urutan foto properti berhasil diperbarui');
    });
  });
});
