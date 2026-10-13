import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Plus } from 'lucide-react';
import { Button } from '../../components/atoms/Button';
import { Spinner } from '../../components/atoms/Spinner';
import { useTenantDashboardData } from './dashboard/useTenantDashboardData';
import { DashboardGreetingHeader } from './dashboard/DashboardGreetingHeader';
import { DashboardPropertySummaryGrid } from './dashboard/DashboardPropertySummaryGrid';
import { DashboardRevenueBarChart } from './dashboard/DashboardRevenueBarChart';
import { DashboardUpcomingBookings } from './dashboard/DashboardUpcomingBookings';
import { DashboardActiveProperties } from './dashboard/DashboardActiveProperties';
import { DashboardPendingActionAlert } from './dashboard/DashboardPendingActionAlert';

function EmptyDashboard(): React.JSX.Element {
  return (
    <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 p-8 shadow-xs max-w-xl mx-auto my-8">
      <Building2 className="w-12 h-12 text-primary-600 mx-auto mb-3" />
      <h3 className="text-lg font-bold text-gray-900 mb-1">Belum Ada Properti Terdaftar</h3>
      <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
        Tambahkan properti pertama Anda untuk mulai menerima reservasi tamu dan memantau performa penjualan secara realtime.
      </p>
      <Link to="/tenant/properties/new">
        <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>Tambah Properti Sekarang</Button>
      </Link>
    </div>
  );
}

function DashboardMiddleSection({ d }: { d: ReturnType<typeof useTenantDashboardData> }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
      <div className="lg:col-span-7">
        <DashboardRevenueBarChart monthlyData={d.monthlyData} />
      </div>
      <div className="lg:col-span-5">
        <DashboardUpcomingBookings bookings={d.recentBookings} />
      </div>
    </div>
  );
}

function DashboardSummarySection({ d }: { d: ReturnType<typeof useTenantDashboardData> }) {
  return (
    <DashboardPropertySummaryGrid
      currentMonthRevenue={d.currentMonthRevenue}
      revenueDiffText={d.revenueDiffText}
      currentMonthBookings={d.currentMonthBookings}
      bookingsDiffText={d.bookingsDiffText}
      occupancyRate={d.occupancyRate}
      totalDays={d.totalDays}
      bookedUnits={d.bookedUnits}
      totalCapacity={d.totalCapacity}
      averageRating={d.averageRating}
      totalReviews={d.totalReviews}
    />
  );
}

function DashboardMainLayout({ d }: { d: ReturnType<typeof useTenantDashboardData> }): React.JSX.Element {
  return (
    <div>
      <DashboardPendingActionAlert pendingCount={d.pendingConfirmations} />
      <DashboardSummarySection d={d} />
      <DashboardMiddleSection d={d} />
      <DashboardActiveProperties properties={d.properties} />
    </div>
  );
}

function useDashboardFilter() {
  const now = new Date();
  const [month, setMonth] = React.useState(now.getMonth() + 1);
  const [year, setYear] = React.useState(now.getFullYear());
  return { month, year, setMonth, setYear };
}

export function TenantDashboardPage(): React.JSX.Element {
  const { month, year, setMonth, setYear } = useDashboardFilter();
  const data = useTenantDashboardData(month, year);

  if (data.isLoading) {
    return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  }

  return (
    <div className="max-w-7xl mx-auto py-3">
      <DashboardGreetingHeader
        month={month}
        year={year}
        onMonthChange={setMonth}
        onYearChange={setYear}
      />
      {!data.hasProperties ? <EmptyDashboard /> : <DashboardMainLayout d={data} />}
    </div>
  );
}

export default TenantDashboardPage;
