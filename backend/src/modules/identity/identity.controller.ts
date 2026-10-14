import { Request, Response, NextFunction } from 'express';
import * as identityService from './identity.service';
import * as profileService from './profile.service';
import { createRefreshToken, rotateRefreshToken, revokeRefreshToken } from './refresh-token.service';
import { setAuthCookies, clearAuthCookies, extractRefreshToken } from './auth-cookie.util';
import { sendSuccess } from '../../shared/utils/response.util';
import { AppError } from '../../shared/utils/app-error';

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await identityService.register(req.body);
    sendSuccess(res, data, 'Tautan verifikasi akun telah dikirimkan ke email Anda (berlaku 1 jam).', 201);
  } catch (error) {
    next(error);
  }
}

export async function verify(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await identityService.verifyAccount(req.body);
    const refreshToken = await createRefreshToken(result.user.id);
    setAuthCookies(req, res, { accessToken: result.token, refreshToken });
    sendSuccess(res, { user: result.user }, 'Akun berhasil diverifikasi.');
  } catch (error) {
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await identityService.login(req.body);
    const refreshToken = await createRefreshToken(result.user.id);
    setAuthCookies(req, res, { accessToken: result.token, refreshToken });
    sendSuccess(res, { user: result.user }, 'Login berhasil.');
  } catch (error) {
    next(error);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const token = extractRefreshToken(req);
    if (!token) throw AppError.unauthorized('Sesi login tidak valid atau telah berakhir.');
    const result = await rotateRefreshToken(token);
    setAuthCookies(req, res, { accessToken: result.accessToken, refreshToken: result.refreshToken });
    sendSuccess(res, { user: result.user }, 'Sesi berhasil diperbarui.');
  } catch (error) {
    next(error);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const token = extractRefreshToken(req);
    if (token) await revokeRefreshToken(token);
    clearAuthCookies(req, res);
    sendSuccess(res, null, 'Logout berhasil.');
  } catch (error) {
    next(error);
  }
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

export async function forgotPassword(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await identityService.requestPasswordReset(req.body);
    sendSuccess(res, null, result.message);
  } catch (error) {
    next(error);
  }
}

export async function resetPassword(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await identityService.resetPassword(req.body);
    sendSuccess(res, null, result.message);
  } catch (error) {
    next(error);
  }
}

export async function changePassword(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await profileService.changePassword(req.user!.userId, req.body);
    sendSuccess(res, null, result.message);
  } catch (error) {
    next(error);
  }
}

export async function requestEmailChange(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await profileService.requestEmailChange(req.user!.userId, req.body);
    sendSuccess(res, null, result.message);
  } catch (error) {
    next(error);
  }
}

export async function verifyEmailChange(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await profileService.verifyEmailChange(req.body.token);
    sendSuccess(res, { user: result.user }, result.message);
  } catch (error) {
    next(error);
  }
}


