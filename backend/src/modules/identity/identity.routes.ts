import { Router } from 'express';
import * as identityController from './identity.controller';
import { validateRequest } from '../../shared/middleware/validate.middleware';
import { authenticate } from '../../shared/middleware/auth.middleware';
import { uploadSingleImage } from '../../shared/middleware/upload.middleware';
import {
  RegisterSchema,
  VerifySchema,
  LoginSchema,
  UpdateProfileSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
  ChangePasswordSchema,
  RequestEmailChangeSchema,
  VerifyEmailChangeSchema,
} from './identity.schema';

const router = Router();

router.post(
  '/register',
  validateRequest({ body: RegisterSchema }),
  identityController.register
);

router.post(
  '/verify',
  validateRequest({ body: VerifySchema }),
  identityController.verify
);

router.post(
  '/login',
  validateRequest({ body: LoginSchema }),
  identityController.login
);

router.post('/logout', identityController.logout);
router.post('/refresh', identityController.refresh);

router.get('/me', authenticate, identityController.getMe);

router.post(
  '/avatar',
  authenticate,
  uploadSingleImage('avatar'),
  identityController.uploadAvatar
);

router.patch(
  '/profile',
  authenticate,
  validateRequest({ body: UpdateProfileSchema }),
  identityController.updateProfile
);

router.post(
  '/forgot-password',
  validateRequest({ body: ForgotPasswordSchema }),
  identityController.forgotPassword
);

router.post(
  '/reset-password',
  validateRequest({ body: ResetPasswordSchema }),
  identityController.resetPassword
);

router.patch(
  '/profile/password',
  authenticate,
  validateRequest({ body: ChangePasswordSchema }),
  identityController.changePassword
);

router.post(
  '/profile/email-change',
  authenticate,
  validateRequest({ body: RequestEmailChangeSchema }),
  identityController.requestEmailChange
);

router.post(
  '/profile/verify-email-change',
  validateRequest({ body: VerifyEmailChangeSchema }),
  identityController.verifyEmailChange
);

export const identityRoutes = router;

