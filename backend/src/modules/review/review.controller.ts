import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../../shared/utils/response.util';
import { createReview, getPropertyReviews, getBookingReview } from './review.service';

export async function createReviewHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await createReview(req.user!.userId, req.body);
    sendSuccess(res, data, 'Ulasan berhasil dikirim.', 201);
  } catch (error) {
    next(error);
  }
}

export async function getPropertyReviewsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const data = await getPropertyReviews(req.params.propertyId, page, limit);
    sendSuccess(res, data, 'Daftar ulasan berhasil dimuat.');
  } catch (error) {
    next(error);
  }
}

export async function getBookingReviewHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await getBookingReview(req.user!.userId, req.params.bookingId);
    sendSuccess(res, data, 'Data ulasan berhasil dimuat.');
  } catch (error) {
    next(error);
  }
}
