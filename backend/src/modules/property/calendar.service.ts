import { BookingStatus } from '@prisma/client';
import { prisma } from '../../shared/services/prisma.service';
import { AppError } from '../../shared/utils/app-error';
import { CalendarQueryInput } from './calendar.schema';
import { CalendarDayItemDto, CalendarResponseDataDto } from './calendar.types';
import {
  getDaysInMonth,
  formatDateString,
  buildCalendarDay,
} from './calendar.helper';

async function resolvePropertyWithRooms(propertyId: string) {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    include: { rooms: { orderBy: { createdAt: 'asc' } } },
  });
  if (!property) throw AppError.notFound('Properti tidak ditemukan.');
  if (property.rooms.length === 0) {
    throw AppError.notFound('Properti belum memiliki kamar yang terdaftar.');
  }
  return property;
}

async function findTargetRoom(propertyId: string, requestedRoomId?: string) {
  const property = await resolvePropertyWithRooms(propertyId);
  if (!requestedRoomId) return property.rooms[0];
  const room = property.rooms.find((r) => r.id === requestedRoomId);
  if (!room) {
    throw AppError.notFound('Tipe kamar tidak ditemukan pada properti ini.');
  }
  return room;
}

function fetchScheduleModifiers(roomId: string, start: Date, end: Date) {
  const range = { startDate: { lte: end }, endDate: { gte: start } };
  return prisma.roomPriceModifier.findMany({ where: { roomId, ...range }, orderBy: { startDate: 'asc' } });
}

function fetchScheduleUnavailabilities(roomId: string, start: Date, end: Date) {
  const range = { startDate: { lte: end }, endDate: { gte: start } };
  return prisma.roomUnavailability.findMany({ where: { roomId, ...range } });
}

function fetchScheduleBookings(roomId: string, start: Date, end: Date) {
  const where = {
    roomId,
    status: { notIn: [BookingStatus.CANCELLED, BookingStatus.REJECTED] },
    checkInDate: { lte: end },
    checkOutDate: { gt: start },
  };
  return prisma.booking.findMany({ where, select: { checkInDate: true, checkOutDate: true } });
}

async function fetchRoomSchedule(roomId: string, start: Date, end: Date) {
  const [modifiers, unavailabilities, bookings] = await Promise.all([
    fetchScheduleModifiers(roomId, start, end),
    fetchScheduleUnavailabilities(roomId, start, end),
    fetchScheduleBookings(roomId, start, end),
  ]);
  return { modifiers, unavailabilities, bookings };
}

function generateMonthCalendar(
  year: number, month: number, room: any, schedule: Awaited<ReturnType<typeof fetchRoomSchedule>>
): CalendarDayItemDto[] {
  const count = getDaysInMonth(year, month);
  return Array.from({ length: count }, (_, i) => {
    const dateStr = formatDateString(year, month, i + 1);
    return buildCalendarDay(dateStr, room, schedule.modifiers, schedule.unavailabilities, schedule.bookings);
  });
}

export async function getPropertyCalendar(
  propertyId: string,
  query: CalendarQueryInput
): Promise<CalendarResponseDataDto> {
  const room = await findTargetRoom(propertyId, query.roomId);
  const startOfMonth = new Date(Date.UTC(query.year, query.month - 1, 1));
  const endOfMonth = new Date(Date.UTC(query.year, query.month, 0));
  const schedule = await fetchRoomSchedule(room.id, startOfMonth, endOfMonth);
  const calendar = generateMonthCalendar(query.year, query.month, room, schedule);
  return { roomId: room.id, basePrice: room.basePrice, calendar };
}
