import {
  PropertySalesBreakdown,
  TransactionSalesBreakdown,
  UserSalesBreakdown,
  DayOccupancyDto,
  RoomOccupancyDto,
  SortOrder,
} from './report.types';

export function groupBookingsByProperty(bookings: any[]): PropertySalesBreakdown[] {
  const map = new Map<string, PropertySalesBreakdown>();
  for (const b of bookings) {
    const dStr = b.createdAt ? new Date(b.createdAt).toISOString() : '';
    const existing = map.get(b.propertyId) || {
      id: b.propertyId, name: b.property?.title || 'Properti', totalTransactions: 0,
      revenue: 0, latestTransactionDate: dStr, earliestTransactionDate: dStr,
    };
    existing.totalTransactions += 1;
    existing.revenue += b.totalPrice;
    if (dStr && (!existing.latestTransactionDate || dStr > existing.latestTransactionDate)) existing.latestTransactionDate = dStr;
    if (dStr && (!existing.earliestTransactionDate || dStr < existing.earliestTransactionDate)) existing.earliestTransactionDate = dStr;
    map.set(b.propertyId, existing);
  }
  return Array.from(map.values());
}

export function groupBookingsByUser(bookings: any[]): UserSalesBreakdown[] {
  const map = new Map<string, UserSalesBreakdown>();
  for (const b of bookings) {
    const dStr = b.createdAt ? new Date(b.createdAt).toISOString() : '';
    const existing = map.get(b.userId) || {
      id: b.userId, name: b.user?.name || 'Tamu', email: b.user?.email || '-',
      totalBookings: 0, totalSpent: 0, latestTransactionDate: dStr, earliestTransactionDate: dStr,
    };
    existing.totalBookings += 1;
    existing.totalSpent += b.totalPrice;
    if (dStr && (!existing.latestTransactionDate || dStr > existing.latestTransactionDate)) existing.latestTransactionDate = dStr;
    if (dStr && (!existing.earliestTransactionDate || dStr < existing.earliestTransactionDate)) existing.earliestTransactionDate = dStr;
    map.set(b.userId, existing);
  }
  return Array.from(map.values());
}

export function mapBookingsToTransactions(bookings: any[]): TransactionSalesBreakdown[] {
  return bookings.map((b) => ({
    id: b.id,
    bookingCode: b.bookingCode,
    propertyName: b.property?.title || '-',
    roomName: b.room?.name || '-',
    userName: b.user?.name || 'Tamu',
    userEmail: b.user?.email || '-',
    checkInDate: b.checkInDate.toISOString().split('T')[0],
    checkOutDate: b.checkOutDate.toISOString().split('T')[0],
    totalPrice: b.totalPrice,
    paymentMethod: b.payment?.paymentMethod || 'MANUAL_TRANSFER',
    status: b.status,
    createdAt: b.createdAt.toISOString(),
  }));
}

function getFieldByGroup(groupBy: string) {
  return groupBy === 'TRANSACTION' ? 'totalPrice' : groupBy === 'USER' ? 'totalSpent' : 'revenue';
}

function resolveSortFieldAndOrder(sortBy?: string, order: SortOrder = 'desc', groupBy = 'PROPERTY') {
  if (sortBy === 'TERENDAH') return { field: getFieldByGroup(groupBy), ord: 'asc' as SortOrder };
  if (sortBy === 'TERTINGGI') return { field: getFieldByGroup(groupBy), ord: 'desc' as SortOrder };
  if (sortBy === 'TERBARU') return { field: groupBy === 'TRANSACTION' ? 'createdAt' : 'latestTransactionDate', ord: 'desc' as SortOrder };
  if (sortBy === 'TERLAMA') return { field: groupBy === 'TRANSACTION' ? 'createdAt' : 'earliestTransactionDate', ord: 'asc' as SortOrder };
  return { field: sortBy || getFieldByGroup(groupBy), ord: order };
}

export function sortSalesBreakdown<T extends Record<string, any>>(items: T[], sortBy?: string, order: SortOrder = 'desc', groupBy = 'PROPERTY'): T[] {
  const { field, ord } = resolveSortFieldAndOrder(sortBy, order, groupBy);
  return [...items].sort((a, b) => {
    const valA = a[field] ?? 0;
    const valB = b[field] ?? 0;
    if (typeof valA === 'string') {
      return ord === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    return ord === 'asc' ? valA - valB : valB - valA;
  });
}

export function buildDaysArray(year: number, month: number): { date: string; day: number }[] {
  const count = new Date(year, month, 0).getDate();
  const list: { date: string; day: number }[] = [];
  for (let d = 1; d <= count; d++) {
    const mm = String(month).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    list.push({ date: `${year}-${mm}-${dd}`, day: d });
  }
  return list;
}

export function resolveDayOccupancy(totalUnits: number, bookedUnits: number, blocked: boolean, reason?: string | null): DayOccupancyDto['status'] {
  if (blocked) return 'BLOCKED';
  if (bookedUnits >= totalUnits) return 'BOOKED';
  return 'AVAILABLE';
}

export function calculateOccupancyRate(matrix: RoomOccupancyDto[], totalDays: number): number {
  if (matrix.length === 0 || totalDays === 0) return 0;
  let totalBookedSlots = 0;
  let totalSlots = 0;
  for (const r of matrix) {
    totalSlots += r.totalUnits * totalDays;
    for (const d of r.days) {
      totalBookedSlots += Math.min(d.bookedUnits, r.totalUnits);
    }
  }
  if (totalSlots === 0) return 0;
  return Number(((totalBookedSlots / totalSlots) * 100).toFixed(1));
}
