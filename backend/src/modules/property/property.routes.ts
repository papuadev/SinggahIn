import { Router } from 'express';
import { Role } from '@prisma/client';
import * as propertyController from './property.controller';
import {
  authenticate,
  requireRole,
} from '../../shared/middleware/auth.middleware';
import { validateRequest } from '../../shared/middleware/validate.middleware';
import { uploadMultipleImages } from '../../shared/middleware/upload.middleware';
import { propertyRoomRoutes } from '../room/room.routes';
import * as catalogController from './catalog.controller';
import * as calendarController from './calendar.controller';
import {
  CreatePropertySchema,
  UpdatePropertySchema,
  PropertyIdParamSchema,
  PropertyImageParamSchema,
  ReverseGeocodeQuerySchema,
  SearchGeocodeQuerySchema,
} from './property.schema';
import { CatalogQuerySchema } from './catalog.schema';
import { CalendarQuerySchema } from './calendar.schema';

const router = Router();

// Public: Master Categories
router.get('/categories', propertyController.getCategories);

// Tenant-Only: Reverse Geocode Proxy
router.get(
  '/geocode/reverse',
  authenticate,
  requireRole(Role.TENANT),
  validateRequest({ query: ReverseGeocodeQuerySchema }),
  propertyController.reverseGeocode
);

// Public / Tenant: Forward Geocode / Autocomplete Proxy
router.get(
  '/geocode/search',
  validateRequest({ query: SearchGeocodeQuerySchema }),
  propertyController.searchGeocode
);

// Tenant-Only: My Properties
router.get(
  '/my-properties',
  authenticate,
  requireRole(Role.TENANT),
  propertyController.getMyProperties
);

// Public: Catalog Search
router.get(
  '/',
  validateRequest({ query: CatalogQuerySchema }),
  catalogController.getCatalog
);

// Tenant-Only: Create Property
router.post(
  '/',
  authenticate,
  requireRole(Role.TENANT),
  validateRequest({ body: CreatePropertySchema }),
  propertyController.create
);

// Public: Interactive 1-Month Price Calendar
router.get(
  '/:id/calendar',
  validateRequest({
    params: PropertyIdParamSchema,
    query: CalendarQuerySchema,
  }),
  calendarController.getCalendar
);

// Detail Property (Public / Tenant)
router.get(
  '/:id',
  validateRequest({ params: PropertyIdParamSchema }),
  propertyController.getById
);

// Tenant-Only: Update Property
router.patch(
  '/:id',
  authenticate,
  requireRole(Role.TENANT),
  validateRequest({
    params: PropertyIdParamSchema,
    body: UpdatePropertySchema,
  }),
  propertyController.update
);

// Tenant-Only: Delete Property
router.delete(
  '/:id',
  authenticate,
  requireRole(Role.TENANT),
  validateRequest({ params: PropertyIdParamSchema }),
  propertyController.remove
);

// Tenant-Only: Upload Property Images (1-6 images, max 1MB each)
router.post(
  '/:id/images',
  authenticate,
  requireRole(Role.TENANT),
  validateRequest({ params: PropertyIdParamSchema }),
  uploadMultipleImages('images', 6),
  propertyController.uploadImages
);

// Tenant-Only: Delete Property Image
router.delete(
  '/:id/images/:imageId',
  authenticate,
  requireRole(Role.TENANT),
  validateRequest({ params: PropertyImageParamSchema }),
  propertyController.removeImage
);

// Tenant-Only: Set Cover Image
router.patch(
  '/:id/images/:imageId/cover',
  authenticate,
  requireRole(Role.TENANT),
  validateRequest({ params: PropertyImageParamSchema }),
  propertyController.setCover
);

// Nested Sub-resource: Property Rooms
router.use('/:propertyId/rooms', propertyRoomRoutes);

export const propertyRoutes = router;
