import { describe, it, expect } from 'vitest';
import { Role } from '@prisma/client';
import { signToken, verifyToken } from '../token.service';

describe('Token Service (JWT Sign & Verify)', () => {
  it('should successfully sign and verify a valid JWT token', () => {
    const payload = {
      userId: 'u-123',
      email: 'test@example.com',
      role: Role.USER
    };

    const token = signToken(payload);
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3);

    const decoded = verifyToken(token);
    expect(decoded.userId).toBe('u-123');
    expect(decoded.email).toBe('test@example.com');
    expect(decoded.role).toBe(Role.USER);
  });

  it('should throw unauthorized error when token is tampered or invalid', () => {
    expect(() => verifyToken('invalid.token.payload')).toThrow(
      'Sesi login tidak valid atau telah berakhir.'
    );
  });
});
