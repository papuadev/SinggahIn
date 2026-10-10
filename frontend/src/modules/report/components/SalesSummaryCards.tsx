import React from 'react';
import { TrendingUp, ShoppingBag, CreditCard } from 'lucide-react';
import { formatRupiah } from '../../../libs/formatters';

interface SalesSummaryCardsProps {
  totalRevenue: number;
  totalBookings: number;
}

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
}

function StatCard({ title, value, subtitle, icon, color }: StatCardProps): React.JSX.Element {
  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
      <div className="space-y-1">
        <p className="text-xs font-medium text-gray-500">{title}</p>
        <p className="text-xl sm:text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-400">{subtitle}</p>
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>{icon}</div>
    </div>
  );
}

export function SalesSummaryCards({ totalRevenue, totalBookings }: SalesSummaryCardsProps): React.JSX.Element {
  const avg = totalBookings > 0 ? Math.round(totalRevenue / totalBookings) : 0;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <StatCard
        title="Total Pendapatan" value={formatRupiah(totalRevenue)}
        subtitle="Dari seluruh transaksi selesai"
        icon={<TrendingUp className="w-6 h-6 text-emerald-600" />} color="bg-emerald-50"
      />
      <StatCard
        title="Total Transaksi" value={`${totalBookings} Pesanan`}
        subtitle="Pesanan berhasil & diproses"
        icon={<ShoppingBag className="w-6 h-6 text-primary-600" />} color="bg-primary-50"
      />
      <StatCard
        title="Rata-rata Transaksi" value={formatRupiah(avg)}
        subtitle="Nilai per transaksi booking"
        icon={<CreditCard className="w-6 h-6 text-indigo-600" />} color="bg-indigo-50"
      />
    </div>
  );
}
