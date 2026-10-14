import React, { useState } from 'react';
import { CalendarRange } from 'lucide-react';
import { useOccupancyReport } from '../../modules/report/hooks/useOccupancyReport';
import { useTenantProperties } from '../../modules/property/hooks/useProperties';
import { OccupancyFilterBar } from '../../modules/report/components/OccupancyFilterBar';
import { OccupancyMatrixGrid } from '../../modules/report/components/OccupancyMatrixGrid';

function PageHeader(): React.JSX.Element {
  return (
    <div>
      <div className="flex items-center gap-2 text-primary-700">
        <CalendarRange className="w-6 h-6" />
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Matriks Okupansi Properti</h1>
      </div>
      <p className="text-xs sm:text-sm text-gray-500 mt-1">
        Pantau ketersediaan dan tingkat pemesanan harian seluruh unit kamar secara visual.
      </p>
    </div>
  );
}

function useOccupancyState() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [propertyId, setPropertyId] = useState('');
  return { month, year, propertyId, setMonth, setYear, setPropertyId };
}

function OccupancyContentSection({ s, props, data, isLoading }: any) {
  return (
    <>
      <OccupancyFilterBar
        month={s.month} year={s.year} propertyId={s.propertyId} properties={props}
        onMonthChange={s.setMonth} onYearChange={s.setYear} onPropertyChange={s.setPropertyId}
      />
      <OccupancyMatrixGrid
        matrix={data?.matrix || []} occupancyRate={data?.occupancyRate || 0}
        totalDays={data?.totalDays || 30} isLoading={isLoading}
      />
    </>
  );
}

export function TenantOccupancyMatrixPage(): React.JSX.Element {
  const s = useOccupancyState();
  const { data: properties = [] } = useTenantProperties();
  const { data, isLoading } = useOccupancyReport({ month: s.month, year: s.year, propertyId: s.propertyId });
  return (
    <div className="space-y-6">
      <PageHeader />
      <OccupancyContentSection s={s} props={properties} data={data} isLoading={isLoading} />
    </div>
  );
}
export default TenantOccupancyMatrixPage;
