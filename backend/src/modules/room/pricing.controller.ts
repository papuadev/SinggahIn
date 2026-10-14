import { Request, Response, NextFunction } from 'express';
import * as pricingService from './pricing.service';
import { sendSuccess } from '../../shared/utils/response.util';

export async function createRate(
  req: Request, res: Response, next: NextFunction
): Promise<void> {
  try {
    const data = await pricingService.createRoomRate(
      req.user!.userId, req.params.id, req.body
    );
    sendSuccess(res, data, 'Pengaturan tarif musiman berhasil disimpan.', 201);
  } catch (error) {
    next(error);
  }
}

export async function getRates(
  req: Request, res: Response, next: NextFunction
): Promise<void> {
  try {
    const list = await pricingService.getRoomRates(
      req.user!.userId, req.params.id
    );
    sendSuccess(res, list, 'Daftar penyesuaian tarif kamar berhasil diambil.');
  } catch (error) {
    next(error);
  }
}

export async function removeRate(
  req: Request, res: Response, next: NextFunction
): Promise<void> {
  try {
    const { id, rateId } = req.params;
    await pricingService.deleteRoomRate(req.user!.userId, id, rateId);
    sendSuccess(res, null, 'Pengaturan tarif berhasil dihapus.');
  } catch (error) {
    next(error);
  }
}

export async function calculatePricing(
  req: Request, res: Response, next: NextFunction
): Promise<void> {
  try {
    const { checkInDate, checkOutDate } = req.query as { checkInDate: string; checkOutDate: string };
    const result = await pricingService.calculateStayPricing(req.params.id, checkInDate, checkOutDate);
    sendSuccess(res, result, 'Kalkulasi tarif menginap berhasil diambil.');
  } catch (error) {
    next(error);
  }
}

export async function bulkCreateRates(
  req: Request, res: Response, next: NextFunction
): Promise<void> {
  try {
    const result = await pricingService.bulkCreatePropertyRates(
      req.user!.userId, req.params.propertyId, req.body
    );
    sendSuccess(res, result, 'Pengaturan tarif berhasil diterapkan ke seluruh kamar.', 201);
  } catch (error) {
    next(error);
  }
}
