import { describe, it, expect } from 'vitest';
import {
  CreateRoomSchema,
  UpdateRoomSchema,
  PropertyIdParamSchema,
  RoomIdParamSchema,
  RoomUnavailabilityParamSchema,
  CreateRoomUnavailabilitySchema,
  CheckRoomAvailabilityQuerySchema,
} from '../room.schema';

describe('Room Schemas', () => {
  describe('CreateRoomSchema', () => {
    it('should validate valid room payload with weekendRatePercent', () => {
      const validData = {
        name: 'Deluxe Ocean View',
        basePrice: 750000,
        weekendRatePercent: 20,
        capacity: 2,
        totalUnits: 5,
        description: 'Spacious room overlooking the sea',
      };
      const result = CreateRoomSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.weekendRatePercent).toBe(20);
      }
    });

    it('should default totalUnits to 1 and weekendRatePercent to 0 when omitted', () => {
      const data = {
        name: 'Standard Room',
        basePrice: 350000,
        capacity: 1,
      };
      const result = CreateRoomSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.totalUnits).toBe(1);
        expect(result.data.weekendRatePercent).toBe(0);
      }
    });

    it('should reject invalid basePrice, capacity, or weekendRatePercent', () => {
      const invalidData = {
        name: 'A',
        basePrice: -100,
        capacity: 0,
        weekendRatePercent: 150, // exceeds 100%
      };
      const result = CreateRoomSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('UpdateRoomSchema', () => {
    it('should validate valid partial update', () => {
      const result = UpdateRoomSchema.safeParse({ basePrice: 850000 });
      expect(result.success).toBe(true);
    });

    it('should reject empty update payload', () => {
      const result = UpdateRoomSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  describe('Param Schemas', () => {
    it('should validate cuid for PropertyId and RoomId', () => {
      const validCuid = 'clh9876543210abcdefghijkl';
      expect(PropertyIdParamSchema.safeParse({ propertyId: validCuid }).success).toBe(true);
      expect(RoomIdParamSchema.safeParse({ id: validCuid }).success).toBe(true);
      expect(RoomIdParamSchema.safeParse({ id: 'invalid-id' }).success).toBe(false);
    });

    it('should validate RoomUnavailabilityParam', () => {
      const validCuid1 = 'clh9876543210abcdefghijkl';
      const validCuid2 = 'clh1234567890abcdefghijkl';
      const result = RoomUnavailabilityParamSchema.safeParse({
        id: validCuid1,
        unavailabilityId: validCuid2,
      });
      expect(result.success).toBe(true);
    });
  });

  describe('CreateRoomUnavailabilitySchema', () => {
    it('should validate valid date range', () => {
      const data = {
        startDate: '2026-10-01',
        endDate: '2026-10-05',
        reason: 'Renovation',
      };
      const result = CreateRoomUnavailabilitySchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should allow single day unavailability (startDate === endDate)', () => {
      const data = {
        startDate: '2026-10-01',
        endDate: '2026-10-01',
      };
      const result = CreateRoomUnavailabilitySchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject when startDate is after endDate', () => {
      const data = {
        startDate: '2026-10-10',
        endDate: '2026-10-05',
      };
      const result = CreateRoomUnavailabilitySchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('CheckRoomAvailabilityQuerySchema', () => {
    it('should validate checkInDate before checkOutDate', () => {
      const query = {
        checkInDate: '2026-10-01',
        checkOutDate: '2026-10-03',
      };
      const result = CheckRoomAvailabilityQuerySchema.safeParse(query);
      expect(result.success).toBe(true);
    });

    it('should reject when checkInDate is equal to or after checkOutDate', () => {
      const query = {
        checkInDate: '2026-10-05',
        checkOutDate: '2026-10-05',
      };
      const result = CheckRoomAvailabilityQuerySchema.safeParse(query);
      expect(result.success).toBe(false);
    });
  });
});
