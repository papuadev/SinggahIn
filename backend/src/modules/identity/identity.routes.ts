import { Router } from 'express';
import * as identityController from './identity.controller';
import { validateRequest } from '../../shared/middleware/validate.middleware';
import { authenticate } from '../../shared/middleware/auth.middleware';
import {
  RegisterSchema,
  VerifySchema,
  LoginSchema
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

export const identityRoutes = router;
