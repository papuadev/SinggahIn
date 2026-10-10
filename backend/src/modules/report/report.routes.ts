import { Router } from 'express';
import { Role } from '@prisma/client';
import { authenticate, requireRole } from '../../shared/middleware/auth.middleware';
import { validateRequest } from '../../shared/middleware/validate.middleware';
import { salesReportQuerySchema, occupancyMatrixQuerySchema } from './report.schema';
import { getSalesReportHandler, getOccupancyMatrixHandler } from './report.controller';

const router = Router();

router.get(
  '/sales',
  authenticate,
  requireRole(Role.TENANT),
  validateRequest({ query: salesReportQuerySchema }),
  getSalesReportHandler
);

router.get(
  '/occupancy',
  authenticate,
  requireRole(Role.TENANT),
  validateRequest({ query: occupancyMatrixQuerySchema }),
  getOccupancyMatrixHandler
);

export default router;
