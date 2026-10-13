import React from 'react';
import { formatCompactRupiah } from '../../../libs/formatters';

export interface MonthBarData {
  month: string;
  amount: number;
  isCurrent: boolean;
}

interface ChartProps {
  monthlyData: MonthBarData[];
}

function ChartHeader({ year }: { year: number }): React.JSX.Element {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h3 className="text-base sm:text-lg font-bold text-gray-800">Pendapatan</h3>
        <p className="text-xs text-gray-400 mt-0.5">6 bulan terakhir</p>
      </div>
      <span className="px-3.5 py-1 text-xs font-semibold text-gray-600 bg-gray-50 border border-gray-200 rounded-full">
        {year}
      </span>
    </div>
  );
}

function getBarStyle(item: MonthBarData, maxAmount: number) {
  const hasAmount = item.amount > 0;
  const percent = maxAmount > 0 && hasAmount ? Math.max(12, Math.min(100, Math.round((item.amount / maxAmount) * 100))) : 4;
  const barColor = item.isCurrent
    ? (hasAmount ? 'bg-primary-600 hover:bg-primary-700' : 'bg-primary-200')
    : (hasAmount ? 'bg-primary-100 hover:bg-primary-200' : 'bg-gray-100');
  const title = `${item.month}: ${hasAmount ? formatCompactRupiah(item.amount) : 'Rp0'}`;
  return { percent, barColor, title };
}

function VerticalBar({ item, maxAmount }: { item: MonthBarData; maxAmount: number }): React.JSX.Element {
  const { percent, barColor, title } = getBarStyle(item, maxAmount);
  return (
    <div className="flex-1 flex flex-col items-center justify-end h-48 sm:h-56 gap-2 group">
      <div className="w-full max-w-[48px] h-full flex items-end justify-center">
        <div title={title} style={{ height: `${percent}%` }} className={`w-full rounded-2xl transition-all duration-300 ${barColor}`} />
      </div>
      <span className="text-xs font-medium text-gray-400 group-hover:text-gray-900 transition-colors">{item.month}</span>
    </div>
  );
}

export function DashboardRevenueBarChart({ monthlyData }: ChartProps): React.JSX.Element {
  const currentYear = new Date().getFullYear();
  const maxAmount = Math.max(...monthlyData.map((d) => d.amount), 0);
  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs flex flex-col justify-between h-full">
      <ChartHeader year={currentYear} />
      <div className="flex items-end justify-between gap-2 sm:gap-4 pt-4 px-2">
        {monthlyData.map((item, idx) => (
          <VerticalBar key={idx} item={item} maxAmount={maxAmount} />
        ))}
      </div>
    </div>
  );
}
