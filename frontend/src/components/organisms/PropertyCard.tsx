import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, Building } from 'lucide-react';
import { CatalogPropertyItem } from '../../modules/property/property.types';
import { formatRupiah } from '../../libs/formatters';

export interface PropertyCardProps {
  property: CatalogPropertyItem;
  checkIn?: string;
  checkOut?: string;
  className?: string;
}

function buildPropertyUrl(id: string, checkIn?: string, checkOut?: string): string {
  const params = new URLSearchParams();
  if (checkIn) params.set('checkIn', checkIn);
  if (checkOut) params.set('checkOut', checkOut);
  const q = params.toString();
  return q ? `/properties/${id}?${q}` : `/properties/${id}`;
}

function CardImagePlaceholder({ title }: { title: string }): React.JSX.Element {
  return (
    <div
      aria-label={`Foto placeholder ${title}`}
      className="w-full h-full bg-gray-100 flex flex-col items-center justify-center text-gray-400 gap-2"
    >
      <Building className="w-10 h-10 text-gray-300" />
      <span className="text-xs font-medium">Foto Belum Tersedia</span>
    </div>
  );
}

function CardImageBadge({ categoryName }: { categoryName: string }): React.JSX.Element {
  return (
    <span className="absolute top-3 left-3 z-10 bg-white/90 backdrop-blur-sm text-gray-800 font-semibold text-xs px-2.5 py-1 rounded-full shadow-sm border border-white/50">
      {categoryName}
    </span>
  );
}

function CardImageContent({ coverImage, title }: { coverImage: string | null; title: string }): React.JSX.Element {
  if (!coverImage) return <CardImagePlaceholder title={title} />;
  return (
    <img
      src={coverImage}
      alt={title}
      loading="lazy"
      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
    />
  );
}

type ImgContainerProps = { coverImage: string | null; title: string; categoryName: string };

function CardImageContainer({ coverImage, title, categoryName }: ImgContainerProps): React.JSX.Element {
  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
      <CardImageBadge categoryName={categoryName} />
      <CardImageContent coverImage={coverImage} title={title} />
    </div>
  );
}

function NewRatingBadge(): React.JSX.Element {
  return (
    <span className="text-[11px] font-semibold text-primary-700 bg-primary-50 px-2 py-0.5 rounded-md border border-primary-200">
      Baru
    </span>
  );
}

function RatingDisplay({ rating, count }: { rating: number; count: number }): React.JSX.Element {
  if (count <= 0) return <NewRatingBadge />;
  return (
    <div className="flex items-center gap-1 text-xs font-semibold text-gray-800">
      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
      <span>{rating.toFixed(1)}</span>
      <span className="text-gray-400 font-normal">({count})</span>
    </div>
  );
}

function TotalStayText({ total, nights }: { total: number; nights: number }): React.JSX.Element {
  if (nights > 1) {
    return <span className="text-xs text-gray-500 mt-0.5 font-normal">Total {formatRupiah(total)} untuk {nights} malam</span>;
  }
  return <span className="text-xs text-gray-400 mt-0.5 font-normal">Termasuk pajak & biaya</span>;
}

type PricingProps = { rate: number; total: number; nights: number };

function PricingDetails({ rate, total, nights }: PricingProps): React.JSX.Element {
  return (
    <div className="mt-3 pt-3 border-t border-gray-100 flex flex-col">
      <span className="text-[11px] font-medium text-gray-500 mb-0.5">Mulai dari</span>
      <div className="flex items-baseline gap-1">
        <span className="text-lg font-black text-gray-900">{formatRupiah(rate)}</span>
        <span className="text-xs text-gray-500 font-medium">/ malam</span>
      </div>
      <TotalStayText total={total} nights={nights} />
    </div>
  );
}

function PropertyHeader({ city, rating, count }: { city: string; rating: number; count: number }): React.JSX.Element {
  return (
    <div className="flex items-center justify-between gap-2 mb-1.5">
      <span className="text-xs font-medium text-gray-500 flex items-center gap-1 truncate">
        <MapPin className="w-3.5 h-3.5 text-primary-600 shrink-0" />
        {city}
      </span>
      <RatingDisplay rating={rating} count={count} />
    </div>
  );
}

function PropertyCardBody({ property }: { property: CatalogPropertyItem }): React.JSX.Element {
  const { title, city, averageRating, totalReviews, pricing } = property;
  return (
    <div className="p-4 flex-1 flex flex-col justify-between">
      <div>
        <PropertyHeader city={city} rating={averageRating} count={totalReviews} />
        <h3 className="font-bold text-gray-900 text-base leading-snug group-hover:text-primary-600 transition-colors line-clamp-2">
          {title}
        </h3>
      </div>
      <PricingDetails rate={pricing.averageNightRate} total={pricing.totalStayPrice} nights={pricing.totalNights} />
    </div>
  );
}

export function PropertyCard({ property, checkIn, checkOut, className = '' }: PropertyCardProps): React.JSX.Element {
  const linkUrl = buildPropertyUrl(property.id, checkIn, checkOut);
  return (
    <Link
      to={linkUrl}
      aria-label={`Lihat detail ${property.title}`}
      className={`bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col ${className}`}
    >
      <CardImageContainer coverImage={property.coverImage} title={property.title} categoryName={property.category.name || 'Penginapan'} />
      <PropertyCardBody property={property} />
    </Link>
  );
}
