import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../index';
import { prisma } from '../shared/services/prisma.service';
import { signToken } from '../shared/services/token.service';
import { Role } from '@prisma/client';

vi.mock('../shared/services/prisma.service', () => ({
  prisma: {
    propertyCategory: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    property: { count: vi.fn() },
  },
}));

describe('Category HTTP Integration Tests', () => {
  const tenantToken = signToken({ userId: 't-123', email: 'tenant@singgahin.com', role: Role.TENANT });
  const userToken = signToken({ userId: 'u-123', email: 'user@singgahin.com', role: Role.USER });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/v1/properties/categories', () => {
    it('returns 200 with list of property categories', async () => {
      vi.mocked(prisma.propertyCategory.findMany).mockResolvedValueOnce([
        { id: 'c1', name: 'Villa', slug: 'villa', description: null, createdAt: new Date(), updatedAt: new Date(), _count: { properties: 3 } } as any,
      ]);

      const res = await request(app).get('/api/v1/properties/categories');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data[0].slug).toBe('villa');
      expect(res.body.data[0].isProtected).toBe(true);
    });
  });

  describe('POST /api/v1/properties/categories', () => {
    it('returns 401 when unauthenticated', async () => {
      const res = await request(app).post('/api/v1/properties/categories').send({ name: 'Glamping' });
      expect(res.status).toBe(401);
    });

    it('returns 403 when user is not a tenant', async () => {
      const res = await request(app)
        .post('/api/v1/properties/categories')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'Glamping' });
      expect(res.status).toBe(403);
    });

    it('creates category successfully for tenant', async () => {
      vi.mocked(prisma.propertyCategory.findFirst).mockResolvedValueOnce(null);
      vi.mocked(prisma.propertyCategory.create).mockResolvedValueOnce({
        id: 'cat-new', name: 'Glamping', slug: 'glamping', description: null, createdAt: new Date(), updatedAt: new Date(),
      } as any);

      const res = await request(app)
        .post('/api/v1/properties/categories')
        .set('Authorization', `Bearer ${tenantToken}`)
        .send({ name: 'Glamping' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.slug).toBe('glamping');
    });
  });

  describe('PUT /api/v1/properties/categories/:id', () => {
    it('returns 403 when attempting to update protected category', async () => {
      vi.mocked(prisma.propertyCategory.findUnique).mockResolvedValueOnce({
        id: 'c-villa', name: 'Villa', slug: 'villa',
      } as any);

      const res = await request(app)
        .put('/api/v1/properties/categories/c-villa')
        .set('Authorization', `Bearer ${tenantToken}`)
        .send({ name: 'Super Villa' });

      expect(res.status).toBe(403);
      expect(res.body.message).toContain('Kategori bawaan sistem tidak dapat diubah');
    });

    it('returns 403 when attempting to update category of another tenant', async () => {
      vi.mocked(prisma.propertyCategory.findUnique).mockResolvedValueOnce({
        id: 'c-glamp', tenantId: 'other-tenant', name: 'Glamping', slug: 'glamping',
      } as any);

      const res = await request(app)
        .put('/api/v1/properties/categories/c-glamp')
        .set('Authorization', `Bearer ${tenantToken}`)
        .send({ name: 'Super Glamp' });

      expect(res.status).toBe(403);
      expect(res.body.message).toContain('tidak memiliki akses');
    });
  });

  describe('DELETE /api/v1/properties/categories/:id', () => {
    it('returns 403 when attempting to delete category of another tenant', async () => {
      vi.mocked(prisma.propertyCategory.findUnique).mockResolvedValueOnce({
        id: 'c-cottage', tenantId: 'other-tenant', slug: 'cottage', _count: { properties: 0 },
      } as any);

      const res = await request(app)
        .delete('/api/v1/properties/categories/c-cottage')
        .set('Authorization', `Bearer ${tenantToken}`);

      expect(res.status).toBe(403);
      expect(res.body.message).toContain('tidak memiliki akses');
    });

    it('returns 400 when custom category is still used by properties', async () => {
      vi.mocked(prisma.propertyCategory.findUnique).mockResolvedValueOnce({
        id: 'c-cottage', tenantId: 't-123', slug: 'cottage', _count: { properties: 2 },
      } as any);

      const res = await request(app)
        .delete('/api/v1/properties/categories/c-cottage')
        .set('Authorization', `Bearer ${tenantToken}`);

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('masih digunakan oleh 2 properti');
    });

    it('returns 200 when unused custom category is deleted', async () => {
      vi.mocked(prisma.propertyCategory.findUnique).mockResolvedValueOnce({
        id: 'c-cottage', tenantId: 't-123', slug: 'cottage', _count: { properties: 0 },
      } as any);
      vi.mocked(prisma.propertyCategory.delete).mockResolvedValueOnce({} as any);

      const res = await request(app)
        .delete('/api/v1/properties/categories/c-cottage')
        .set('Authorization', `Bearer ${tenantToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
