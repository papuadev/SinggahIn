import React, { useState } from 'react';
import { BarChart3 } from 'lucide-react';
import { SalesGroupBy, SalesSortOption } from '../../modules/report/report.types';
import { useSalesReport } from '../../modules/report/hooks/useSalesReport';
import { useTenantProperties } from '../../modules/property/hooks/useProperties';
import { SalesSummaryCards } from '../../modules/report/components/SalesSummaryCards';
import { SalesFilterBar } from '../../modules/report/components/SalesFilterBar';
import { SalesBreakdownTable } from '../../modules/report/components/SalesBreakdownTable';

function PageHeader(): React.JSX.Element {
  return (
    <div>
      <div className="flex items-center gap-2 text-primary-700">
        <BarChart3 className="w-6 h-6" />
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Laporan Penjualan</h1>
      </div>
      <p className="text-xs sm:text-sm text-gray-500 mt-1">
        Pantau agregasi pendapatan dan performa reservasi seluruh properti Anda.
      </p>
    </div>
  );
}

function getMonthRange(year: number, month: number) {
  const mm = String(month).padStart(2, '0');
  const lastDay = new Date(year, month, 0).getDate();
  return { startDate: `${year}-${mm}-01`, endDate: `${year}-${mm}-${String(lastDay).padStart(2, '0')}` };
}

function getInitialState() {
  const now = new Date();
  const m = now.getMonth() + 1;
  const y = now.getFullYear();
  return { month: m, year: y, ...getMonthRange(y, m), isAllData: false, groupBy: 'PROPERTY' as SalesGroupBy, propertyId: '', sortBy: 'TERTINGGI' as SalesSortOption };
}

function useSalesReportState() {
  const [state, setState] = useState(getInitialState);
  const onMonth = (month: number) => setState((p) => ({ ...p, month, ...getMonthRange(p.year, month) }));
  const onYear = (year: number) => setState((p) => ({ ...p, year, ...getMonthRange(year, p.month) }));
  const onStart = (startDate: string) => setState((p) => ({ ...p, startDate }));
  const onEnd = (endDate: string) => setState((p) => ({ ...p, endDate }));
  const toggleAll = () => setState((p) => ({ ...p, isAllData: !p.isAllData }));
  const reset = () => setState((p) => ({ ...p, ...getInitialState() }));
  return { state, setState, onMonth, onYear, onStart, onEnd, toggleAll, reset };
}

function buildQueryParams(s: ReturnType<typeof getInitialState>) {
  return {
    startDate: s.isAllData ? undefined : s.startDate || undefined,
    endDate: s.isAllData ? undefined : s.endDate || undefined,
    month: s.isAllData ? undefined : s.month,
    year: s.isAllData ? undefined : s.year,
    allData: s.isAllData ? true : undefined,
    groupBy: s.groupBy,
    propertyId: s.propertyId || undefined,
    sortBy: s.sortBy,
  };
}

function SalesContentSection({ s, data, props, isLoading }: any) {
  return (
    <>
      <SalesSummaryCards totalRevenue={data?.totalRevenue || 0} totalBookings={data?.totalBookings || 0} />
      <SalesFilterBar
        {...s.state} properties={props}
        onStartDateChange={s.onStart} onEndDateChange={s.onEnd}
        onMonthChange={s.onMonth} onYearChange={s.onYear}
        onToggleAllData={s.toggleAll} onReset={s.reset}
        onGroupByChange={(groupBy) => s.setState((p: any) => ({ ...p, groupBy }))}
        onPropertyIdChange={(propertyId) => s.setState((p: any) => ({ ...p, propertyId }))}
        onSortByChange={(sortBy) => s.setState((p: any) => ({ ...p, sortBy }))}
      />
      <SalesBreakdownTable groupBy={s.state.groupBy} data={data?.breakdown || []} isLoading={isLoading} />
    </>
  );
}

export function TenantSalesReportPage(): React.JSX.Element {
  const s = useSalesReportState();
  const { data: properties = [] } = useTenantProperties();
  const { data, isLoading } = useSalesReport(buildQueryParams(s.state));
  return (
    <div className="space-y-6">
      <PageHeader />
      <SalesContentSection s={s} data={data} props={properties} isLoading={isLoading} />
    </div>
  );
}
export default TenantSalesReportPage;
