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

function buildActualMonthlyData(txs: TransactionSalesBreakdown[]): MonthBarData[] {
  const result: MonthBarData[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = formatDateID(d, 'LLL');
    const matched = txs.filter((t) => {
      const dt = new Date(t.createdAt);
      return dt.getFullYear() === d.getFullYear() && dt.getMonth() === d.getMonth();
    });
    const amount = matched.reduce((sum, t) => sum + (t.totalPrice || 0), 0);
    result.push({ month, amount, isCurrent: i === 0 });
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

function filterMonthTransactions(txs: TransactionSalesBreakdown[]) {
  const now = new Date();
  const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const curr = txs.filter((t) => {
    const d = new Date(t.createdAt);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  });
  const prev = txs.filter((t) => {
    const d = new Date(t.createdAt);
    return d.getFullYear() === prevDate.getFullYear() && d.getMonth() === prevDate.getMonth();
  });
  return { curr, prev };
}

function useDashboardRawQueries() {
  const now = new Date();
  const sales = useSalesReport({ allData: true, groupBy: 'TRANSACTION' });
  const occupancy = useOccupancyReport({ month: now.getMonth() + 1, year: now.getFullYear() });
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

function calcMonthMetrics(txs: TransactionSalesBreakdown[]) {
  const { curr, prev } = filterMonthTransactions(txs);
  const currentMonthRevenue = curr.reduce((sum, t) => sum + (t.totalPrice || 0), 0);
  const prevRev = prev.reduce((sum, t) => sum + (t.totalPrice || 0), 0);
  return {
    currentMonthRevenue,
    revenueDiffText: calcDiffText(currentMonthRevenue, prevRev),
    currentMonthBookings: curr.length,
    bookingsDiffText: calcDiffText(curr.length, prev.length),
  };
}

function extractDashboardData(q: ReturnType<typeof useDashboardRawQueries>) {
  const properties = q.props.data || [];
  const txs = (q.sales.data?.breakdown || []) as TransactionSalesBreakdown[];
  return {
    properties,
    ...calcMonthMetrics(txs),
    ...computeRatingStats(properties),
    monthlyData: buildActualMonthlyData(txs),
  };
}

function buildDashboardState(q: ReturnType<typeof useDashboardRawQueries>) {
  const base = extractDashboardData(q);
  return {
    isLoading: q.sales.isLoading || q.props.isLoading,
    ...base,
    occupancyRate: q.occupancy.data?.occupancyRate ?? 0,
    totalDays: q.occupancy.data?.totalDays ?? 30,
    pendingConfirmations: q.pending.data ?? 0,
    recentBookings: q.orders.bookings,
    hasProperties: base.properties.length > 0,
  };
}

export function useTenantDashboardData() {
  const queries = useDashboardRawQueries();
  return buildDashboardState(queries);
}
