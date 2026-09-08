import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types/auth.types';
import { AppError } from '../utils/app-error';

const JWT_SECRET =
  process.env.JWT_SECRET ||
  'singgahin-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn']
  });
}

export function verifyToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (_error) {
    throw AppError.unauthorized('Sesi login tidak valid atau telah berakhir.');
  }
}
