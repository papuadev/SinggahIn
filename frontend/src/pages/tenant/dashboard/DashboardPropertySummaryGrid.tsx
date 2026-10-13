import React from 'react';
import { Calendar, Wallet, Home, Star, TrendingUp } from 'lucide-react';
import { formatCompactRupiah } from '../../../libs/formatters';

interface SummaryGridProps {
  currentMonthRevenue: number;
  revenueDiffText: string;
  currentMonthBookings: number;
  bookingsDiffText: string;
  occupancyRate: number;
  totalDays: number;
  averageRating: number;
  totalReviews: number;
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtext: string;
}

function StatCardHeader({ icon }: { icon: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="w-11 h-11 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <TrendingUp className="w-4 h-4 text-emerald-500" />
    </div>
  );
}

function StatCard({ icon, label, value, subtext }: StatCardProps): React.JSX.Element {
  return (
    <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between">
      <StatCardHeader icon={icon} />
      <div>
        <p className="text-xs font-medium text-gray-500">{label}</p>
        <p className="text-2xl sm:text-3xl font-extrabold text-gray-800 mt-1">{value}</p>
        <p className="text-xs text-gray-400 mt-1">{subtext}</p>
      </div>
    </div>
  );
}

function BookingsCard({ bookings, subtext }: { bookings: number; subtext: string }) {
  return (
    <StatCard
      icon={<Calendar className="w-5 h-5" />}
      label="Reservasi bulan ini"
      value={bookings}
      subtext={subtext}
    />
  );
}

function RevenueCard({ revenue, subtext }: { revenue: number; subtext: string }) {
  const displayRev = revenue > 0 ? formatCompactRupiah(revenue) : 'Rp0';
  return (
    <StatCard
      icon={<Wallet className="w-5 h-5" />}
      label="Pendapatan"
      value={displayRev}
      subtext={subtext}
    />
  );
}

function OccupancyCard({ rate, totalDays }: { rate: number; totalDays: number }) {
  const days = totalDays > 0 ? totalDays : 30;
  const occupied = Math.round((rate / 100) * days);
  return (
    <StatCard
      icon={<Home className="w-5 h-5" />}
      label="Tingkat hunian"
      value={`${rate}%`}
      subtext={`${occupied} dari ${days} malam`}
    />
  );
}

function RatingCard({ rating, reviews }: { rating: number; reviews: number }) {
  const displayRating = rating > 0 ? rating.toFixed(1) : '-';
  const displayReviews = reviews > 0 ? `${reviews} ulasan` : 'Belum ada ulasan';
  return (
    <StatCard
      icon={<Star className="w-5 h-5" />}
      label="Rating properti"
      value={displayRating}
      subtext={displayReviews}
    />
  );
}

export function DashboardPropertySummaryGrid(p: SummaryGridProps): React.JSX.Element {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <BookingsCard bookings={p.currentMonthBookings} subtext={p.bookingsDiffText} />
      <RevenueCard revenue={p.currentMonthRevenue} subtext={p.revenueDiffText} />
      <OccupancyCard rate={p.occupancyRate} totalDays={p.totalDays} />
      <RatingCard rating={p.averageRating} reviews={p.totalReviews} />
    </div>
  );
}
