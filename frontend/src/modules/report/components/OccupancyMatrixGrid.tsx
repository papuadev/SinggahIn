import React from 'react';
import { BedDouble, CalendarDays } from 'lucide-react';
import { RoomOccupancyDto, DayOccupancyDto } from '../report.types';

interface OccupancyMatrixGridProps {
  matrix: RoomOccupancyDto[];
  occupancyRate: number;
  totalDays: number;
  isLoading?: boolean;
}

function LegendBadges(): React.JSX.Element {
  return (
    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
      <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500" />Tersedia</span>
      <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-600" />Terisi (Booked)</span>
      <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-rose-500" />Diblokir</span>
    </div>
  );
}

function OccupancyRateBanner({ rate }: { rate: number }): React.JSX.Element {
  return (
    <div className="bg-primary-50 border border-primary-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <p className="text-xs font-semibold text-primary-800 uppercase tracking-wide">Rata-rata Tingkat Okupansi</p>
        <p className="text-2xl font-black text-primary-900 mt-0.5">{rate}%</p>
      </div>
      <div className="w-full sm:w-64 space-y-1">
        <div className="w-full bg-primary-200 h-2.5 rounded-full overflow-hidden">
          <div className="bg-primary-600 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, rate)}%` }} />
        </div>
        <p className="text-[11px] text-primary-700 text-right">Kapasitas unit terpakai</p>
      </div>
    </div>
  );
}

function getDayCellClass(status: DayOccupancyDto['status']): string {
  if (status === 'BOOKED') return 'bg-blue-600 text-white font-bold';
  if (status === 'BLOCKED') return 'bg-rose-500 text-white font-bold';
  return 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100';
}

function DayCell({ day }: { day: DayOccupancyDto }) {
  const cls = getDayCellClass(day.status);
  const title = `${day.date}: ${day.status}${day.reason ? ` (${day.reason})` : ''}`;
  return (
    <td key={day.date} className="p-1 text-center" title={title}>
      <span className={`w-6 h-6 inline-flex items-center justify-center rounded text-[11px] cursor-default transition-transform hover:scale-110 ${cls}`}>
        {day.day}
      </span>
    </td>
  );
}

function RoomRow({ room }: { room: RoomOccupancyDto }) {
  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
      <td className="py-2.5 px-3 sticky left-0 bg-white z-10 border-r border-gray-200 shadow-xs min-w-[180px]">
        <div className="flex items-center gap-2">
          <BedDouble className="w-4 h-4 text-primary-600 shrink-0" />
          <div>
            <p className="font-semibold text-xs text-gray-900 leading-tight">{room.roomName}</p>
            <p className="text-[10px] text-gray-400 mt-0.5 truncate max-w-[150px]">{room.propertyName} ({room.totalUnits} unit)</p>
          </div>
        </div>
      </td>
      {room.days.map((d) => (<DayCell key={d.date} day={d} />))}
    </tr>
  );
}

function MatrixTable({ matrix, totalDays }: { matrix: RoomOccupancyDto[]; totalDays: number }) {
  const dayNumbers = Array.from({ length: totalDays }, (_, i) => i + 1);
  return (
    <div className="overflow-x-auto pb-2">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200 text-gray-500">
            <th className="py-2 px-3 text-left sticky left-0 bg-gray-50 z-20 border-r border-gray-200">Kamar / Properti</th>
            {dayNumbers.map((d) => (<th key={d} className="p-1 text-center font-semibold w-7">{d}</th>))}
          </tr>
        </thead>
        <tbody>{matrix.map((r) => (<RoomRow key={r.roomId} room={r} />))}</tbody>
      </table>
    </div>
  );
}

export function OccupancyMatrixGrid(props: OccupancyMatrixGridProps): React.JSX.Element {
  if (props.isLoading) return <div className="p-8 text-center text-xs text-gray-400">Memuat matriks okupansi...</div>;
  if (!props.matrix || props.matrix.length === 0) {
    return <div className="p-12 text-center text-xs text-gray-400 bg-white rounded-2xl border border-gray-200">Belum ada kamar atau properti yang terdaftar.</div>;
  }
  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
      <OccupancyRateBanner rate={props.occupancyRate} />
      <div className="flex items-center justify-between pt-1">
        <h4 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
          <CalendarDays className="w-4 h-4 text-primary-600" />
          <span>Matriks Ketersediaan Unit Harian</span>
        </h4>
        <LegendBadges />
      </div>
      <MatrixTable matrix={props.matrix} totalDays={props.totalDays} />
    </div>
  );
}
