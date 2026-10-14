import React, { useState } from 'react';
import { Users, BedDouble, Calendar, ArrowRight, Images } from 'lucide-react';
import { Button } from '../../atoms/Button';
import { formatRupiah } from '../../../libs/formatters';
import { PropertyRoomSummary } from '../../../modules/property/property.types';
import { useStayPricing } from '../../../modules/room/hooks/useRoomPricing';
import { StayPricingCalculation } from '../../../modules/room/pricing.types';
import { RoomPhotoModal } from './RoomPhotoModal';

export interface PropertyDetailRoomCardProps {
  room: PropertyRoomSummary;
  propertyId: string;
  checkIn?: string;
  checkOut?: string;
  coverImage?: string;
  onBook?: (roomId: string) => void;
  onOpenCalendar?: (roomId: string) => void;
}

interface RoomInfoProps {
  name: string;
  description?: string | null;
  capacity: number;
  totalUnits: number;
}

function RoomBadges({ capacity, totalUnits }: { capacity: number; totalUnits: number }) {
  return (
    <div className="flex flex-wrap items-center gap-2 my-2">
      <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded-md font-medium">
        <Users className="w-3.5 h-3.5 text-gray-500" />
        <span>Maks. {capacity} Tamu</span>
      </span>
      <span className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-700 text-xs px-2.5 py-1 rounded-md font-medium border border-primary-100">
        <BedDouble className="w-3.5 h-3.5 text-primary-600" />
        <span>{totalUnits} unit tersedia</span>
      </span>
    </div>
  );
}

function DynamicRateLabel({ nights = 0, isCustom = false }: { nights?: number; isCustom?: boolean }) {
  if (nights > 1) {
    return <span className="text-xs text-gray-500 font-medium">Tarif rata-rata</span>;
  }
  if (nights === 1) {
    return <span className="text-xs text-gray-500 font-medium">{isCustom ? 'Tarif tanggal dipilih' : 'Tarif per malam'}</span>;
  }
  return <span className="text-xs text-gray-500 font-medium">Mulai dari</span>;
}

function TotalPriceLabel({ pricing }: { pricing?: StayPricingCalculation }) {
  if (!pricing || pricing.totalNights <= 1) return null;
  return (
    <span className="text-xs text-gray-600 font-semibold mt-0.5">
      Total {formatRupiah(pricing.totalStayPrice)} ({pricing.totalNights} malam)
    </span>
  );
}

function RoomPricing({ basePrice, pricing }: { basePrice: number; pricing?: StayPricingCalculation }) {
  const rate = pricing?.averageNightRate || basePrice;
  const isCustom = Boolean(pricing && pricing.averageNightRate !== basePrice);
  return (
    <div className="flex flex-col text-left md:text-right">
      <DynamicRateLabel nights={pricing?.totalNights} isCustom={isCustom} />
      <div className="text-lg sm:text-xl font-extrabold text-primary-600">
        {formatRupiah(rate)}
        <span className="text-xs font-normal text-gray-500 ml-1">/ malam</span>
      </div>
      <TotalPriceLabel pricing={pricing} />
    </div>
  );
}

function RoomInfo({ name, description, capacity, totalUnits }: RoomInfoProps) {
  return (
    <div className="flex-1">
      <h3 className="text-base sm:text-lg font-bold text-gray-900">{name}</h3>
      {description && <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">{description}</p>}
      <RoomBadges capacity={capacity} totalUnits={totalUnits} />
    </div>
  );
}

function RoomNavButtons({ id, onBook, onCalendar }: { id: string; onBook?: (id: string) => void; onCalendar?: (id: string) => void }) {
  return (
    <>
      {onCalendar && (
        <Button type="button" variant="outline" size="sm" onClick={() => onCalendar(id)} leftIcon={<Calendar className="w-3.5 h-3.5" />} className="text-xs">
          Kalender Tarif
        </Button>
      )}
      <Button type="button" variant="primary" size="sm" onClick={() => onBook?.(id)} rightIcon={<ArrowRight className="w-3.5 h-3.5" />} className="text-xs font-semibold">
        Pesan Sekarang
      </Button>
    </>
  );
}

function RoomPhotoBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button" onClick={onClick} title="Lihat Foto Kamar" aria-label="Lihat Foto Kamar"
      className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg border border-gray-200 hover:border-primary-200 transition-colors cursor-pointer shrink-0"
    >
      <Images className="w-4 h-4" />
    </button>
  );
}

function RoomActions({ roomId, onBook, onOpenCalendar, onOpenPhotos }: {
  roomId: string; onBook?: (id: string) => void; onOpenCalendar?: (id: string) => void; onOpenPhotos: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <RoomPhotoBtn onClick={onOpenPhotos} />
      <RoomNavButtons id={roomId} onBook={onBook} onCalendar={onOpenCalendar} />
    </div>
  );
}

function RoomSideCol({ price, pricing, id, onBook, onCalendar, onPhotos }: {
  price: number; pricing?: StayPricingCalculation; id: string; onBook?: (id: string) => void; onCalendar?: (id: string) => void; onPhotos: () => void;
}) {
  return (
    <div className="flex md:flex-col items-center md:items-end justify-between gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-gray-100">
      <RoomPricing basePrice={price} pricing={pricing} />
      <RoomActions roomId={id} onBook={onBook} onOpenCalendar={onCalendar} onOpenPhotos={onPhotos} />
    </div>
  );
}

export function PropertyDetailRoomCard({
  room, checkIn, checkOut, coverImage, onBook, onOpenCalendar,
}: PropertyDetailRoomCardProps): React.JSX.Element {
  const [photoOpen, setPhotoOpen] = useState(false);
  const { data: pricing } = useStayPricing(room.id, checkIn, checkOut);
  const photos = room.images?.length ? room.images.map((i) => i.imageUrl) : (coverImage ? [coverImage] : []);
  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-white border border-gray-200 shadow-sm hover:border-primary-200 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
      <RoomInfo name={room.name} description={room.description} capacity={room.capacity} totalUnits={room.totalUnits} />
      <RoomSideCol price={room.basePrice} pricing={pricing} id={room.id} onBook={onBook} onCalendar={onOpenCalendar} onPhotos={() => setPhotoOpen(true)} />
      <RoomPhotoModal isOpen={photoOpen} onClose={() => setPhotoOpen(false)} roomName={room.name} images={photos} isFallback={!room.images?.length} />
    </div>
  );
}
