import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import { app } from '../index';
import { prisma } from '../shared/services/prisma.service';
import * as mailService from '../shared/services/mail.service';
import { Role } from '@prisma/client';

vi.mock('../shared/services/prisma.service', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn()
    },
    verificationToken: {
      create: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn()
    },
    $transaction: vi.fn()
  }
}));

vi.mock('../shared/services/mail.service', () => ({
  sendVerificationEmail: vi.fn()
}));

describe('Identity HTTP Integration Tests', () => {
  it('POST /api/v1/identity/register should validate schema and reject invalid email', async () => {
    const res = await request(app)
      .post('/api/v1/identity/register')
      .send({ email: 'not-an-email', role: 'USER' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/v1/identity/register should reject invalid role', async () => {
    const res = await request(app)
      .post('/api/v1/identity/register')
      .send({ email: 'valid@example.com', role: 'SUPERADMIN' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/v1/identity/register should create user and return 201 on valid payload', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.user.create).mockResolvedValue({
      id: 'u-int-1',
      email: 'newuser@example.com',
      role: Role.USER,
      isVerified: false,
      name: null,
      passwordHash: null,
      avatarUrl: null,
      avatarPublicId: null,
      phoneNumber: null,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    vi.mocked(prisma.verificationToken.create).mockResolvedValue({} as any);
    vi.mocked(mailService.sendVerificationEmail).mockResolvedValue();

    const res = await request(app)
      .post('/api/v1/identity/register')
      .send({ email: 'newuser@example.com', role: 'USER' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe('newuser@example.com');
  });

  it('POST /api/v1/identity/logout should clear auth cookie and return 200', async () => {
    const res = await request(app).post('/api/v1/identity/logout');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('GET /api/v1/identity/me should return 401 when unauthorized', async () => {
    const res = await request(app).get('/api/v1/identity/me');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
