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
    },
    property: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    propertyImage: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock('../shared/services/cloudinary.service', () => ({
  deleteFromCloudinary: vi.fn().mockResolvedValue(undefined),
  uploadToCloudinary: vi.fn().mockResolvedValue({
    secureUrl: 'https://cdn.com/uploaded.webp',
    publicId: 'pub-test',
  }),
}));

vi.mock('../shared/services/opencage.service', () => ({
  reverseGeocode: vi.fn().mockResolvedValue({
    city: 'Bandung',
    address: 'Jl. Braga No. 10',
    formatted: 'Jl. Braga No. 10, Bandung',
  }),
  forwardGeocode: vi.fn(),
  searchAddress: vi.fn().mockResolvedValue([
    {
      latitude: -6.9175,
      longitude: 107.6191,
      formattedAddress: 'Jl. Braga No. 10, Bandung',
      city: 'Bandung',
    },
  ]),
}));

describe('Property HTTP Integration Tests', () => {
  const tenantToken = signToken({
    userId: 't-123',
    email: 'tenant@example.com',
    role: Role.TENANT,
  });

  const userToken = signToken({
    userId: 'u-123',
    email: 'user@example.com',
    role: Role.USER,
  });

  const validCuid = 'clh9y5x0u0000abcde1234567';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('GET /api/v1/properties/categories should return 200 with list of categories', async () => {
    vi.mocked(prisma.propertyCategory.findMany).mockResolvedValueOnce([
      { id: validCuid, name: 'Villa', slug: 'villa', description: null },
    ] as any);

    const res = await request(app).get('/api/v1/properties/categories');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  it('POST /api/v1/properties should reject 401 when unauthorized', async () => {
    const res = await request(app)
      .post('/api/v1/properties')
      .send({ title: 'Villa Baru' });

    expect(res.status).toBe(401);
  });

  it('POST /api/v1/properties should reject 403 when role is USER', async () => {
    const res = await request(app)
      .post('/api/v1/properties')
      .set('Cookie', [`token=${userToken}`])
      .send({
        title: 'Villa Nuansa Asri',
        categoryId: validCuid,
        description: 'Villa sejuk dengan pemandangan indah',
        address: 'Jl. Kolonel Masturi No. 88',
        city: 'Bandung',
        latitude: -6.8,
        longitude: 107.6,
      });

    expect(res.status).toBe(403);
    expect(res.body.message).toContain('Akses ditolak');
  });

  it('POST /api/v1/properties should create property and return 201 for TENANT', async () => {
    vi.mocked(prisma.propertyCategory.findUnique).mockResolvedValueOnce({
      id: validCuid,
    } as any);
    vi.mocked(prisma.property.create).mockResolvedValueOnce({
      id: validCuid,
      tenantId: 't-123',
      title: 'Villa Nuansa Asri',
      categoryId: validCuid,
      description: 'Villa sejuk dengan pemandangan indah',
      address: 'Jl. Kolonel Masturi No. 88',
      city: 'Bandung',
      latitude: -6.8,
      longitude: 107.6,
      category: { id: validCuid, name: 'Villa', slug: 'villa' },
      images: [],
    } as any);

    const res = await request(app)
      .post('/api/v1/properties')
      .set('Cookie', [`token=${tenantToken}`])
      .send({
        title: 'Villa Nuansa Asri',
        categoryId: validCuid,
        description: 'Villa sejuk dengan pemandangan indah',
        address: 'Jl. Kolonel Masturi No. 88',
        city: 'Bandung',
        latitude: -6.8,
        longitude: 107.6,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(validCuid);
  });

  it('GET /api/v1/properties/my-properties should return tenant property list', async () => {
    vi.mocked(prisma.property.findMany).mockResolvedValueOnce([]);

    const res = await request(app)
      .get('/api/v1/properties/my-properties')
      .set('Cookie', [`token=${tenantToken}`]);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('GET /api/v1/properties/:id should return 200 on existing property', async () => {
    vi.mocked(prisma.property.findUnique).mockResolvedValueOnce({
      id: validCuid,
      title: 'Villa Asri',
      images: [],
    } as any);

    const res = await request(app).get(`/api/v1/properties/${validCuid}`);
    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('Villa Asri');
  });

  it('GET /api/v1/properties/geocode/reverse should return address for TENANT', async () => {
    const res = await request(app)
      .get('/api/v1/properties/geocode/reverse?latitude=-6.92&longitude=107.60')
      .set('Cookie', [`token=${tenantToken}`]);

    expect(res.status).toBe(200);
    expect(res.body.data.city).toBe('Bandung');
  });

  it('GET /api/v1/properties/geocode/search should return address suggestions for TENANT', async () => {
    const res = await request(app)
      .get('/api/v1/properties/geocode/search?query=Braga')
      .set('Cookie', [`token=${tenantToken}`]);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].city).toBe('Bandung');
    expect(res.body.data[0].formattedAddress).toBe('Jl. Braga No. 10, Bandung');
  });
});
