import { Router } from 'express';
import { Role } from '@prisma/client';
import { authenticate, requireRole } from '../../shared/middleware/auth.middleware';
import { validateRequest } from '../../shared/middleware/validate.middleware';
import { createReviewSchema, propertyReviewQuerySchema } from './review.schema';
import {
  createReviewHandler,
  getPropertyReviewsHandler,
  getBookingReviewHandler,
} from './review.controller';

const router = Router();

router.post(
  '/',
  authenticate,
  requireRole(Role.USER),
  validateRequest({ body: createReviewSchema }),
  createReviewHandler
);

router.get(
  '/property/:propertyId',
  validateRequest({ query: propertyReviewQuerySchema }),
  getPropertyReviewsHandler
);

router.get(
  '/booking/:bookingId',
  authenticate,
  getBookingReviewHandler
);

export const reviewRoutes = router;
export default router;
