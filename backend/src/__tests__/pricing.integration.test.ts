import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../index';
import { prisma } from '../shared/services/prisma.service';
import { signToken } from '../shared/services/token.service';
import { Role, AdjustmentType } from '@prisma/client';

vi.mock('../shared/services/prisma.service', () => ({
  prisma: {
    property: { findUnique: vi.fn() },
    room: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
    roomPriceModifier: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn(),
      createMany: vi.fn(),
    },
  },
}));

describe('Pricing HTTP Integration Tests', () => {
  const tenantToken = signToken({
    userId: 'tenant-123',
    email: 'tenant@example.com',
    role: Role.TENANT,
  });
  const userToken = signToken({
    userId: 'user-123',
    email: 'user@example.com',
    role: Role.USER,
  });

  const propertyId = 'clhp01234567890abcdefghij';
  const roomId = 'clhr01234567890abcdefghij';
  const rateId = 'clhm01234567890abcdefghij';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('POST /api/v1/rooms/:id/rates returns 401 when unauthenticated', async () => {
    const res = await request(app)
      .post(`/api/v1/rooms/${roomId}/rates`)
      .send({
        startDate: '2026-10-01',
        endDate: '2026-10-05',
        adjustmentType: 'PERCENTAGE',
        adjustmentValue: 20,
      });
    expect(res.status).toBe(401);
  });

  it('POST /api/v1/rooms/:id/rates returns 403 when role is USER', async () => {
    const res = await request(app)
      .post(`/api/v1/rooms/${roomId}/rates`)
      .set('Cookie', [`token=${userToken}`])
      .send({
        startDate: '2026-10-01',
        endDate: '2026-10-05',
        adjustmentType: 'PERCENTAGE',
        adjustmentValue: 20,
      });
    expect(res.status).toBe(403);
  });

  it('POST /api/v1/rooms/:id/rates creates rate successfully for TENANT', async () => {
    vi.mocked(prisma.room.findUnique).mockResolvedValueOnce({
      id: roomId,
      property: { tenantId: 'tenant-123' },
    } as any);
    vi.mocked(prisma.roomPriceModifier.create).mockResolvedValueOnce({
      id: rateId,
      roomId,
      startDate: new Date('2026-10-01'),
      endDate: new Date('2026-10-05'),
      adjustmentType: AdjustmentType.PERCENTAGE,
      adjustmentValue: 20,
      reason: 'Long weekend',
      createdAt: new Date(),
    });

    const res = await request(app)
      .post(`/api/v1/rooms/${roomId}/rates`)
      .set('Cookie', [`token=${tenantToken}`])
      .send({
        startDate: '2026-10-01',
        endDate: '2026-10-05',
        adjustmentType: 'PERCENTAGE',
        adjustmentValue: 20,
        reason: 'Long weekend',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(rateId);
  });

  it('GET /api/v1/rooms/:id/rates returns list of rate modifiers', async () => {
    vi.mocked(prisma.room.findUnique).mockResolvedValueOnce({
      id: roomId,
      property: { tenantId: 'tenant-123' },
    } as any);
    vi.mocked(prisma.roomPriceModifier.findMany).mockResolvedValueOnce([
      { id: rateId, roomId },
    ] as any);

    const res = await request(app)
      .get(`/api/v1/rooms/${roomId}/rates`)
      .set('Cookie', [`token=${tenantToken}`]);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
  });

  it('DELETE /api/v1/rooms/:id/rates/:rateId deletes rate modifier', async () => {
    vi.mocked(prisma.room.findUnique).mockResolvedValueOnce({
      id: roomId,
      property: { tenantId: 'tenant-123' },
    } as any);
    vi.mocked(prisma.roomPriceModifier.findUnique).mockResolvedValueOnce({
      id: rateId,
      roomId,
    } as any);
    vi.mocked(prisma.roomPriceModifier.delete).mockResolvedValueOnce({} as any);

    const res = await request(app)
      .delete(`/api/v1/rooms/${roomId}/rates/${rateId}`)
      .set('Cookie', [`token=${tenantToken}`]);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('GET /api/v1/rooms/:id/pricing calculates stay price breakdown', async () => {
    vi.mocked(prisma.room.findUnique).mockResolvedValueOnce({
      id: roomId,
      basePrice: 400000,
    } as any);
    vi.mocked(prisma.roomPriceModifier.findMany).mockResolvedValueOnce([]);

    const res = await request(app)
      .get(`/api/v1/rooms/${roomId}/pricing`)
      .query({ checkInDate: '2026-10-01', checkOutDate: '2026-10-03' });

    expect(res.status).toBe(200);
    expect(res.body.data.totalNights).toBe(2);
    expect(res.body.data.totalStayPrice).toBe(800000);
    expect(res.body.data.averageNightRate).toBe(400000);
  });

  it('POST /api/v1/properties/:propertyId/rooms/rates bulk applies rates to all rooms', async () => {
    vi.mocked(prisma.property.findUnique).mockResolvedValueOnce({
      id: propertyId,
      tenantId: 'tenant-123',
    } as any);
    vi.mocked(prisma.room.findMany).mockResolvedValueOnce([{ id: roomId }] as any);
    vi.mocked(prisma.roomPriceModifier.createMany).mockResolvedValueOnce({ count: 1 });

    const res = await request(app)
      .post(`/api/v1/properties/${propertyId}/rooms/rates`)
      .set('Cookie', [`token=${tenantToken}`])
      .send({
        startDate: '2026-12-24',
        endDate: '2026-12-26',
        adjustmentType: 'NOMINAL',
        adjustmentValue: 150000,
        reason: 'Peak holiday',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.count).toBe(1);
  });
});
