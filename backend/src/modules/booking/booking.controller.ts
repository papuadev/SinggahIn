import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../../shared/utils/response.util';
import { createBooking, cancelBooking, getBookingById, getUserBookings } from './booking.service';

export async function createBookingHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await createBooking(req.user!.userId, req.body);
    sendSuccess(res, data, 'Pesanan berhasil dibuat. Silakan lakukan pembayaran sebelum batas waktu berakhir.', 201);
  } catch (error) {
    next(error);
  }
}

export async function cancelBookingHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await cancelBooking(req.user!.userId, req.params.id, req.body.reason);
    sendSuccess(res, data, 'Pesanan berhasil dibatalkan.');
  } catch (error) {
    next(error);
  }
}

export async function getBookingByIdHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await getBookingById(req.user!.userId, req.params.id, req.user?.role);
    sendSuccess(res, data, 'Detail pesanan berhasil diambil.');
  } catch (error) {
    next(error);
  }
}

export async function getUserBookingsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await getUserBookings(req.user!.userId, req.query);
    sendSuccess(res, result.data, 'Daftar riwayat pesanan berhasil diambil.', 200, result.meta);
  } catch (error) {
    next(error);
  }
}
