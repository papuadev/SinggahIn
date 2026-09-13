import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prisma } from '../../../shared/services/prisma.service';
import * as cloudinaryService from '../../../shared/services/cloudinary.service';
import {
  uploadPropertyImages,
  deletePropertyImage,
  setCoverImage,
} from '../property-image.service';

vi.mock('../../../shared/services/prisma.service', () => ({
  prisma: {
    property: {
      findUnique: vi.fn(),
    },
    propertyImage: {
      count: vi.fn(),
      create: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      findMany: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock('../../../shared/services/cloudinary.service', () => ({
  deleteFromCloudinary: vi.fn().mockResolvedValue(undefined),
  uploadToCloudinary: vi.fn().mockResolvedValue({
    secureUrl: 'https://cdn.com/uploaded.webp',
    publicId: 'pub-test',
  }),
}));

describe('Property Image Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('uploadPropertyImages', () => {
    it('uploads images and sets cover on first image if no cover exists', async () => {
      vi.mocked(prisma.property.findUnique).mockResolvedValueOnce({
        id: 'prop-1',
        tenantId: 'tenant-1',
      } as any);
      vi.mocked(prisma.propertyImage.count)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0);

      vi.mocked(prisma.propertyImage.create).mockResolvedValueOnce({
        id: 'img-1',
        propertyId: 'prop-1',
        imageUrl: 'https://cdn.com/uploaded.webp',
        publicId: 'pub-test',
        isCover: true,
        createdAt: new Date(),
      });

      const fakeFiles = [
        { buffer: Buffer.from('img1'), originalname: '1.jpg' },
      ] as Express.Multer.File[];

      const results = await uploadPropertyImages('prop-1', 'tenant-1', fakeFiles);
      expect(results).toHaveLength(1);
      expect(prisma.propertyImage.create).toHaveBeenCalledWith({
        data: {
          propertyId: 'prop-1',
          imageUrl: 'https://cdn.com/uploaded.webp',
          publicId: 'pub-test',
          isCover: true,
        },
      });
    });

    it('throws error when total images would exceed 6', async () => {
      vi.mocked(prisma.property.findUnique).mockResolvedValueOnce({
        id: 'prop-1',
        tenantId: 'tenant-1',
      } as any);
      vi.mocked(prisma.propertyImage.count).mockResolvedValueOnce(5);

      const fakeFiles = [
        { buffer: Buffer.from('1') },
        { buffer: Buffer.from('2') },
      ] as Express.Multer.File[];

      await expect(
        uploadPropertyImages('prop-1', 'tenant-1', fakeFiles)
      ).rejects.toThrow('Total foto properti tidak boleh melebihi 6 gambar');
    });
  });

  describe('deletePropertyImage', () => {
    it('deletes image and reassigns cover if deleted image was cover', async () => {
      vi.mocked(prisma.property.findUnique).mockResolvedValueOnce({
        id: 'prop-1',
        tenantId: 'tenant-1',
      } as any);
      vi.mocked(prisma.propertyImage.findUnique).mockResolvedValueOnce({
        id: 'img-1',
        propertyId: 'prop-1',
        publicId: 'pub-1',
        isCover: true,
      } as any);
      vi.mocked(prisma.propertyImage.delete).mockResolvedValueOnce({ id: 'img-1' } as any);
      vi.mocked(prisma.propertyImage.findFirst).mockResolvedValueOnce({
        id: 'img-2',
      } as any);
      vi.mocked(prisma.propertyImage.update).mockResolvedValueOnce({ id: 'img-2' } as any);

      await deletePropertyImage('prop-1', 'img-1', 'tenant-1');
      expect(cloudinaryService.deleteFromCloudinary).toHaveBeenCalledWith('pub-1');
      expect(prisma.propertyImage.update).toHaveBeenCalledWith({
        where: { id: 'img-2' },
        data: { isCover: true },
      });
    });

    it('throws 404 when image is not found', async () => {
      vi.mocked(prisma.property.findUnique).mockResolvedValueOnce({
        id: 'prop-1',
        tenantId: 'tenant-1',
      } as any);
      vi.mocked(prisma.propertyImage.findUnique).mockResolvedValueOnce(null);

      await expect(
        deletePropertyImage('prop-1', 'non-existent', 'tenant-1')
      ).rejects.toThrow('Foto properti tidak ditemukan');
    });
  });

  describe('setCoverImage', () => {
    it('updates cover image in transaction', async () => {
      vi.mocked(prisma.property.findUnique).mockResolvedValueOnce({
        id: 'prop-1',
        tenantId: 'tenant-1',
      } as any);
      vi.mocked(prisma.propertyImage.findUnique).mockResolvedValueOnce({
        id: 'img-2',
        propertyId: 'prop-1',
      } as any);
      vi.mocked(prisma.$transaction).mockResolvedValueOnce([{}, {}]);
      vi.mocked(prisma.propertyImage.findMany).mockResolvedValueOnce([
        { id: 'img-2', isCover: true } as any,
      ]);

      const result = await setCoverImage('prop-1', 'img-2', 'tenant-1');
      expect(prisma.$transaction).toHaveBeenCalled();
      expect(result).toHaveLength(1);
    });
  });
});
