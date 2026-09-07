import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../index';

describe('App Root Integration Tests', () => {
  it('GET /api/v1/health should return 200 with standard success envelope', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('data.service', 'SinggahIn Backend API');
  });

  it('GET /api/v1/non-existent-route should return 404 with standard error envelope', async () => {
    const res = await request(app).get('/api/v1/non-existent-route');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('success', false);
    expect(res.body).toHaveProperty('statusCode', 404);
  });
});
