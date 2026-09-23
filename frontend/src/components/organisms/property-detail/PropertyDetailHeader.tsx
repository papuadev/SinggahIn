import React, { useState } from 'react';
import { MapPin, Star, Share2, Check } from 'lucide-react';

export interface PropertyDetailHeaderProps {
  title: string;
  categoryName?: string;
  address: string;
  city: string;
  averageRating?: number;
  totalReviews?: number;
}

interface HeaderMetaProps {
  address: string;
  city: string;
  rating?: number;
  reviews?: number;
}

function useShareUrl() {
  const [copied, setCopied] = useState(false);
  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };
  return { copied, handleShare };
}

function ShareButton(): React.JSX.Element {
  const { copied, handleShare } = useShareUrl();
  return (
    <button type="button" onClick={handleShare} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 active:scale-95 transition-all shadow-sm" aria-label="Bagikan properti">
      {copied ? <Check className="w-3.5 h-3.5 text-primary-600" /> : <Share2 className="w-3.5 h-3.5 text-gray-500" />}
      <span className={copied ? 'text-primary-700' : ''}>{copied ? 'Tautan Disalin' : 'Bagikan'}</span>
    </button>
  );
}

function RatingBadge({ rating, reviews }: { rating?: number; reviews?: number }) {
  const hasRating = Boolean(rating && rating > 0);
  return (
    <div className="flex items-center gap-1.5 text-sm">
      <Star className={`w-4 h-4 ${hasRating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
      <span className="font-bold text-gray-900">{hasRating ? Number(rating).toFixed(1) : 'Baru'}</span>
      {reviews !== undefined && reviews > 0 ? (
        <span className="text-gray-500">({reviews} ulasan)</span>
      ) : (
        <span className="text-gray-400 text-xs">Belum ada ulasan</span>
      )}
    </div>
  );
}

function HeaderMetaRow({ address, city, rating, reviews }: HeaderMetaProps) {
  return (
    <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-sm text-gray-600">
      <RatingBadge rating={rating} reviews={reviews} />
      <span className="text-gray-300 hidden sm:inline">•</span>
      <div className="flex items-center gap-1">
        <MapPin className="w-4 h-4 text-primary-600 flex-shrink-0" />
        <span>{address}, {city}</span>
      </div>
    </div>
  );
}

function HeaderTopRow({ categoryName }: { categoryName?: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      {categoryName && (
        <span className="inline-block bg-primary-50 text-primary-700 font-semibold text-xs px-3 py-1 rounded-full border border-primary-100">
          {categoryName}
        </span>
      )}
      <ShareButton />
    </div>
  );
}

export function PropertyDetailHeader(props: PropertyDetailHeaderProps): React.JSX.Element {
  const { title, categoryName, address, city, averageRating, totalReviews } = props;
  return (
    <header className="flex flex-col gap-2 pb-4 border-b border-gray-100">
      <HeaderTopRow categoryName={categoryName} />
      <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">{title}</h1>
      <HeaderMetaRow address={address} city={city} rating={averageRating} reviews={totalReviews} />
    </header>
  );
}
