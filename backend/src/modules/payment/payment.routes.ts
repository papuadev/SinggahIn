import { Router } from 'express';
import { Role } from '@prisma/client';
import { authenticate, requireRole } from '../../shared/middleware/auth.middleware';
import { uploadSingleImage } from '../../shared/middleware/upload.middleware';
import { validateRequest } from '../../shared/middleware/validate.middleware';
import {
  bookingIdParamSchema,
  rejectPaymentSchema,
  emergencyCancelSchema,
  changePaymentMethodSchema,
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
  resetSnapChargeHandler,
  handleMidtransWebhookHandler,
  syncMidtransStatusHandler,
  changePaymentMethodHandler,
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
  '/:bookingId/midtrans-sync',
  authenticate,
  validateRequest({ params: bookingIdParamSchema }),
  syncMidtransStatusHandler
);

router.post(
  '/:bookingId/midtrans-reset',
  authenticate,
  requireRole(Role.USER),
  validateRequest({ params: bookingIdParamSchema }),
  resetSnapChargeHandler
);

router.post(
  '/midtrans-webhook',
  validateRequest({ body: midtransWebhookSchema }),
  handleMidtransWebhookHandler
);


router.patch(
  '/:bookingId/method',
  authenticate,
  requireRole(Role.USER),
  validateRequest({ params: bookingIdParamSchema, body: changePaymentMethodSchema }),
  changePaymentMethodHandler
);

export default router;

