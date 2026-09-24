import React from 'react';

function LegendDot({ colorClass, label }: { colorClass: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-gray-600">
      <span className={`w-2.5 h-2.5 rounded-full ${colorClass}`} />
      <span>{label}</span>
    </div>
  );
}

export function CalendarLegend(): React.JSX.Element {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 pt-2.5 border-t border-gray-100 text-[11px] sm:text-xs">
      <LegendDot colorClass="bg-primary-600" label="Tersedia (Tarif Harian)" />
      <LegendDot colorClass="bg-red-500" label="Penuh / Sold Out" />
      <LegendDot colorClass="bg-primary-100 border border-primary-400" label="Rentang Menginap" />
      <LegendDot colorClass="bg-gray-300" label="Lewat Tanggal" />
    </div>
  );
}
