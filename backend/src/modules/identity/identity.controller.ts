import { Request, Response, NextFunction } from 'express';
import * as identityService from './identity.service';
import * as profileService from './profile.service';
import { sendSuccess } from '../../shared/utils/response.util';
import { AppError } from '../../shared/utils/app-error';

function setAuthCookie(req: Request, res: Response, token: string): void {
  const isSecure =
    process.env.COOKIE_SECURE === 'true' ||
    req.secure ||
    req.headers['x-forwarded-proto'] === 'https';

  res.cookie('token', token, {
    httpOnly: true,
    secure: Boolean(isSecure),
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000,
    path: '/'
  });
}

function clearAuthCookie(req: Request, res: Response): void {
  const isSecure =
    process.env.COOKIE_SECURE === 'true' ||
    req.secure ||
    req.headers['x-forwarded-proto'] === 'https';

  res.clearCookie('token', {
    httpOnly: true,
    secure: Boolean(isSecure),
    sameSite: 'lax',
    path: '/'
  });
}

export async function register(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = await identityService.register(req.body);
    sendSuccess(
      res,
      data,
      'Tautan verifikasi akun telah dikirimkan ke email Anda (berlaku 1 jam).',
      201
    );
  } catch (error) {
    next(error);
  }
}

export async function verify(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await identityService.verifyAccount(req.body);
    setAuthCookie(req, res, result.token);
    sendSuccess(res, { user: result.user }, 'Akun berhasil diverifikasi.');
  } catch (error) {
    next(error);
  }
}

export async function login(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await identityService.login(req.body);
    setAuthCookie(req, res, result.token);
    sendSuccess(res, { user: result.user }, 'Login berhasil.');
  } catch (error) {
    next(error);
  }
}

export function logout(req: Request, res: Response): void {
  clearAuthCookie(req, res);
  sendSuccess(res, null, 'Logout berhasil.');
}

export async function getMe(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = await identityService.getProfile(req.user!.userId);
    sendSuccess(res, { user }, 'Data profil pengguna.');
  } catch (error) {
    next(error);
  }
}

export async function uploadAvatar(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.file) {
      throw AppError.badRequest('File avatar tidak ditemukan.');
    }
    const result = await profileService.updateAvatar(req.user!.userId, req.file);
    sendSuccess(res, result, 'Avatar berhasil diperbarui.');
  } catch (error) {
    next(error);
  }
}

export async function updateProfile(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = await profileService.updateProfile(req.user!.userId, req.body);
    sendSuccess(res, { user }, 'Profil berhasil diperbarui.');
  } catch (error) {
    next(error);
  }
}

