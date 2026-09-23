import React from 'react';
import { ArrowDown } from 'lucide-react';
import { Button } from '../../atoms/Button';
import { formatRupiah } from '../../../libs/formatters';

interface MobileBarProps {
  lowestPrice?: number;
  onScrollToRooms: () => void;
}

function MobilePriceBlock({ lowestPrice }: { lowestPrice?: number }) {
  return (
    <div>
      <span className="text-[10px] text-gray-500 block leading-tight">Mulai dari</span>
      <div className="text-base font-black text-primary-600">
        {lowestPrice ? formatRupiah(lowestPrice) : 'Hubungi Kami'}
        {lowestPrice && <span className="text-[10px] font-normal text-gray-500 ml-1">/ malam</span>}
      </div>
    </div>
  );
}

export function PropertyDetailMobileBar({ lowestPrice, onScrollToRooms }: MobileBarProps): React.JSX.Element {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-gray-200 px-4 py-3 shadow-lg flex items-center justify-between gap-4">
      <MobilePriceBlock lowestPrice={lowestPrice} />
      <Button type="button" variant="primary" size="sm" onClick={onScrollToRooms} rightIcon={<ArrowDown className="w-3.5 h-3.5" />} className="font-bold text-xs px-4">
        Pilih Kamar
      </Button>
    </div>
  );
}
