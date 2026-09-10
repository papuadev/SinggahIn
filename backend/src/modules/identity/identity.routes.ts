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

export const identityRoutes = router;

