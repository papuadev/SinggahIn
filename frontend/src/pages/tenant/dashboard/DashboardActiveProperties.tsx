import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Star, MapPin } from 'lucide-react';
import { Property } from '../../../modules/property/property.types';

function PropertyCover({ cover, title }: { cover?: string | null; title: string }) {
  if (cover) {
    return <img src={cover} alt={title} className="w-full h-full object-cover" />;
  }
  return (
    <div className="w-full h-full flex items-center justify-center bg-primary-50 text-primary-600">
      <Building2 className="w-6 h-6" />
    </div>
  );
}

function PropertyMeta({ p }: { p: Property }) {
  const roomsCount = p.rooms?.length || 0;
  return (
    <div className="min-w-0">
      <p className="text-sm font-bold text-gray-900 truncate">{p.title}</p>
      <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
        <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
        <span className="truncate">{p.city}</span>
        <span>·</span>
        <span>{roomsCount} tipe kamar</span>
      </p>
    </div>
  );
}

function PropertyRatingBadge({ rating }: { rating?: number }) {
  if (rating && rating > 0) {
    return (
      <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
        <span>{rating.toFixed(1)}</span>
      </span>
    );
  }
  return <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-0.5 rounded-full font-medium whitespace-nowrap">Belum ada ulasan</span>;
}

function PropertyActions({ id, rating }: { id: string; rating?: number }) {
  return (
    <div className="flex items-center gap-3 shrink-0">
      <PropertyRatingBadge rating={rating} />
      <Link to={`/tenant/properties/${id}/edit`} className="text-xs font-semibold text-primary-600 hover:text-primary-700 px-3 py-1.5 rounded-lg hover:bg-primary-50 transition-colors">
        Kelola
      </Link>
    </div>
  );
}

function PropertyCard({ p }: { p: Property }): React.JSX.Element {
  const cover = p.coverImage || (p.images && p.images[0]?.imageUrl);
  return (
    <div className="p-4 bg-gray-50/60 hover:bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between gap-4 transition-all">
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-200 shrink-0">
          <PropertyCover cover={cover} title={p.title} />
        </div>
        <PropertyMeta p={p} />
      </div>
      <PropertyActions id={p.id} rating={p.averageRating} />
    </div>
  );
}

function SectionHeader() {
  return (
    <div className="flex items-center justify-between mb-4">
      <div>
        <h3 className="text-base sm:text-lg font-bold text-gray-800">Properti aktif</h3>
        <p className="text-xs text-gray-400 mt-0.5">Performa properti terbaikmu</p>
      </div>
      <Link to="/tenant/properties" className="text-xs font-semibold text-primary-600 hover:text-primary-700 transition-colors">
        Kelola
      </Link>
    </div>
  );
}

function PropertyCardList({ properties }: { properties: Property[] }) {
  if (properties.length === 0) {
    return <p className="text-center py-6 text-xs sm:text-sm text-gray-400">Belum ada properti aktif.</p>;
  }
  return <div className="space-y-3">{properties.map((p) => <PropertyCard key={p.id} p={p} />)}</div>;
}

export function DashboardActiveProperties({ properties }: { properties: Property[] }): React.JSX.Element {
  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs mb-6">
      <SectionHeader />
      <PropertyCardList properties={properties.slice(0, 3)} />
    </div>
  );
}
