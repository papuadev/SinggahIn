import React, { useState } from 'react';
import { BarChart3 } from 'lucide-react';
import { SalesGroupBy, SortOrder } from '../../modules/report/report.types';
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

function useSalesReportState() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [groupBy, setGroupBy] = useState<SalesGroupBy>('PROPERTY');
  const [propertyId, setPropertyId] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const reset = () => {
    setStartDate(''); setEndDate(''); setGroupBy('PROPERTY');
    setPropertyId(''); setSortOrder('desc');
  };
  return { startDate, endDate, groupBy, propertyId, sortOrder, setStartDate, setEndDate, setGroupBy, setPropertyId, setSortOrder, reset };
}

function SalesContentSection({ s, data, props, isLoading }: any) {
  return (
    <>
      <SalesSummaryCards totalRevenue={data?.totalRevenue || 0} totalBookings={data?.totalBookings || 0} />
      <SalesFilterBar
        startDate={s.startDate} endDate={s.endDate} groupBy={s.groupBy} propertyId={s.propertyId}
        sortOrder={s.sortOrder} properties={props} onStartDateChange={s.setStartDate}
        onEndDateChange={s.setEndDate} onGroupByChange={s.setGroupBy} onPropertyIdChange={s.setPropertyId}
        onSortOrderChange={s.setSortOrder} onReset={s.reset}
      />
      <SalesBreakdownTable groupBy={s.groupBy} data={data?.breakdown || []} isLoading={isLoading} />
    </>
  );
}

export function TenantSalesReportPage(): React.JSX.Element {
  const s = useSalesReportState();
  const { data: properties = [] } = useTenantProperties();
  const { data, isLoading } = useSalesReport({
    startDate: s.startDate, endDate: s.endDate, groupBy: s.groupBy,
    propertyId: s.propertyId, sortOrder: s.sortOrder,
  });
  return (
    <div className="space-y-6">
      <PageHeader />
      <SalesContentSection s={s} data={data} props={properties} isLoading={isLoading} />
    </div>
  );
}
export default TenantSalesReportPage;
