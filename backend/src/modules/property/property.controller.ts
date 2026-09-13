import { Request, Response, NextFunction } from 'express';
import * as propertyService from './property.service';
import * as propertyImageService from './property-image.service';
import * as opencageService from '../../shared/services/opencage.service';
import { sendSuccess } from '../../shared/utils/response.util';

export async function getCategories(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const categories = await propertyService.getPropertyCategories();
    sendSuccess(res, categories, 'Daftar kategori properti berhasil diambil.');
  } catch (error) {
    next(error);
  }
}

export async function create(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const property = await propertyService.createProperty(
      req.user!.userId,
      req.body
    );
    sendSuccess(res, property, 'Properti berhasil didaftarkan.', 201);
  } catch (error) {
    next(error);
  }
}

export async function getMyProperties(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const properties = await propertyService.getTenantProperties(
      req.user!.userId
    );
    sendSuccess(res, properties, 'Daftar properti tenant berhasil diambil.');
  } catch (error) {
    next(error);
  }
}

export async function getById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const property = await propertyService.getPropertyById(req.params.id);
    sendSuccess(res, property, 'Detail properti berhasil diambil.');
  } catch (error) {
    next(error);
  }
}

export async function update(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const property = await propertyService.updateProperty(
      req.params.id,
      req.user!.userId,
      req.body
    );
    sendSuccess(res, property, 'Data properti berhasil diperbarui.');
  } catch (error) {
    next(error);
  }
}

export async function remove(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await propertyService.deleteProperty(req.params.id, req.user!.userId);
    sendSuccess(res, null, 'Properti berhasil dihapus.');
  } catch (error) {
    next(error);
  }
}

export async function uploadImages(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const files = (req.files as Express.Multer.File[]) || [];
    const images = await propertyImageService.uploadPropertyImages(
      req.params.id,
      req.user!.userId,
      files
    );
    sendSuccess(res, images, 'Foto properti berhasil diunggah.', 201);
  } catch (error) {
    next(error);
  }
}

export async function removeImage(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await propertyImageService.deletePropertyImage(
      req.params.id,
      req.params.imageId,
      req.user!.userId
    );
    sendSuccess(res, null, 'Foto properti berhasil dihapus.');
  } catch (error) {
    next(error);
  }
}

export async function setCover(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const images = await propertyImageService.setCoverImage(
      req.params.id,
      req.params.imageId,
      req.user!.userId
    );
    sendSuccess(res, images, 'Foto sampul berhasil diatur.');
  } catch (error) {
    next(error);
  }
}

export async function reverseGeocode(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { latitude, longitude } = req.query as unknown as {
      latitude: number;
      longitude: number;
    };
    const result = await opencageService.reverseGeocode(
      Number(latitude),
      Number(longitude)
    );
    sendSuccess(res, result, 'Hasil geocoding lokasi berhasil diambil.');
  } catch (error) {
    next(error);
  }
}
