import { Request, Response } from 'express';

const FIFTEEN_MINS_MS = 15 * 60 * 1000;
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

function isSecureRequest(req: Request): boolean {
  return (
    process.env.COOKIE_SECURE === 'true' ||
    req.secure ||
    req.headers['x-forwarded-proto'] === 'https'
  );
}

export function setAuthCookies(
  req: Request,
  res: Response,
  tokens: { accessToken: string; refreshToken?: string }
): void {
  const secure = isSecureRequest(req);
  res.cookie('token', tokens.accessToken, {
    httpOnly: true, secure, sameSite: 'lax', maxAge: FIFTEEN_MINS_MS, path: '/',
  });
  if (tokens.refreshToken) {
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true, secure, sameSite: 'lax', maxAge: SEVEN_DAYS_MS, path: '/',
    });
  }
}

export function clearAuthCookies(req: Request, res: Response): void {
  const secure = isSecureRequest(req);
  res.clearCookie('token', { httpOnly: true, secure, sameSite: 'lax', path: '/' });
  res.clearCookie('refreshToken', { httpOnly: true, secure, sameSite: 'lax', path: '/' });
}

export function extractRefreshToken(req: Request): string | null {
  if (req.cookies?.refreshToken) return req.cookies.refreshToken;
  if (req.body?.refreshToken) return req.body.refreshToken;
  return null;
}
