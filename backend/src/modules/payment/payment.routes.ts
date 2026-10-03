import { Router } from 'express';
import { Role } from '@prisma/client';
import { authenticate, requireRole } from '../../shared/middleware/auth.middleware';
import { uploadSingleImage } from '../../shared/middleware/upload.middleware';
import { validateRequest } from '../../shared/middleware/validate.middleware';
import {
  bookingIdParamSchema,
  rejectPaymentSchema,
  emergencyCancelSchema,
} from './payment.schema';
import {
  midtransChargeSchema,
  midtransWebhookSchema,
} from './midtrans.schema';
import {
  uploadPaymentProofHandler,
  approvePaymentProofHandler,
  rejectPaymentProofHandler,
  emergencyCancelHandler,
  createSnapChargeHandler,
  handleMidtransWebhookHandler,
} from './payment.controller';

const router = Router();

router.post(
  '/:bookingId/proof',
  authenticate,
  requireRole(Role.USER),
  uploadSingleImage('proof'),
  validateRequest({ params: bookingIdParamSchema }),
  uploadPaymentProofHandler
);

router.post(
  '/:bookingId/approve',
  authenticate,
  requireRole(Role.TENANT),
  validateRequest({ params: bookingIdParamSchema }),
  approvePaymentProofHandler
);

router.post(
  '/:bookingId/reject',
  authenticate,
  requireRole(Role.TENANT),
  validateRequest({ params: bookingIdParamSchema, body: rejectPaymentSchema }),
  rejectPaymentProofHandler
);

router.post(
  '/:bookingId/emergency-cancel',
  authenticate,
  requireRole(Role.TENANT),
  validateRequest({ params: bookingIdParamSchema, body: emergencyCancelSchema }),
  emergencyCancelHandler
);

router.post(
  '/midtrans-charge',
  authenticate,
  requireRole(Role.USER),
  validateRequest({ body: midtransChargeSchema }),
  createSnapChargeHandler
);

router.post(
  '/midtrans-webhook',
  validateRequest({ body: midtransWebhookSchema }),
  handleMidtransWebhookHandler
);

export default router;
