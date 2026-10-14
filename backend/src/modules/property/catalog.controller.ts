import { Request, Response, NextFunction } from 'express';
import * as catalogService from './catalog.service';
import { CatalogQueryInput } from './catalog.schema';
import { sendSuccess } from '../../shared/utils/response.util';

export async function getCatalog(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const query = req.query as unknown as CatalogQueryInput;
    const { data, meta } = await catalogService.getCatalogProperties(query);
    sendSuccess(res, data, 'Katalog properti berhasil diambil.', 200, meta);
  } catch (error) {
    next(error);
  }
}
