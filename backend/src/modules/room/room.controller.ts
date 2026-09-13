import { Request, Response, NextFunction } from 'express';
import * as roomService from './room.service';
import * as roomAvailabilityService from './room-availability.service';
import { sendSuccess } from '../../shared/utils/response.util';

export async function create(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const room = await roomService.createRoom(
      req.user!.userId,
      req.params.propertyId,
      req.body
    );
    sendSuccess(res, room, 'Tipe kamar berhasil ditambahkan.', 201);
  } catch (error) {
    next(error);
  }
}

export async function getByProperty(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const rooms = await roomService.getRoomsByProperty(req.params.propertyId);
    sendSuccess(res, rooms, 'Daftar tipe kamar berhasil diambil.');
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
    const room = await roomService.getRoomById(req.params.id);
    sendSuccess(res, room, 'Detail tipe kamar berhasil diambil.');
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
    const room = await roomService.updateRoom(
      req.user!.userId,
      req.params.id,
      req.body
    );
    sendSuccess(res, room, 'Tipe kamar berhasil diperbarui.');
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
    await roomService.deleteRoom(req.user!.userId, req.params.id);
    sendSuccess(res, null, 'Tipe kamar berhasil dihapus.');
  } catch (error) {
    next(error);
  }
}

export async function createUnavailability(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = await roomAvailabilityService.createUnavailability(
      req.user!.userId,
      req.params.id,
      req.body
    );
    sendSuccess(res, data, 'Pemblokiran kamar berhasil disimpan.', 201);
  } catch (error) {
    next(error);
  }
}

export async function getUnavailabilities(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const list = await roomAvailabilityService.getUnavailabilitiesByRoom(
      req.params.id
    );
    sendSuccess(res, list, 'Daftar pemblokiran kamar berhasil diambil.');
  } catch (error) {
    next(error);
  }
}

export async function removeUnavailability(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await roomAvailabilityService.deleteUnavailability(
      req.user!.userId,
      req.params.id,
      req.params.unavailabilityId
    );
    sendSuccess(res, null, 'Pemblokiran kamar berhasil dihapus.');
  } catch (error) {
    next(error);
  }
}

export async function checkAvailability(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const checkIn = new Date(req.query.checkInDate as string);
    const checkOut = new Date(req.query.checkOutDate as string);
    const result = await roomAvailabilityService.calculateRoomAvailability(
      req.params.id,
      checkIn,
      checkOut
    );
    sendSuccess(res, result, 'Kalkulasi ketersediaan kamar berhasil diambil.');
  } catch (error) {
    next(error);
  }
}
