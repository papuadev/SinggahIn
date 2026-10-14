import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prisma } from '../../../shared/services/prisma.service';
import * as roomService from '../room.service';
import {
  createUnavailability,
  getUnavailabilitiesByRoom,
  deleteUnavailability,
  calculateRoomAvailability,
} from '../room-availability.service';

vi.mock('../../../shared/services/prisma.service', () => ({
  prisma: {
    roomUnavailability: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    booking: {
      count: vi.fn(),
    },
  },
}));

vi.mock('../room.service', () => ({
  verifyRoomOwnership: vi.fn(),
  getRoomById: vi.fn(),
}));

describe('Room Availability Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createUnavailability', () => {
    it('should verify ownership and create unavailability record', async () => {
      vi.mocked(roomService.verifyRoomOwnership).mockResolvedValueOnce({} as any);
      const mockResult = {
        id: 'u1',
        roomId: 'r1',
        startDate: new Date('2026-10-01'),
        endDate: new Date('2026-10-05'),
        reason: 'Renovasi',
      };
      vi.mocked(prisma.roomUnavailability.create).mockResolvedValueOnce(mockResult as any);

      const input = {
        startDate: '2026-10-01',
        endDate: '2026-10-05',
        reason: 'Renovasi',
      };
      const result = await createUnavailability('t1', 'r1', input);

      expect(roomService.verifyRoomOwnership).toHaveBeenCalledWith('r1', 't1');
      expect(result).toEqual(mockResult);
    });
  });

  describe('getUnavailabilitiesByRoom', () => {
    it('should return unavailabilities ordered by startDate', async () => {
      const mockData = [{ id: 'u1', roomId: 'r1' }];
      vi.mocked(prisma.roomUnavailability.findMany).mockResolvedValueOnce(mockData as any);

      const result = await getUnavailabilitiesByRoom('r1');
      expect(result).toEqual(mockData);
    });
  });

  describe('deleteUnavailability', () => {
    it('should delete record when found and belongs to room', async () => {
      vi.mocked(roomService.verifyRoomOwnership).mockResolvedValueOnce({} as any);
      vi.mocked(prisma.roomUnavailability.findUnique).mockResolvedValueOnce({
        id: 'u1',
        roomId: 'r1',
      } as any);
      vi.mocked(prisma.roomUnavailability.delete).mockResolvedValueOnce({} as any);

      await deleteUnavailability('t1', 'r1', 'u1');
      expect(prisma.roomUnavailability.delete).toHaveBeenCalledWith({
        where: { id: 'u1' },
      });
    });

    it('should throw 404 when record does not exist or belongs to another room', async () => {
      vi.mocked(roomService.verifyRoomOwnership).mockResolvedValueOnce({} as any);
      vi.mocked(prisma.roomUnavailability.findUnique).mockResolvedValueOnce({
        id: 'u1',
        roomId: 'other-room',
      } as any);

      await expect(deleteUnavailability('t1', 'r1', 'u1')).rejects.toThrow(
        'Data pemblokiran kamar tidak ditemukan'
      );
    });
  });

  describe('calculateRoomAvailability', () => {
    const mockRoom = { id: 'r1', totalUnits: 5 };
    const checkIn = new Date('2026-10-01');
    const checkOut = new Date('2026-10-03');

    it('should return availableUnits when not blocked and partially booked', async () => {
      vi.mocked(roomService.getRoomById).mockResolvedValueOnce(mockRoom as any);
      vi.mocked(prisma.roomUnavailability.count).mockResolvedValueOnce(0);
      vi.mocked(prisma.booking.count).mockResolvedValueOnce(2);

      const result = await calculateRoomAvailability('r1', checkIn, checkOut);

      expect(result).toEqual({
        roomId: 'r1',
        totalUnits: 5,
        bookedUnits: 2,
        isBlockedByUnavailability: false,
        availableUnits: 3,
        isAvailable: true,
      });
    });

    it('should return availableUnits = 0 and isAvailable = false when blocked', async () => {
      vi.mocked(roomService.getRoomById).mockResolvedValueOnce(mockRoom as any);
      vi.mocked(prisma.roomUnavailability.count).mockResolvedValueOnce(1);
      vi.mocked(prisma.booking.count).mockResolvedValueOnce(0);

      const result = await calculateRoomAvailability('r1', checkIn, checkOut);

      expect(result).toEqual({
        roomId: 'r1',
        totalUnits: 5,
        bookedUnits: 0,
        isBlockedByUnavailability: true,
        availableUnits: 0,
        isAvailable: false,
      });
    });

    it('should return isAvailable = false when fully booked', async () => {
      vi.mocked(roomService.getRoomById).mockResolvedValueOnce(mockRoom as any);
      vi.mocked(prisma.roomUnavailability.count).mockResolvedValueOnce(0);
      vi.mocked(prisma.booking.count).mockResolvedValueOnce(5);

      const result = await calculateRoomAvailability('r1', checkIn, checkOut);

      expect(result.availableUnits).toBe(0);
      expect(result.isAvailable).toBe(false);
    });
  });
});
