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
      <span className="text-xs text-gray-500 block leading-tight font-medium">Mulai dari</span>
      <div className="text-lg font-black text-primary-600 leading-tight">
        {lowestPrice ? formatRupiah(lowestPrice) : 'Hubungi Kami'}
        {lowestPrice && <span className="text-xs font-normal text-gray-500 ml-1">/ malam</span>}
      </div>
    </div>
  );
}

export function PropertyDetailMobileBar({ lowestPrice, onScrollToRooms }: MobileBarProps): React.JSX.Element {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-gray-200 px-4 py-3 shadow-lg flex items-center justify-between gap-4">
      <MobilePriceBlock lowestPrice={lowestPrice} />
      <Button type="button" variant="primary" size="md" onClick={onScrollToRooms} rightIcon={<ArrowDown className="w-4 h-4" />} className="font-bold text-sm px-4">
        Pilih Kamar
      </Button>
    </div>
  );
}
