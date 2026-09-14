import { Router } from 'express';
import { Role } from '@prisma/client';
import * as roomController from './room.controller';
import * as pricingController from './pricing.controller';
import {
  authenticate,
  requireRole,
} from '../../shared/middleware/auth.middleware';
import { validateRequest } from '../../shared/middleware/validate.middleware';
import {
  CreateRoomSchema,
  UpdateRoomSchema,
  PropertyIdParamSchema,
  RoomIdParamSchema,
  RoomUnavailabilityParamSchema,
  CreateRoomUnavailabilitySchema,
  CheckRoomAvailabilityQuerySchema,
  CreatePeakRateSchema,
  RoomRateParamSchema,
  CalculateStayPricingQuerySchema,
} from './room.schema';

// Router for sub-resource under property: /api/v1/properties/:propertyId/rooms
export const propertyRoomRoutes = Router({ mergeParams: true });

propertyRoomRoutes.post(
  '/',
  authenticate,
  requireRole(Role.TENANT),
  validateRequest({
    params: PropertyIdParamSchema,
    body: CreateRoomSchema,
  }),
  roomController.create
);

propertyRoomRoutes.get(
  '/',
  validateRequest({ params: PropertyIdParamSchema }),
  roomController.getByProperty
);

// Tenant-Only: Bulk Create Rates for all rooms in property
propertyRoomRoutes.post(
  '/rates',
  authenticate,
  requireRole(Role.TENANT),
  validateRequest({
    params: PropertyIdParamSchema,
    body: CreatePeakRateSchema,
  }),
  pricingController.bulkCreateRates
);

// Router for direct room resource: /api/v1/rooms
const router = Router();

// Public: Get Room Details
router.get(
  '/:id',
  validateRequest({ params: RoomIdParamSchema }),
  roomController.getById
);

// Tenant-Only: Update Room
router.patch(
  '/:id',
  authenticate,
  requireRole(Role.TENANT),
  validateRequest({
    params: RoomIdParamSchema,
    body: UpdateRoomSchema,
  }),
  roomController.update
);

// Tenant-Only: Delete Room
router.delete(
  '/:id',
  authenticate,
  requireRole(Role.TENANT),
  validateRequest({ params: RoomIdParamSchema }),
  roomController.remove
);

// Tenant-Only: Create Unavailability Block
router.post(
  '/:id/unavailability',
  authenticate,
  requireRole(Role.TENANT),
  validateRequest({
    params: RoomIdParamSchema,
    body: CreateRoomUnavailabilitySchema,
  }),
  roomController.createUnavailability
);

// Tenant-Only: List Room Unavailabilities
router.get(
  '/:id/unavailability',
  authenticate,
  requireRole(Role.TENANT),
  validateRequest({ params: RoomIdParamSchema }),
  roomController.getUnavailabilities
);

// Tenant-Only: Delete Unavailability Block
router.delete(
  '/:id/unavailability/:unavailabilityId',
  authenticate,
  requireRole(Role.TENANT),
  validateRequest({ params: RoomUnavailabilityParamSchema }),
  roomController.removeUnavailability
);

// Public / Tenant: Check Room Availability calculation
router.get(
  '/:id/availability',
  validateRequest({
    params: RoomIdParamSchema,
    query: CheckRoomAvailabilityQuerySchema,
  }),
  roomController.checkAvailability
);

// Tenant-Only: Create Peak Season Rate for Room
router.post(
  '/:id/rates',
  authenticate,
  requireRole(Role.TENANT),
  validateRequest({
    params: RoomIdParamSchema,
    body: CreatePeakRateSchema,
  }),
  pricingController.createRate
);

// Tenant-Only: List Peak Season Rates for Room
router.get(
  '/:id/rates',
  authenticate,
  requireRole(Role.TENANT),
  validateRequest({ params: RoomIdParamSchema }),
  pricingController.getRates
);

// Tenant-Only: Delete Peak Season Rate
router.delete(
  '/:id/rates/:rateId',
  authenticate,
  requireRole(Role.TENANT),
  validateRequest({ params: RoomRateParamSchema }),
  pricingController.removeRate
);

// Public / User / Tenant: Calculate Stay Pricing
router.get(
  '/:id/pricing',
  validateRequest({
    params: RoomIdParamSchema,
    query: CalculateStayPricingQuerySchema,
  }),
  pricingController.calculatePricing
);

export const roomRoutes = router;
