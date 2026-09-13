import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prisma } from '../../../shared/services/prisma.service';
import * as propertyService from '../../property/property.service';
import {
  verifyRoomOwnership,
  createRoom,
  getRoomsByProperty,
  getRoomById,
  updateRoom,
  deleteRoom,
} from '../room.service';

vi.mock('../../../shared/services/prisma.service', () => ({
  prisma: {
    room: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    booking: {
      count: vi.fn(),
    },
  },
}));

vi.mock('../../property/property.service', () => ({
  verifyPropertyOwnership: vi.fn(),
}));

describe('Room Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('verifyRoomOwnership', () => {
    it('should return room when tenant owns the property', async () => {
      const mockRoom = { id: 'r1', property: { tenantId: 't1' } };
      vi.mocked(prisma.room.findUnique).mockResolvedValueOnce(mockRoom as any);

      const result = await verifyRoomOwnership('r1', 't1');
      expect(result).toEqual(mockRoom);
    });

    it('should throw 404 if room not found', async () => {
      vi.mocked(prisma.room.findUnique).mockResolvedValueOnce(null);
      await expect(verifyRoomOwnership('r1', 't1')).rejects.toThrow(
        'Tipe kamar tidak ditemukan'
      );
    });

    it('should throw 403 if tenant does not own the room property', async () => {
      const mockRoom = { id: 'r1', property: { tenantId: 'other-tenant' } };
      vi.mocked(prisma.room.findUnique).mockResolvedValueOnce(mockRoom as any);
      await expect(verifyRoomOwnership('r1', 't1')).rejects.toThrow(
        'Anda tidak memiliki akses ke tipe kamar ini'
      );
    });
  });

  describe('createRoom', () => {
    it('should verify property ownership and create room', async () => {
      vi.mocked(propertyService.verifyPropertyOwnership).mockResolvedValueOnce({} as any);
      const mockCreated = { id: 'r1', name: 'Deluxe', basePrice: 500000 };
      vi.mocked(prisma.room.create).mockResolvedValueOnce(mockCreated as any);

      const input = { name: 'Deluxe', basePrice: 500000, capacity: 2, totalUnits: 3 };
      const result = await createRoom('t1', 'p1', input);

      expect(propertyService.verifyPropertyOwnership).toHaveBeenCalledWith('p1', 't1');
      expect(prisma.room.create).toHaveBeenCalledWith({
        data: { propertyId: 'p1', ...input },
      });
      expect(result).toEqual(mockCreated);
    });
  });

  describe('getRoomsByProperty & getRoomById', () => {
    it('should return rooms by propertyId', async () => {
      const mockRooms = [{ id: 'r1', name: 'Standard' }];
      vi.mocked(prisma.room.findMany).mockResolvedValueOnce(mockRooms as any);

      const result = await getRoomsByProperty('p1');
      expect(result).toEqual(mockRooms);
    });

    it('should return room by id', async () => {
      const mockRoom = { id: 'r1', name: 'Standard' };
      vi.mocked(prisma.room.findUnique).mockResolvedValueOnce(mockRoom as any);

      const result = await getRoomById('r1');
      expect(result).toEqual(mockRoom);
    });

    it('should throw 404 if room by id not found', async () => {
      vi.mocked(prisma.room.findUnique).mockResolvedValueOnce(null);
      await expect(getRoomById('r1')).rejects.toThrow('Tipe kamar tidak ditemukan');
    });
  });

  describe('updateRoom', () => {
    it('should verify ownership and update room', async () => {
      vi.mocked(prisma.room.findUnique).mockResolvedValueOnce({
        id: 'r1',
        property: { tenantId: 't1' },
      } as any);
      const mockUpdated = { id: 'r1', name: 'Executive Suite' };
      vi.mocked(prisma.room.update).mockResolvedValueOnce(mockUpdated as any);

      const result = await updateRoom('t1', 'r1', { name: 'Executive Suite' });
      expect(result).toEqual(mockUpdated);
    });
  });

  describe('deleteRoom', () => {
    it('should verify ownership, check active bookings, and delete room', async () => {
      vi.mocked(prisma.room.findUnique).mockResolvedValueOnce({
        id: 'r1',
        property: { tenantId: 't1' },
      } as any);
      vi.mocked(prisma.booking.count).mockResolvedValueOnce(0);
      vi.mocked(prisma.room.delete).mockResolvedValueOnce({} as any);

      await deleteRoom('t1', 'r1');
      expect(prisma.room.delete).toHaveBeenCalledWith({ where: { id: 'r1' } });
    });

    it('should throw 400 if room has active bookings', async () => {
      vi.mocked(prisma.room.findUnique).mockResolvedValueOnce({
        id: 'r1',
        property: { tenantId: 't1' },
      } as any);
      vi.mocked(prisma.booking.count).mockResolvedValueOnce(2);

      await expect(deleteRoom('t1', 'r1')).rejects.toThrow(
        'Tidak dapat menghapus kamar dengan pesanan aktif'
      );
      expect(prisma.room.delete).not.toHaveBeenCalled();
    });
  });
});
