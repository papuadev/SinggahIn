import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../../shared/utils/response.util';
import {
  uploadPaymentProof,
  approvePaymentProof,
  rejectPaymentProof,
  emergencyCancelBooking,
} from './payment.service';
import { createSnapTransaction, handleMidtransWebhook } from './midtrans.service';

export async function uploadPaymentProofHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await uploadPaymentProof(req.user!.userId, req.params.bookingId, req.file!);
    sendSuccess(res, data, 'Bukti pembayaran berhasil diunggah. Menunggu konfirmasi dari pihak pengelola.');
  } catch (error) {
    next(error);
  }
}

export async function approvePaymentProofHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await approvePaymentProof(req.user!.userId, req.params.bookingId);
    sendSuccess(res, data, 'Pembayaran berhasil dikonfirmasi. Voucher reservasi telah dikirimkan ke email penyewa.');
  } catch (error) {
    next(error);
  }
}

export async function rejectPaymentProofHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await rejectPaymentProof(req.user!.userId, req.params.bookingId, req.body);
    sendSuccess(res, data, 'Bukti pembayaran ditolak. Batas waktu pembayaran telah diperpanjang selama 1 jam.');
  } catch (error) {
    next(error);
  }
}

export async function emergencyCancelHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await emergencyCancelBooking(req.user!.userId, req.params.bookingId, req.body);
    sendSuccess(res, data, 'Pesanan berhasil dibatalkan secara darurat.');
  } catch (error) {
    next(error);
  }
}

export async function createSnapChargeHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await createSnapTransaction(req.user!.userId, req.body.bookingId);
    sendSuccess(res, data, 'Token transaksi Midtrans Snap berhasil dibuat.');
  } catch (error) {
    next(error);
  }
}

export async function handleMidtransWebhookHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await handleMidtransWebhook(req.body);
    sendSuccess(res, data, 'Notifikasi pembayaran Midtrans berhasil diproses.');
  } catch (error) {
    next(error);
  }
}
