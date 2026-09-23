import React from 'react';
import { Home, AlertCircle, RefreshCw } from 'lucide-react';
import { CatalogPropertyItem } from '../../../modules/property/property.types';
import { PropertyCard } from '../PropertyCard';

interface CatalogPropertyGridProps {
  properties: CatalogPropertyItem[];
  isLoading: boolean;
  isError: boolean;
  checkIn?: string;
  checkOut?: string;
  onResetFilters?: () => void;
}

function SkeletonCard() {
  return (
    <div
      aria-label="Memuat penginapan"
      className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm animate-pulse flex flex-col"
    >
      <div className="aspect-[4/3] w-full bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-4 bg-gray-200 rounded w-1/3" />
          <div className="h-4 bg-gray-200 rounded w-1/6" />
        </div>
        <div className="h-5 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="pt-3 border-t border-gray-100 flex items-baseline justify-between">
          <div className="h-6 bg-gray-200 rounded w-2/5" />
        </div>
      </div>
    </div>
  );
}

function GridLoadingState() {
  const skeletons = Array.from({ length: 8 });
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {skeletons.map((_, idx) => (
        <SkeletonCard key={idx} />
      ))}
    </div>
  );
}

function EmptyState({ onReset }: { onReset?: () => void }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center max-w-lg mx-auto shadow-sm my-8 flex flex-col items-center">
      <div className="w-16 h-16 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center mb-4">
        <Home className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">Tidak Ada Penginapan Ditemukan</h3>
      <p className="text-sm text-gray-500 mb-6">
        Coba ubah kata kunci tujuan, pilih tanggal lain, atau sesuaikan filter kategori Anda.
      </p>
      {onReset && (
        <button
          type="button"
          onClick={onReset}
          className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold rounded-xl shadow-md transition-colors"
        >
          Reset Filter Pencarian
        </button>
      )}
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center max-w-md mx-auto my-8">
      <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
      <h3 className="font-bold text-red-800 mb-1">Gagal Memuat Penginapan</h3>
      <p className="text-xs text-red-600 mb-4">Terjadi kesalahan pada server saat memuat katalog properti.</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold shadow-sm hover:bg-red-700 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Coba Lagi
        </button>
      )}
    </div>
  );
}

export function CatalogPropertyGrid({
  properties,
  isLoading,
  isError,
  checkIn,
  checkOut,
  onResetFilters,
}: CatalogPropertyGridProps): React.JSX.Element {
  if (isLoading) return <GridLoadingState />;
  if (isError) return <ErrorState onRetry={onResetFilters} />;
  if (properties.length === 0) return <EmptyState onReset={onResetFilters} />;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {properties.map((prop) => (
        <PropertyCard
          key={prop.id}
          property={prop}
          checkIn={checkIn}
          checkOut={checkOut}
        />
      ))}
    </div>
  );
}
