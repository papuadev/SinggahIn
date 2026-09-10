import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcryptjs';
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

  it('POST /api/v1/identity/login should authenticate USER and attach HttpOnly cookie', async () => {
    const passwordHash = await bcrypt.hash('password123', 10);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'u-user', email: 'user@test.com', name: 'User Test', role: Role.USER,
      isVerified: true, passwordHash, avatarUrl: null, avatarPublicId: null,
      phoneNumber: null, createdAt: new Date(), updatedAt: new Date()
    });

    const res = await request(app)
      .post('/api/v1/identity/login')
      .send({ email: 'user@test.com', password: 'password123', role: 'USER' });

    expect(res.status).toBe(200);
    expect(res.body.data.user.role).toBe('USER');
    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    expect(cookies[0]).toMatch(/token=/);
    expect(cookies[0]).toMatch(/HttpOnly/i);
    expect(cookies[0]).toMatch(/SameSite=Lax/i);
  });

  it('POST /api/v1/identity/login should authenticate TENANT and attach HttpOnly cookie', async () => {
    const passwordHash = await bcrypt.hash('password123', 10);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'u-tenant', email: 'tenant@test.com', name: 'Tenant Test', role: Role.TENANT,
      isVerified: true, passwordHash, avatarUrl: null, avatarPublicId: null,
      phoneNumber: null, createdAt: new Date(), updatedAt: new Date()
    });

    const res = await request(app)
      .post('/api/v1/identity/login')
      .send({ email: 'tenant@test.com', password: 'password123', role: 'TENANT' });

    expect(res.status).toBe(200);
    expect(res.body.data.user.role).toBe('TENANT');
    expect(res.headers['set-cookie'][0]).toMatch(/HttpOnly/i);
  });

  it('POST /api/v1/identity/login should reject role conflict with 400', async () => {
    const passwordHash = await bcrypt.hash('password123', 10);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'u-tenant', email: 'tenant@test.com', name: 'Tenant', role: Role.TENANT,
      isVerified: true, passwordHash, avatarUrl: null, avatarPublicId: null,
      phoneNumber: null, createdAt: new Date(), updatedAt: new Date()
    });

    const res = await request(app)
      .post('/api/v1/identity/login')
      .send({ email: 'tenant@test.com', password: 'password123', role: 'USER' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/v1/identity/verify should set password, verify user, and attach HttpOnly cookie', async () => {
    vi.mocked(prisma.verificationToken.findFirst).mockResolvedValue({
      id: 't-int', userId: 'u-int-2', token: 'valid-token',
      expiresAt: new Date(Date.now() + 3600000), isUsed: false
    } as any);
    vi.mocked(prisma.$transaction).mockImplementation(async (cb: any) =>
      cb({
        verificationToken: { update: vi.fn() },
        user: {
          update: vi.fn().mockResolvedValue({
            id: 'u-int-2', email: 'verified@test.com', name: 'New Verified',
            role: Role.USER, isVerified: true, avatarUrl: null
          })
        }
      })
    );

    const res = await request(app)
      .post('/api/v1/identity/verify')
      .send({
        token: 'valid-token',
        name: 'New Verified',
        password: 'password123',
        confirmPassword: 'password123'
      });

    expect(res.status).toBe(200);
    expect(res.body.data.user.name).toBe('New Verified');
    expect(res.headers['set-cookie'][0]).toMatch(/HttpOnly/i);
  });

  it('GET /api/v1/identity/me should return 401 when unauthorized', async () => {
    const res = await request(app).get('/api/v1/identity/me');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
