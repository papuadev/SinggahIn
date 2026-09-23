import React from 'react';
import { Users, Minus, Plus } from 'lucide-react';

interface GuestCounterProps {
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
}

export function GuestCounter({
  value,
  onChange,
  min = 1,
  max = 30,
}: GuestCounterProps): React.JSX.Element {
  const dec = () => value > min && onChange(value - 1);
  const inc = () => value < max && onChange(value + 1);

  return (
    <div className="flex flex-col">
      <span className="text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1.5">
        <Users className="w-3.5 h-3.5 text-primary-600" />
        Tamu
      </span>
      <div className="flex items-center justify-between border border-gray-200 rounded-xl px-3 py-2 bg-white">
        <span className="text-sm font-semibold text-gray-800">{value} Tamu</span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={dec}
            disabled={value <= min}
            aria-label="Kurangi jumlah tamu"
            className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={inc}
            disabled={value >= max}
            aria-label="Tambah jumlah tamu"
            className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
