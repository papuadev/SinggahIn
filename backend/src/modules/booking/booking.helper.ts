import { AppError } from '../../shared/utils/app-error';

export function generateBookingCode(date: Date = new Date()): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `SGH-${y}${m}${d}-${rand.padEnd(4, 'X')}`;
}

export function calculateBookingExpiry(hours = 2): Date {
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}

function assertFutureRange(checkIn: Date, checkOut: Date) {
  const todayStr = new Date().toISOString().split('T')[0];
  const today = new Date(`${todayStr}T00:00:00.000Z`);
  if (checkIn < today) throw AppError.badRequest('Tanggal check-in tidak boleh di masa lalu.');
  if (checkOut <= checkIn) throw AppError.badRequest('Tanggal check-out harus setelah tanggal check-in.');
}

export function parseAndValidateBookingDates(checkInStr: string, checkOutStr: string) {
  const checkIn = new Date(`${checkInStr}T00:00:00.000Z`);
  const checkOut = new Date(`${checkOutStr}T00:00:00.000Z`);
  if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
    throw AppError.badRequest('Format tanggal tidak valid (harus YYYY-MM-DD).');
  }
  assertFutureRange(checkIn, checkOut);
  return { checkIn, checkOut };
}
