import { useQuery } from '@tanstack/react-query';
import { useSalesReport } from '../../../modules/report/hooks/useSalesReport';
import { useOccupancyReport } from '../../../modules/report/hooks/useOccupancyReport';
import { useTenantProperties } from '../../../modules/property/hooks/useProperties';
import { useTenantOrders } from '../../../modules/booking/hooks/useTenantOrders';
import { bookingApi } from '../../../modules/booking/services/booking.api';
import { MonthBarData } from './DashboardRevenueBarChart';

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

function useDashboardRawQueries(month: number, year: number) {
  const sales = useSalesReport({ month, year, groupBy: 'TRANSACTION' });
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

function resolveMonthlyData(salesMonthly?: MonthBarData[], month = 10, year = 2026): MonthBarData[] {
  if (salesMonthly && salesMonthly.length > 0) return salesMonthly;
  const names = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  return Array.from({ length: 6 }, (_, idx) => {
    const i = 5 - idx;
    const d = new Date(year, month - 1 - i, 1);
    return { month: names[d.getMonth()], amount: 0, isCurrent: i === 0 };
  });
}

function extractDashboardData(q: ReturnType<typeof useDashboardRawQueries>, month: number, year: number) {
  const properties = q.props.data || [];
  const sData = q.sales.data;
  return {
    properties,
    currentMonthRevenue: sData?.totalRevenue ?? 0,
    currentMonthBookings: sData?.totalBookings ?? 0,
    revenueDiffText: sData?.revenueDiffText ?? '0% dari bulan lalu',
    bookingsDiffText: sData?.bookingsDiffText ?? '0% dari bulan lalu',
    monthlyData: resolveMonthlyData(sData?.monthlyRevenue as MonthBarData[], month, year),
    ...computeRatingStats(properties),
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
