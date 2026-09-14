import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AdjustmentType } from '@prisma/client';
import { prisma } from '../../../shared/services/prisma.service';
import * as roomService from '../room.service';
import * as propertyService from '../../property/property.service';
import {
  createRoomRate,
  getRoomRates,
  deleteRoomRate,
  bulkCreatePropertyRates,
  calculateStayPricing,
} from '../pricing.service';

vi.mock('../../../shared/services/prisma.service', () => ({
  prisma: {
    roomPriceModifier: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn(),
      createMany: vi.fn(),
    },
    room: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock('../room.service', () => ({
  verifyRoomOwnership: vi.fn(),
  getRoomById: vi.fn(),
}));

vi.mock('../../property/property.service', () => ({
  verifyPropertyOwnership: vi.fn(),
}));

describe('Pricing Service Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createRoomRate', () => {
    it('should verify room ownership and create rate modifier', async () => {
      vi.mocked(roomService.verifyRoomOwnership).mockResolvedValueOnce({} as any);
      const mockResult = {
        id: 'rate-1',
        roomId: 'room-1',
        startDate: new Date('2026-10-01'),
        endDate: new Date('2026-10-05'),
        adjustmentType: AdjustmentType.PERCENTAGE,
        adjustmentValue: 20,
        reason: 'Peak weekend',
        createdAt: new Date(),
      };
      vi.mocked(prisma.roomPriceModifier.create).mockResolvedValueOnce(mockResult as any);

      const input = {
        startDate: '2026-10-01',
        endDate: '2026-10-05',
        adjustmentType: AdjustmentType.PERCENTAGE,
        adjustmentValue: 20,
        reason: 'Peak weekend',
      };
      const result = await createRoomRate('tenant-1', 'room-1', input);

      expect(roomService.verifyRoomOwnership).toHaveBeenCalledWith('room-1', 'tenant-1');
      expect(result).toEqual(mockResult);
    });
  });

  describe('getRoomRates', () => {
    it('should verify ownership and return room rate modifiers', async () => {
      vi.mocked(roomService.verifyRoomOwnership).mockResolvedValueOnce({} as any);
      const mockList = [{ id: 'rate-1', roomId: 'room-1' }];
      vi.mocked(prisma.roomPriceModifier.findMany).mockResolvedValueOnce(mockList as any);

      const result = await getRoomRates('tenant-1', 'room-1');
      expect(roomService.verifyRoomOwnership).toHaveBeenCalledWith('room-1', 'tenant-1');
      expect(result).toEqual(mockList);
    });
  });

  describe('deleteRoomRate', () => {
    it('should verify ownership and delete rate modifier', async () => {
      vi.mocked(roomService.verifyRoomOwnership).mockResolvedValueOnce({} as any);
      vi.mocked(prisma.roomPriceModifier.findUnique).mockResolvedValueOnce({
        id: 'rate-1',
        roomId: 'room-1',
      } as any);
      vi.mocked(prisma.roomPriceModifier.delete).mockResolvedValueOnce({} as any);

      await deleteRoomRate('tenant-1', 'room-1', 'rate-1');
      expect(prisma.roomPriceModifier.delete).toHaveBeenCalledWith({ where: { id: 'rate-1' } });
    });

    it('should throw notFound if rate modifier does not exist', async () => {
      vi.mocked(roomService.verifyRoomOwnership).mockResolvedValueOnce({} as any);
      vi.mocked(prisma.roomPriceModifier.findUnique).mockResolvedValueOnce(null);

      await expect(deleteRoomRate('tenant-1', 'room-1', 'rate-x')).rejects.toThrow(
        'Data penyesuaian tarif tidak ditemukan.'
      );
    });
  });

  describe('bulkCreatePropertyRates', () => {
    it('should apply rates to all rooms belonging to property', async () => {
      vi.mocked(propertyService.verifyPropertyOwnership).mockResolvedValueOnce({} as any);
      vi.mocked(prisma.room.findMany).mockResolvedValueOnce([{ id: 'r1' }, { id: 'r2' }] as any);
      vi.mocked(prisma.roomPriceModifier.createMany).mockResolvedValueOnce({ count: 2 });

      const input = {
        startDate: '2026-12-20',
        endDate: '2026-12-31',
        adjustmentType: AdjustmentType.NOMINAL,
        adjustmentValue: 150000,
        reason: 'End of year holiday',
      };
      const result = await bulkCreatePropertyRates('tenant-1', 'prop-1', input);

      expect(propertyService.verifyPropertyOwnership).toHaveBeenCalledWith('prop-1', 'tenant-1');
      expect(result.count).toBe(2);
    });
  });

  describe('calculateStayPricing', () => {
    it('should calculate stay pricing with dynamic modifier applied', async () => {
      vi.mocked(roomService.getRoomById).mockResolvedValueOnce({
        id: 'r1',
        basePrice: 500000,
      } as any);
      vi.mocked(prisma.roomPriceModifier.findMany).mockResolvedValueOnce([
        {
          id: 'm1',
          roomId: 'r1',
          startDate: new Date('2026-10-02T00:00:00.000Z'),
          endDate: new Date('2026-10-02T00:00:00.000Z'),
          adjustmentType: AdjustmentType.PERCENTAGE,
          adjustmentValue: 20,
          reason: 'Special Event',
          createdAt: new Date(),
        },
      ] as any);

      const pricing = await calculateStayPricing('r1', '2026-10-01', '2026-10-03');

      expect(pricing.totalNights).toBe(2);
      expect(pricing.dailyBreakdown[0].effectivePrice).toBe(500000);
      expect(pricing.dailyBreakdown[1].effectivePrice).toBe(600000);
      expect(pricing.totalStayPrice).toBe(1100000);
      expect(pricing.averageNightRate).toBe(550000);
    });
  });
});
