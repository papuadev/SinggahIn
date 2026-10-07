import { Request, Response, NextFunction } from 'express';
import * as propertyImageService from './property-image.service';
import { sendSuccess } from '../../shared/utils/response.util';

export async function uploadImages(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const files = (req.files as Express.Multer.File[]) || [];
    const images = await propertyImageService.uploadPropertyImages(req.params.id, req.user!.userId, files);
    sendSuccess(res, images, 'Foto properti berhasil diunggah.', 201);
  } catch (error) {
    next(error);
  }
}

export async function removeImage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await propertyImageService.deletePropertyImage(req.params.id, req.params.imageId, req.user!.userId);
    sendSuccess(res, null, 'Foto properti berhasil dihapus.');
  } catch (error) {
    next(error);
  }
}

export async function setCover(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const images = await propertyImageService.setCoverImage(req.params.id, req.params.imageId, req.user!.userId);
    sendSuccess(res, images, 'Foto sampul berhasil diatur.');
  } catch (error) {
    next(error);
  }
}

export async function reorderImages(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const images = await propertyImageService.reorderPropertyImages(
      req.params.id,
      req.user!.userId,
      req.body.imageIds
    );
    sendSuccess(res, images, 'Urutan foto properti berhasil diperbarui.');
  } catch (error) {
    next(error);
  }
}
