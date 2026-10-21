import React from 'react';
import { Trash2 } from 'lucide-react';
import { RoomPriceModifier } from '../pricing.types';
import { Spinner } from '../../../components/atoms/Spinner';
import { formatRupiah, formatDateID } from '../../../libs/formatters';

interface RateItemProps {
  rate: RoomPriceModifier;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

const getBadgeText = (type: string, val: number) =>
  `${val > 0 ? '+' : ''}${type === 'PERCENTAGE' ? `${val}%` : formatRupiah(val)}`;

function RateItemInfo({ badgeText, startDate, endDate, reason }: { badgeText: string; startDate: string | Date; endDate: string | Date; reason?: string | null }) {
  return (
    <div>
      <div className="flex items-center gap-2">
        <span className="font-semibold text-primary-700 bg-primary-50 px-2 py-0.5 rounded border border-primary-100">{badgeText}</span>
        <span className="font-medium text-gray-800">{formatDateID(startDate, 'dd MMM yyyy')} - {formatDateID(endDate, 'dd MMM yyyy')}</span>
      </div>
      {reason && <p className="text-gray-500 mt-1">{reason}</p>}
    </div>
  );
}

export function RateItem({ rate, onDelete, isDeleting }: RateItemProps): React.JSX.Element {
  const badgeText = getBadgeText(rate.adjustmentType, rate.adjustmentValue);
  return (
    <div className="flex items-center justify-between p-2.5 rounded-lg border border-gray-200 bg-gray-50/50 text-xs">
      <RateItemInfo badgeText={badgeText} startDate={rate.startDate} endDate={rate.endDate} reason={rate.reason} />
      <button type="button" onClick={() => onDelete(rate.id)} disabled={isDeleting} aria-label="Hapus tarif" className="p-1 text-gray-400 hover:text-rose-600 transition-colors disabled:opacity-50">
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

export interface RateListSectionProps {
  rates: RoomPriceModifier[];
  isLoading: boolean;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

export function RateListSection({ rates, isLoading, onDelete, isDeleting }: RateListSectionProps): React.JSX.Element {
  if (isLoading) return <div className="flex justify-center py-4"><Spinner size="sm" /></div>;
  if (rates.length === 0) return <p className="text-xs text-gray-400 py-2">Belum ada penyesuaian tarif musiman.</p>;
  return (
    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
      {rates.map((r) => <RateItem key={r.id} rate={r} onDelete={onDelete} isDeleting={isDeleting} />)}
    </div>
  );
}
