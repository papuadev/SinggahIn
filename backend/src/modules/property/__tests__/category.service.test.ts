import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prisma } from '../../../shared/services/prisma.service';
import { AppError } from '../../../shared/utils/app-error';
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  slugifyCategory,
  isProtectedCategory,
} from '../category.service';

vi.mock('../../../shared/services/prisma.service', () => ({
  prisma: {
    propertyCategory: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

describe('Category Service Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('slugifyCategory & isProtectedCategory', () => {
    it('generates clean slug from name', () => {
      expect(slugifyCategory('Glamping Tent & Resort!')).toBe('glamping-tent-resort');
      expect(slugifyCategory('  Boutique Hotel  ')).toBe('boutique-hotel');
    });

    it('identifies system protected slugs', () => {
      expect(isProtectedCategory('villa')).toBe(true);
      expect(isProtectedCategory('Hotel')).toBe(true);
      expect(isProtectedCategory('others')).toBe(true);
      expect(isProtectedCategory('glamping')).toBe(false);
    });
  });

  describe('getAllCategories', () => {
    it('returns categories with isProtected and propertyCount', async () => {
      vi.mocked(prisma.propertyCategory.findMany).mockResolvedValueOnce([
        { id: 'cat-1', name: 'Villa', slug: 'villa', description: null, createdAt: new Date(), updatedAt: new Date(), _count: { properties: 5 } } as any,
        { id: 'cat-2', name: 'Glamping', slug: 'glamping', description: 'Kemah', createdAt: new Date(), updatedAt: new Date(), _count: { properties: 0 } } as any,
      ]);

      const result = await getAllCategories();
      expect(result).toHaveLength(2);
      expect(result[0].isProtected).toBe(true);
      expect(result[0].propertyCount).toBe(5);
      expect(result[1].isProtected).toBe(false);
    });

    it('queries with OR filter for system or active categories when activeOnly is true', async () => {
      vi.mocked(prisma.propertyCategory.findMany).mockResolvedValueOnce([
        { id: 'cat-1', name: 'Villa', slug: 'villa', description: null, createdAt: new Date(), updatedAt: new Date(), _count: { properties: 5 } } as any,
      ]);

      const result = await getAllCategories(true);
      expect(result).toHaveLength(1);
      expect(prisma.propertyCategory.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { OR: [{ slug: { in: expect.any(Array) } }, { properties: { some: {} } }] },
        })
      );
    });
  });

  describe('createCategory', () => {
    it('creates custom category successfully', async () => {
      vi.mocked(prisma.propertyCategory.findFirst).mockResolvedValueOnce(null);
      vi.mocked(prisma.propertyCategory.create).mockResolvedValueOnce({
        id: 'cat-new', tenantId: 'tenant-1', name: 'Glamping', slug: 'glamping', description: 'Tenda mewah', createdAt: new Date(), updatedAt: new Date(),
      } as any);

      const result = await createCategory('tenant-1', { name: 'Glamping', description: 'Tenda mewah' });
      expect(result.name).toBe('Glamping');
      expect(result.slug).toBe('glamping');
      expect(result.tenantId).toBe('tenant-1');
      expect(result.isProtected).toBe(false);
    });

    it('throws conflict error if category name or slug exists', async () => {
      vi.mocked(prisma.propertyCategory.findFirst).mockResolvedValueOnce({ id: 'existing' } as any);
      await expect(createCategory('tenant-1', { name: 'Villa' })).rejects.toThrow(AppError);
    });
  });

  describe('updateCategory', () => {
    it('rejects updating a system protected category', async () => {
      vi.mocked(prisma.propertyCategory.findUnique).mockResolvedValueOnce({
        id: 'cat-villa', name: 'Villa', slug: 'villa',
      } as any);
      await expect(updateCategory('cat-villa', 'tenant-1', { name: 'Super Villa' })).rejects.toThrow(
        'Kategori bawaan sistem tidak dapat diubah.'
      );
    });

    it('rejects updating category created by another tenant', async () => {
      vi.mocked(prisma.propertyCategory.findUnique).mockResolvedValueOnce({
        id: 'cat-glamp', tenantId: 'tenant-other', name: 'Glamp', slug: 'glamp',
      } as any);
      await expect(updateCategory('cat-glamp', 'tenant-1', { name: 'Super Glamp' })).rejects.toThrow(
        'Anda tidak memiliki akses untuk mengubah kategori ini.'
      );
    });

    it('updates custom category successfully', async () => {
      vi.mocked(prisma.propertyCategory.findUnique).mockResolvedValueOnce({
        id: 'cat-glamp', tenantId: 'tenant-1', name: 'Glamp', slug: 'glamp',
      } as any);
      vi.mocked(prisma.propertyCategory.findFirst).mockResolvedValueOnce(null);
      vi.mocked(prisma.propertyCategory.update).mockResolvedValueOnce({
        id: 'cat-glamp', tenantId: 'tenant-1', name: 'Glamping Exclusive', slug: 'glamping-exclusive', description: 'Updated', createdAt: new Date(), updatedAt: new Date(),
      } as any);

      const result = await updateCategory('cat-glamp', 'tenant-1', { name: 'Glamping Exclusive', description: 'Updated' });
      expect(result.name).toBe('Glamping Exclusive');
      expect(result.slug).toBe('glamping-exclusive');
    });
  });

  describe('deleteCategory', () => {
    it('rejects deleting a system protected category', async () => {
      vi.mocked(prisma.propertyCategory.findUnique).mockResolvedValueOnce({
        id: 'cat-villa',
        slug: 'villa',
        _count: { properties: 0 },
      } as any);

      await expect(deleteCategory('cat-villa', 'tenant-1')).rejects.toThrow(
        'Kategori bawaan sistem tidak dapat dihapus.'
      );
    });

    it('rejects deleting category created by another tenant', async () => {
      vi.mocked(prisma.propertyCategory.findUnique).mockResolvedValueOnce({
        id: 'cat-custom',
        tenantId: 'tenant-other',
        slug: 'cottage',
        _count: { properties: 0 },
      } as any);

      await expect(deleteCategory('cat-custom', 'tenant-1')).rejects.toThrow(
        'Anda tidak memiliki akses untuk menghapus kategori ini.'
      );
    });

    it('rejects deleting a category currently in use by properties', async () => {
      vi.mocked(prisma.propertyCategory.findUnique).mockResolvedValueOnce({
        id: 'cat-custom',
        tenantId: 'tenant-1',
        slug: 'cottage',
        _count: { properties: 3 },
      } as any);

      await expect(deleteCategory('cat-custom', 'tenant-1')).rejects.toThrow(
        'Kategori tidak dapat dihapus karena masih digunakan oleh 3 properti.'
      );
    });

    it('deletes unused custom category successfully', async () => {
      vi.mocked(prisma.propertyCategory.findUnique).mockResolvedValueOnce({
        id: 'cat-custom',
        tenantId: 'tenant-1',
        slug: 'cottage',
        _count: { properties: 0 },
      } as any);
      vi.mocked(prisma.propertyCategory.delete).mockResolvedValueOnce({} as any);

      await expect(deleteCategory('cat-custom', 'tenant-1')).resolves.not.toThrow();
      expect(prisma.propertyCategory.delete).toHaveBeenCalledWith({ where: { id: 'cat-custom' } });
    });
  });
});
