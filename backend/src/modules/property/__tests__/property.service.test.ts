import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prisma } from '../../../shared/services/prisma.service';
import * as cloudinaryService from '../../../shared/services/cloudinary.service';
import {
  getPropertyCategories,
  verifyCategoryExists,
  verifyPropertyOwnership,
  createProperty,
  getTenantProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
} from '../property.service';

vi.mock('../../../shared/services/prisma.service', () => ({
  prisma: {
    propertyCategory: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
    property: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock('../../../shared/services/cloudinary.service', () => ({
  deleteFromCloudinary: vi.fn().mockResolvedValue(undefined),
}));

describe('Property Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getPropertyCategories & verifyCategoryExists', () => {
    it('returns all categories ordered by name', async () => {
      const mockCats = [{ id: 'c1', name: 'Villa', slug: 'villa', description: null }];
      vi.mocked(prisma.propertyCategory.findMany).mockResolvedValueOnce(mockCats as any);

      const result = await getPropertyCategories();
      expect(result).toEqual(mockCats);
    });

    it('throws not found error when category does not exist', async () => {
      vi.mocked(prisma.propertyCategory.findUnique).mockResolvedValueOnce(null);
      await expect(verifyCategoryExists('non-existent')).rejects.toThrow(
        'Kategori properti tidak ditemukan'
      );
    });
  });

  describe('verifyPropertyOwnership', () => {
    it('returns property when owned by tenant', async () => {
      const mockProp = { id: 'p1', tenantId: 't1', images: [] };
      vi.mocked(prisma.property.findUnique).mockResolvedValueOnce(mockProp as any);

      const result = await verifyPropertyOwnership('p1', 't1');
      expect(result).toEqual(mockProp);
    });

    it('throws 404 when property is not found', async () => {
      vi.mocked(prisma.property.findUnique).mockResolvedValueOnce(null);
      await expect(verifyPropertyOwnership('p-none', 't1')).rejects.toThrow(
        'Properti tidak ditemukan'
      );
    });

    it('throws 403 when property belongs to another tenant', async () => {
      vi.mocked(prisma.property.findUnique).mockResolvedValueOnce({
        id: 'p1',
        tenantId: 'other-t',
        images: [],
      } as any);

      await expect(verifyPropertyOwnership('p1', 't1')).rejects.toThrow(
        'Anda tidak memiliki akses ke properti ini'
      );
    });
  });

  describe('createProperty', () => {
    const input = {
      title: 'Villa Nuansa Asri',
      categoryId: 'c1',
      description: 'Villa sejuk di Lembang',
      address: 'Jl. Raya No. 10',
      city: 'Bandung',
      latitude: -6.8,
      longitude: 107.6,
    };

    it('creates property successfully when category exists', async () => {
      vi.mocked(prisma.propertyCategory.findUnique).mockResolvedValueOnce({ id: 'c1' } as any);
      vi.mocked(prisma.property.create).mockResolvedValueOnce({
        id: 'p1',
        tenantId: 't1',
        ...input,
      } as any);

      const result = await createProperty('t1', input);
      expect(result.id).toBe('p1');
    });

    it('fails when category does not exist', async () => {
      vi.mocked(prisma.propertyCategory.findUnique).mockResolvedValueOnce(null);
      await expect(createProperty('t1', input)).rejects.toThrow('Kategori properti tidak ditemukan');
    });
  });

  describe('getTenantProperties & getPropertyById', () => {
    it('returns mapped property list with cover image', async () => {
      vi.mocked(prisma.property.findMany).mockResolvedValueOnce([
        {
          id: 'p1',
          title: 'Villa 1',
          city: 'Bandung',
          address: 'Jl. 1',
          createdAt: new Date(),
          category: { id: 'c1', name: 'Villa', slug: 'villa', description: null },
          images: [
            { imageUrl: 'https://cdn.com/1.webp', isCover: false },
            { imageUrl: 'https://cdn.com/cover.webp', isCover: true },
          ],
        },
      ] as any);

      const result = await getTenantProperties('t1');
      expect(result[0].coverImage).toBe('https://cdn.com/cover.webp');
    });

    it('returns property detail by id', async () => {
      vi.mocked(prisma.property.findUnique).mockResolvedValueOnce({
        id: 'p1',
        title: 'Villa Asri',
      } as any);

      const result = await getPropertyById('p1');
      expect(result.title).toBe('Villa Asri');
    });
  });

  describe('updateProperty & deleteProperty', () => {
    it('updates property when user is owner', async () => {
      vi.mocked(prisma.property.findUnique).mockResolvedValueOnce({
        id: 'p1',
        tenantId: 't1',
        images: [],
      } as any);
      vi.mocked(prisma.property.update).mockResolvedValueOnce({
        id: 'p1',
        title: 'Updated',
      } as any);

      const result = await updateProperty('p1', 't1', { title: 'Updated' });
      expect(result.title).toBe('Updated');
    });

    it('deletes property and cleans up Cloudinary images', async () => {
      vi.mocked(prisma.property.findUnique).mockResolvedValueOnce({
        id: 'p1',
        tenantId: 't1',
        images: [{ publicId: 'pub-1' }],
      } as any);
      vi.mocked(prisma.property.delete).mockResolvedValueOnce({ id: 'p1' } as any);

      await deleteProperty('p1', 't1');
      expect(cloudinaryService.deleteFromCloudinary).toHaveBeenCalledWith('pub-1');
      expect(prisma.property.delete).toHaveBeenCalledWith({ where: { id: 'p1' } });
    });
  });
});
