import React from 'react';
import { Building2, Receipt, UserCheck, Inbox } from 'lucide-react';
import { SalesGroupBy, PropertySalesBreakdown, TransactionSalesBreakdown, UserSalesBreakdown } from '../report.types';
import { formatRupiah, formatDateID } from '../../../libs/formatters';

interface SalesBreakdownTableProps {
  groupBy: SalesGroupBy;
  data: any[];
  isLoading?: boolean;
}

function EmptyBreakdown(): React.JSX.Element {
  return (
    <div className="text-center py-12 px-4">
      <Inbox className="w-10 h-10 text-gray-300 mx-auto mb-2" />
      <p className="text-sm font-semibold text-gray-700">Tidak Ada Data Penjualan</p>
      <p className="text-xs text-gray-400 mt-0.5">Tidak ditemukan data transaksi pada filter dan periode ini.</p>
    </div>
  );
}

function PropertyRow({ item }: { item: PropertySalesBreakdown }) {
  return (
    <tr className="hover:bg-gray-50 border-b border-gray-100 transition-colors">
      <td className="py-3 px-4 flex items-center gap-2.5 font-medium text-gray-900">
        <Building2 className="w-4 h-4 text-primary-600 shrink-0" />
        <span>{item.name}</span>
      </td>
      <td className="py-3 px-4 text-gray-600">{item.totalTransactions} Transaksi</td>
      <td className="py-3 px-4 text-right font-bold text-emerald-600">{formatRupiah(item.revenue)}</td>
    </tr>
  );
}

function UserRow({ item }: { item: UserSalesBreakdown }) {
  return (
    <tr className="hover:bg-gray-50 border-b border-gray-100 transition-colors">
      <td className="py-3 px-4 font-medium text-gray-900 flex items-center gap-2">
        <UserCheck className="w-4 h-4 text-indigo-600 shrink-0" />
        <span>{item.name}</span>
      </td>
      <td className="py-3 px-4 text-gray-500 font-mono text-xs">{item.email}</td>
      <td className="py-3 px-4 text-gray-600">{item.totalBookings} Pesanan</td>
      <td className="py-3 px-4 text-right font-bold text-emerald-600">{formatRupiah(item.totalSpent)}</td>
    </tr>
  );
}

function TransactionRow({ item }: { item: TransactionSalesBreakdown }) {
  return (
    <tr className="hover:bg-gray-50 border-b border-gray-100 text-xs transition-colors">
      <td className="py-3 px-4 font-mono font-bold text-primary-700">{item.bookingCode}</td>
      <td className="py-3 px-4">
        <p className="font-semibold text-gray-900">{item.propertyName}</p>
        <p className="text-gray-400 text-[11px]">{item.roomName}</p>
      </td>
      <td className="py-3 px-4 text-gray-700">{item.userName}</td>
      <td className="py-3 px-4 text-gray-500">{formatDateID(item.checkInDate)} - {formatDateID(item.checkOutDate)}</td>
      <td className="py-3 px-4 font-bold text-emerald-600">{formatRupiah(item.totalPrice)}</td>
      <td className="py-3 px-4"><span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700">{item.paymentMethod === 'PAYMENT_GATEWAY' ? 'Otomatis' : 'Manual'}</span></td>
    </tr>
  );
}

function TransactionHeader() {
  return (
    <tr className="bg-gray-50 border-b border-gray-200 text-left text-xs font-semibold text-gray-500">
      <th className="py-3 px-4">Kode Booking</th><th className="py-3 px-4">Properti & Kamar</th>
      <th className="py-3 px-4">Tamu</th><th className="py-3 px-4">Durasi Menginap</th>
      <th className="py-3 px-4">Total Bayar</th><th className="py-3 px-4">Metode</th>
    </tr>
  );
}

function UserHeader() {
  return (
    <tr className="bg-gray-50 border-b border-gray-200 text-left text-xs font-semibold text-gray-500">
      <th className="py-3 px-4">Nama Tamu</th><th className="py-3 px-4">Email</th>
      <th className="py-3 px-4">Total Pesanan</th><th className="py-3 px-4 text-right">Total Belanja</th>
    </tr>
  );
}

function PropertyHeader() {
  return (
    <tr className="bg-gray-50 border-b border-gray-200 text-left text-xs font-semibold text-gray-500">
      <th className="py-3 px-4">Nama Properti</th><th className="py-3 px-4">Total Transaksi</th>
      <th className="py-3 px-4 text-right">Total Pendapatan</th>
    </tr>
  );
}

function TableHeader({ groupBy }: { groupBy: SalesGroupBy }) {
  if (groupBy === 'TRANSACTION') return <TransactionHeader />;
  if (groupBy === 'USER') return <UserHeader />;
  return <PropertyHeader />;
}

function TableBody({ groupBy, data }: { groupBy: SalesGroupBy; data: any[] }) {
  return (
    <tbody>
      {data.map((item, idx) => {
        const key = item.id || idx;
        if (groupBy === 'PROPERTY') return <PropertyRow key={key} item={item} />;
        if (groupBy === 'USER') return <UserRow key={key} item={item} />;
        return <TransactionRow key={key} item={item} />;
      })}
    </tbody>
  );
}

export function SalesBreakdownTable({ groupBy, data, isLoading }: SalesBreakdownTableProps): React.JSX.Element {
  if (isLoading) return <div className="p-8 text-center text-xs text-gray-400">Memuat rincian laporan penjualan...</div>;
  if (!data || data.length === 0) return <EmptyBreakdown />;
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
      <div className="p-4 border-b border-gray-100 flex items-center gap-2">
        <Receipt className="w-4 h-4 text-primary-600" />
        <h4 className="text-sm font-bold text-gray-900">Rincian Data ({data.length} baris)</h4>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><TableHeader groupBy={groupBy} /></thead>
          <TableBody groupBy={groupBy} data={data} />
        </table>
      </div>
    </div>
  );
}
