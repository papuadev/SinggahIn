import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../index';
import { prisma } from '../shared/services/prisma.service';
import { signToken } from '../shared/services/token.service';
import { Role } from '@prisma/client';

vi.mock('../shared/services/prisma.service', () => ({
  prisma: {
    property: { findUnique: vi.fn() },
    room: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    roomUnavailability: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    booking: { count: vi.fn() },
  },
}));

describe('Room HTTP Integration Tests', () => {
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

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('POST /api/v1/properties/:propertyId/rooms returns 401 when unauthenticated', async () => {
    const res = await request(app)
      .post(`/api/v1/properties/${propertyId}/rooms`)
      .send({ name: 'Deluxe', basePrice: 500000, capacity: 2 });
    expect(res.status).toBe(401);
  });

  it('POST /api/v1/properties/:propertyId/rooms returns 403 when role is USER', async () => {
    const res = await request(app)
      .post(`/api/v1/properties/${propertyId}/rooms`)
      .set('Cookie', [`token=${userToken}`])
      .send({ name: 'Deluxe', basePrice: 500000, capacity: 2 });
    expect(res.status).toBe(403);
  });

  it('POST /api/v1/properties/:propertyId/rooms returns 201 on valid tenant request', async () => {
    vi.mocked(prisma.property.findUnique).mockResolvedValueOnce({
      id: propertyId,
      tenantId: 'tenant-123',
    } as any);
    vi.mocked(prisma.room.create).mockResolvedValueOnce({
      id: roomId,
      propertyId,
      name: 'Deluxe Room',
      basePrice: 500000,
      capacity: 2,
      totalUnits: 1,
    } as any);

    const res = await request(app)
      .post(`/api/v1/properties/${propertyId}/rooms`)
      .set('Cookie', [`token=${tenantToken}`])
      .send({ name: 'Deluxe Room', basePrice: 500000, capacity: 2 });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Deluxe Room');
  });

  it('GET /api/v1/properties/:propertyId/rooms returns 200 with room list', async () => {
    vi.mocked(prisma.room.findMany).mockResolvedValueOnce([
      { id: roomId, name: 'Deluxe Room', basePrice: 500000 },
    ] as any);

    const res = await request(app).get(`/api/v1/properties/${propertyId}/rooms`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it('GET /api/v1/rooms/:id returns 200 with room detail', async () => {
    vi.mocked(prisma.room.findUnique).mockResolvedValueOnce({
      id: roomId,
      name: 'Deluxe Room',
    } as any);

    const res = await request(app).get(`/api/v1/rooms/${roomId}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(roomId);
  });

  it('PATCH /api/v1/rooms/:id returns 200 on update', async () => {
    vi.mocked(prisma.room.findUnique).mockResolvedValueOnce({
      id: roomId,
      property: { tenantId: 'tenant-123' },
    } as any);
    vi.mocked(prisma.room.update).mockResolvedValueOnce({
      id: roomId,
      name: 'Updated Deluxe',
    } as any);

    const res = await request(app)
      .patch(`/api/v1/rooms/${roomId}`)
      .set('Cookie', [`token=${tenantToken}`])
      .send({ name: 'Updated Deluxe' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('DELETE /api/v1/rooms/:id returns 200 on delete', async () => {
    vi.mocked(prisma.room.findUnique).mockResolvedValueOnce({
      id: roomId,
      property: { tenantId: 'tenant-123' },
    } as any);
    vi.mocked(prisma.booking.count).mockResolvedValueOnce(0);
    vi.mocked(prisma.room.delete).mockResolvedValueOnce({} as any);

    const res = await request(app)
      .delete(`/api/v1/rooms/${roomId}`)
      .set('Cookie', [`token=${tenantToken}`]);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('POST /api/v1/rooms/:id/unavailability creates blocking and returns 201', async () => {
    vi.mocked(prisma.room.findUnique).mockResolvedValueOnce({
      id: roomId,
      property: { tenantId: 'tenant-123' },
    } as any);
    vi.mocked(prisma.roomUnavailability.create).mockResolvedValueOnce({
      id: 'u-1',
      roomId,
      startDate: new Date('2026-10-01'),
      endDate: new Date('2026-10-05'),
    } as any);

    const res = await request(app)
      .post(`/api/v1/rooms/${roomId}/unavailability`)
      .set('Cookie', [`token=${tenantToken}`])
      .send({
        startDate: '2026-10-01',
        endDate: '2026-10-05',
        reason: 'Renovasi',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('GET /api/v1/rooms/:id/availability returns calculation result', async () => {
    vi.mocked(prisma.room.findUnique).mockResolvedValueOnce({
      id: roomId,
      totalUnits: 3,
    } as any);
    vi.mocked(prisma.roomUnavailability.count).mockResolvedValueOnce(0);
    vi.mocked(prisma.booking.count).mockResolvedValueOnce(1);

    const res = await request(app)
      .get(`/api/v1/rooms/${roomId}/availability`)
      .query({ checkInDate: '2026-10-01', checkOutDate: '2026-10-03' });

    expect(res.status).toBe(200);
    expect(res.body.data.availableUnits).toBe(2);
    expect(res.body.data.isAvailable).toBe(true);
  });
});
