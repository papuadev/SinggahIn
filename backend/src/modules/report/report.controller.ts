import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../../shared/utils/response.util';
import { getSalesReport, getOccupancyMatrix } from './report.service';

export async function getSalesReportHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await getSalesReport(req.user!.userId, req.query as any);
    sendSuccess(res, data, 'Laporan penjualan berhasil dimuat.');
  } catch (error) {
    next(error);
  }
}

export async function getOccupancyMatrixHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await getOccupancyMatrix(req.user!.userId, req.query as any);
    sendSuccess(res, data, 'Matriks okupansi berhasil dimuat.');
  } catch (error) {
    next(error);
  }
}
