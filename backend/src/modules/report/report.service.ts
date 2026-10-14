import { BookingStatus } from '@prisma/client';
import { prisma } from '../../shared/services/prisma.service';
import { AppError } from '../../shared/utils/app-error';
import { SalesReportQueryInput, OccupancyMatrixQueryInput } from './report.schema';
import { SalesReportResponseDto, OccupancyMatrixResponseDto, RoomOccupancyDto, DayOccupancyDto } from './report.types';
import {
  groupBookingsByProperty,
  groupBookingsByUser,
  mapBookingsToTransactions,
  sortSalesBreakdown,
  buildDaysArray,
  resolveDayOccupancy,
  calculateOccupancyRate,
  buildSixMonthWindows,
  aggregateMonthlyWindows,
  calcDiffText,
} from './report.helper';

function resolveMonthFilter(year?: number, month?: number) {
  if (!year || !month) return {};
  const mm = String(month).padStart(2, '0');
  const lastDay = new Date(year, month, 0).getDate();
  const s = new Date(`${year}-${mm}-01T00:00:00+07:00`);
  const e = new Date(`${year}-${mm}-${String(lastDay).padStart(2, '0')}T23:59:59.999+07:00`);
  return { createdAt: { gte: s, lte: e } };
}

function resolveDateFilter(q: SalesReportQueryInput) {
  if (q.allData) return {};
  if (q.startDate || q.endDate) {
    const filter: any = {};
    if (q.startDate) filter.gte = new Date(`${q.startDate}T00:00:00+07:00`);
    if (q.endDate) filter.lte = new Date(`${q.endDate}T23:59:59.999+07:00`);
    return Object.keys(filter).length > 0 ? { createdAt: filter } : {};
  }
  return resolveMonthFilter(q.year, q.month);
}

async function getTenantPropertyIds(tenantId: string, requestedId?: string): Promise<string[]> {
  const properties = await prisma.property.findMany({ where: { tenantId }, select: { id: true } });
  const allIds = properties.map((p) => p.id);
  if (requestedId && !allIds.includes(requestedId)) {
    throw AppError.forbidden('Anda tidak memiliki akses ke properti ini.');
  }
  return requestedId ? [requestedId] : allIds;
}

function processSalesBreakdown(bookings: any[], groupBy: string, sortBy?: string, order: 'asc' | 'desc' = 'desc') {
  if (groupBy === 'TRANSACTION') {
    return sortSalesBreakdown(mapBookingsToTransactions(bookings), sortBy, order, groupBy);
  }
  if (groupBy === 'USER') {
    return sortSalesBreakdown(groupBookingsByUser(bookings), sortBy, order, groupBy);
  }
  return sortSalesBreakdown(groupBookingsByProperty(bookings), sortBy, order, groupBy);
}

async function fetchSalesBookings(propertyIds: string[], query: SalesReportQueryInput) {
  return prisma.booking.findMany({
    where: {
      propertyId: { in: propertyIds },
      status: { in: [BookingStatus.PROCESSED, BookingStatus.COMPLETED] },
      ...resolveDateFilter(query),
    },
    include: { property: true, room: true, user: true, payment: true },
    orderBy: { createdAt: 'desc' },
  });
}

function fetchSixMonthBookings(propertyIds: string[], start: Date, end: Date) {
  const status = [BookingStatus.PROCESSED, BookingStatus.COMPLETED];
  return prisma.booking.findMany({
    where: { propertyId: { in: propertyIds }, status: { in: status }, createdAt: { gte: start, lte: end } },
    select: { totalPrice: true, createdAt: true },
  });
}

function formatDashboardMetrics(windows: any[]) {
  const [prev, curr] = [windows[4], windows[5]];
  return {
    previousRevenue: prev.amount, previousBookings: prev.bookings,
    revenueDiffText: calcDiffText(curr.amount, prev.amount),
    bookingsDiffText: calcDiffText(curr.bookings, prev.bookings),
    monthlyRevenue: windows.map((w) => ({ month: w.label, amount: w.amount, isCurrent: w.isCurrent })),
  };
}

async function computeDashboardMetrics(propertyIds: string[], year: number, month: number) {
  const windows = buildSixMonthWindows(year, month);
  const bookings = await fetchSixMonthBookings(propertyIds, windows[0].start, windows[5].end);
  aggregateMonthlyWindows(bookings || [], windows);
  return formatDashboardMetrics(windows);
}

export async function getSalesReport(tenantId: string, query: SalesReportQueryInput): Promise<SalesReportResponseDto> {
  const propertyIds = await getTenantPropertyIds(tenantId, query.propertyId);
  const bookings = await fetchSalesBookings(propertyIds, query);
  const totalRevenue = bookings.reduce((sum, b) => sum + b.totalPrice, 0);
  const breakdown = processSalesBreakdown(bookings, query.groupBy, query.sortBy, query.sortOrder);
  let metrics = {};
  if (query.month && query.year) {
    metrics = await computeDashboardMetrics(propertyIds, query.year, query.month);
  }
  return { totalRevenue, totalBookings: bookings.length, breakdown, ...metrics };
}

function buildRoomDays(room: any, days: { date: string; day: number }[], bookings: any[]): DayOccupancyDto[] {
  return days.map(({ date, day }) => {
    const dObj = new Date(date);
    const booked = bookings.filter((b) => b.roomId === room.id && dObj >= b.checkInDate && dObj < b.checkOutDate).length;
    const blocked = room.unavailabilities.some((u: any) => dObj >= u.startDate && dObj <= u.endDate);
    const unavail = room.unavailabilities.find((u: any) => dObj >= u.startDate && dObj <= u.endDate);
    const status = resolveDayOccupancy(room.totalUnits, booked, blocked, unavail?.reason);
    return {
      date, day, status, bookedUnits: booked,
      blockedUnits: blocked ? room.totalUnits : 0,
      availableUnits: Math.max(0, room.totalUnits - booked),
      reason: unavail?.reason || null,
    };
  });
}

function toRoomOccupancy(p: any, r: any, days: any, bookings: any): RoomOccupancyDto {
  return {
    propertyId: p.id, propertyName: p.title, roomId: r.id,
    roomName: r.name, totalUnits: r.totalUnits,
    days: buildRoomDays(r, days, bookings),
  };
}

function mapPropertiesToMatrix(props: any[], days: { date: string; day: number }[], bookings: any[]): RoomOccupancyDto[] {
  return props.flatMap((p) => p.rooms.map((r: any) => toRoomOccupancy(p, r, days, bookings)));
}

async function fetchOccupancyBookings(roomIds: string[], start: Date, end: Date) {
  const status = [BookingStatus.WAITING_CONFIRMATION, BookingStatus.PROCESSED, BookingStatus.COMPLETED];
  return prisma.booking.findMany({
    where: { roomId: { in: roomIds }, status: { in: status }, checkInDate: { lte: end }, checkOutDate: { gt: start } },
  });
}

export async function getOccupancyMatrix(tenantId: string, query: OccupancyMatrixQueryInput): Promise<OccupancyMatrixResponseDto> {
  const month = query.month || new Date().getMonth() + 1;
  const year = query.year || new Date().getFullYear();
  const days = buildDaysArray(year, month);
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
  const props = await prisma.property.findMany({
    where: { tenantId, ...(query.propertyId ? { id: query.propertyId } : {}) },
    include: { rooms: { include: { unavailabilities: true }, orderBy: { name: 'asc' } } },
  });
  const bookings = await fetchOccupancyBookings(props.flatMap((p) => p.rooms.map((r) => r.id)), start, end);
  const matrix = mapPropertiesToMatrix(props, days, bookings);
  return { month, year, totalDays: days.length, occupancyRate: calculateOccupancyRate(matrix, days.length), matrix };
}
