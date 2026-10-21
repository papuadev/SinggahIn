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
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1.5 mt-0.5 border-t border-gray-100 text-xs">
      <LegendDot colorClass="bg-primary-600" label="Tersedia" />
      <LegendDot colorClass="bg-red-500" label="Penuh" />
      <LegendDot colorClass="bg-slate-400" label="Tutup (Tidak Tersedia)" />
    </div>
  );
}
