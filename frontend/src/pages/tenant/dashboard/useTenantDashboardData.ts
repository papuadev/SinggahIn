import { useQuery } from '@tanstack/react-query';
import { useSalesReport } from '../../../modules/report/hooks/useSalesReport';
import { useOccupancyReport } from '../../../modules/report/hooks/useOccupancyReport';
import { useTenantProperties } from '../../../modules/property/hooks/useProperties';
import { useTenantOrders } from '../../../modules/booking/hooks/useTenantOrders';
import { bookingApi } from '../../../modules/booking/services/booking.api';
import { MonthBarData } from './DashboardRevenueBarChart';
import { TransactionSalesBreakdown } from '../../../modules/report/report.types';
import { formatDateID } from '../../../libs/formatters';

function usePendingConfirmationCount() {
  return useQuery({
    queryKey: ['tenant-pending-confirmations-count'],
    queryFn: async () => {
      const res = await bookingApi.getTenantBookings({ status: 'WAITING_CONFIRMATION', limit: 1 });
      return res.meta?.totalItems ?? 0;
    },
    staleTime: 30_000,
  });
}

function buildActualMonthlyData(txs: TransactionSalesBreakdown[], month: number, year: number): MonthBarData[] {
  const result: MonthBarData[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(year, month - 1 - i, 1);
    const label = formatDateID(d, 'LLL');
    const matched = txs.filter((t) => {
      const dt = new Date(t.createdAt);
      return dt.getFullYear() === d.getFullYear() && dt.getMonth() === d.getMonth();
    });
    const amount = matched.reduce((sum, t) => sum + (t.totalPrice || 0), 0);
    result.push({ month: label, amount, isCurrent: i === 0 });
  }
  return result;
}

function calcDiffText(curr: number, prev: number): string {
  if (prev === 0) {
    return curr > 0 ? '+100% dari bulan lalu' : '0% dari bulan lalu';
  }
  const diff = Math.round(((curr - prev) / prev) * 100);
  return `${diff >= 0 ? '+' : ''}${diff}% dari bulan lalu`;
}

function filterMonthTransactions(txs: TransactionSalesBreakdown[], month: number, year: number) {
  const prevDate = new Date(year, month - 2, 1);
  const curr = txs.filter((t) => {
    const d = new Date(t.createdAt);
    return d.getFullYear() === year && d.getMonth() === month - 1;
  });
  const prev = txs.filter((t) => {
    const d = new Date(t.createdAt);
    return d.getFullYear() === prevDate.getFullYear() && d.getMonth() === prevDate.getMonth();
  });
  return { curr, prev };
}

function useDashboardRawQueries(month: number, year: number) {
  const sales = useSalesReport({ allData: true, groupBy: 'TRANSACTION' });
  const occupancy = useOccupancyReport({ month, year });
  const props = useTenantProperties();
  const orders = useTenantOrders(5);
  const pending = usePendingConfirmationCount();
  return { sales, occupancy, props, orders, pending };
}

function computeRatingStats(properties: any[]) {
  const totalReviews = properties.reduce((acc, p) => acc + (p.totalReviews || 0), 0);
  if (totalReviews > 0) {
    const totalScore = properties.reduce((acc, p) => acc + (p.averageRating || 0) * (p.totalReviews || 0), 0);
    return { averageRating: Math.round((totalScore / totalReviews) * 10) / 10, totalReviews };
  }
  const ratedProps = properties.filter((p) => (p.averageRating || 0) > 0);
  if (ratedProps.length > 0) {
    const sum = ratedProps.reduce((acc, p) => acc + (p.averageRating || 0), 0);
    return { averageRating: Math.round((sum / ratedProps.length) * 10) / 10, totalReviews: 0 };
  }
  return { averageRating: 0, totalReviews: 0 };
}

function calcMonthMetrics(txs: TransactionSalesBreakdown[], month: number, year: number) {
  const { curr, prev } = filterMonthTransactions(txs, month, year);
  const currentMonthRevenue = curr.reduce((sum, t) => sum + (t.totalPrice || 0), 0);
  const prevRev = prev.reduce((sum, t) => sum + (t.totalPrice || 0), 0);
  return {
    currentMonthRevenue,
    revenueDiffText: calcDiffText(currentMonthRevenue, prevRev),
    currentMonthBookings: curr.length,
    bookingsDiffText: calcDiffText(curr.length, prev.length),
  };
}

function computeOccupancyMetrics(occ?: any) {
  if (!occ?.matrix) return { occupancyRate: 0, totalDays: 30, bookedUnits: 0, totalCapacity: 0 };
  const days = occ.totalDays || 30;
  let bookedUnits = 0;
  let totalCapacity = 0;
  for (const r of occ.matrix) {
    totalCapacity += (r.totalUnits || 1) * days;
    const rBooked = (r.days || []).reduce((sum: number, d: any) => sum + Math.min(d.bookedUnits || 0, r.totalUnits || 1), 0);
    bookedUnits += rBooked;
  }
  return { occupancyRate: occ.occupancyRate ?? 0, totalDays: days, bookedUnits, totalCapacity };
}

function extractDashboardData(q: ReturnType<typeof useDashboardRawQueries>, month: number, year: number) {
  const properties = q.props.data || [];
  const txs = (q.sales.data?.breakdown || []) as TransactionSalesBreakdown[];
  return {
    properties,
    ...calcMonthMetrics(txs, month, year),
    ...computeRatingStats(properties),
    monthlyData: buildActualMonthlyData(txs, month, year),
  };
}

function buildDashboardState(q: ReturnType<typeof useDashboardRawQueries>, month: number, year: number) {
  const base = extractDashboardData(q, month, year);
  return {
    isLoading: q.sales.isLoading || q.props.isLoading,
    ...base,
    ...computeOccupancyMetrics(q.occupancy.data),
    pendingConfirmations: q.pending.data ?? 0,
    recentBookings: q.orders.bookings,
    hasProperties: base.properties.length > 0,
  };
}

export function useTenantDashboardData(targetMonth?: number, targetYear?: number) {
  const now = new Date();
  const month = targetMonth ?? (now.getMonth() + 1);
  const year = targetYear ?? now.getFullYear();
  const queries = useDashboardRawQueries(month, year);
  return buildDashboardState(queries, month, year);
}
