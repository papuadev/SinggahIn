import { Request, Response, NextFunction } from 'express';
import * as categoryService from './category.service';
import { sendSuccess } from '../../shared/utils/response.util';

export async function getCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const activeOnly = req.query.activeOnly === 'true';
    const categories = await categoryService.getAllCategories(activeOnly);
    sendSuccess(res, categories, 'Daftar kategori properti berhasil diambil.');
  } catch (error) {
    next(error);
  }
}

export async function createCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const category = await categoryService.createCategory(req.user!.userId, req.body);
    sendSuccess(res, category, 'Kategori properti berhasil ditambahkan.', 201);
  } catch (error) {
    next(error);
  }
}

export async function updateCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const category = await categoryService.updateCategory(req.params.id, req.user!.userId, req.body);
    sendSuccess(res, category, 'Kategori properti berhasil diperbarui.');
  } catch (error) {
    next(error);
  }
}

export async function deleteCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await categoryService.deleteCategory(req.params.id, req.user!.userId);
    sendSuccess(res, null, 'Kategori properti berhasil dihapus.');
  } catch (error) {
    next(error);
  }
}
