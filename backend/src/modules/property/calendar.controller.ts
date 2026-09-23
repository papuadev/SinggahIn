import { Request, Response, NextFunction } from 'express';
import * as calendarService from './calendar.service';
import { CalendarQueryInput } from './calendar.schema';
import { sendSuccess } from '../../shared/utils/response.util';

export async function getCalendar(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const query = req.query as unknown as CalendarQueryInput;
    const data = await calendarService.getPropertyCalendar(req.params.id, query);
    sendSuccess(res, data, 'Kalender harga properti berhasil diambil.');
  } catch (error) {
    next(error);
  }
}
