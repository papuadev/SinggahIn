import { Router } from 'express';
import { Role } from '@prisma/client';
import { authenticate, requireRole } from '../../shared/middleware/auth.middleware';
import { validateRequest } from '../../shared/middleware/validate.middleware';
import {
  createBookingSchema,
  cancelBookingSchema,
  bookingIdParamSchema,
  listBookingsQuerySchema,
} from './booking.schema';
import {
  createBookingHandler,
  cancelBookingHandler,
  getBookingByIdHandler,
  getUserBookingsHandler,
  getTenantBookingsHandler,
} from './booking.controller';

export const bookingRoutes = Router();

bookingRoutes.post(
  '/',
  authenticate,
  requireRole(Role.USER),
  validateRequest({ body: createBookingSchema }),
  createBookingHandler
);

bookingRoutes.post(
  '/:id/cancel',
  authenticate,
  requireRole(Role.USER),
  validateRequest({ params: bookingIdParamSchema, body: cancelBookingSchema }),
  cancelBookingHandler
);

bookingRoutes.get(
  '/tenant',
  authenticate,
  requireRole(Role.TENANT),
  validateRequest({ query: listBookingsQuerySchema }),
  getTenantBookingsHandler
);

bookingRoutes.get(
  '/:id',
  authenticate,
  validateRequest({ params: bookingIdParamSchema }),
  getBookingByIdHandler
);


bookingRoutes.get(
  '/',
  authenticate,
  requireRole(Role.USER),
  validateRequest({ query: listBookingsQuerySchema }),
  getUserBookingsHandler
);
