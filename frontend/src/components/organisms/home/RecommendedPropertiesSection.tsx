import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, LucideIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { propertyApi } from '../../../modules/property/services/property.api';
import { CatalogQueryParams } from '../../../modules/property/property.types';
import { PropertyCard } from '../PropertyCard';

interface RecommendedSectionProps {
  title: string;
  subtitle: string;
  badgeText?: string;
  badgeIcon?: LucideIcon;
  queryParams: CatalogQueryParams;
  viewAllUrl?: string;
}

function SectionSkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm animate-pulse flex flex-col">
      <div className="aspect-[4/3] w-full bg-gray-200" />
      <div className="p-4 space-y-2.5">
        <div className="h-4 bg-gray-200 rounded w-1/3" />
        <div className="h-5 bg-gray-200 rounded w-3/4" />
        <div className="pt-2 border-t border-gray-100 h-6 bg-gray-200 rounded w-2/5" />
      </div>
    </div>
  );
}

function SectionLoadingGrid() {
  const items = Array.from({ length: 4 });
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {items.map((_, i) => (
        <SectionSkeletonCard key={i} />
      ))}
    </div>
  );
}

function SectionHeader({
  title,
  subtitle,
  badgeText,
  badgeIcon: BadgeIcon,
  viewAllUrl,
}: {
  title: string;
  subtitle: string;
  badgeText?: string;
  badgeIcon?: LucideIcon;
  viewAllUrl: string;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
      <div>
        {badgeText && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary-50 text-primary-700 border border-primary-200 mb-2">
            {BadgeIcon && <BadgeIcon className="w-3.5 h-3.5 text-primary-600" />}
            {badgeText}
          </span>
        )}
        <h2 className="text-xl sm:text-2xl font-black text-gray-900">{title}</h2>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">{subtitle}</p>
      </div>
      <Link
        to={viewAllUrl}
        className="inline-flex items-center gap-1 text-sm font-bold text-primary-600 hover:text-primary-700 transition-colors shrink-0 group"
      >
        <span>Lihat Semua</span>
        <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
      </Link>
    </div>
  );
}

export function RecommendedPropertiesSection({
  title,
  subtitle,
  badgeText,
  badgeIcon,
  queryParams,
  viewAllUrl = '/search',
}: RecommendedSectionProps): React.JSX.Element | null {
  const { data, isLoading } = useQuery({
    queryKey: ['recommended-section', queryParams],
    queryFn: () => propertyApi.getCatalog(queryParams),
  });

  const properties = data?.data || [];
  if (!isLoading && properties.length === 0) return null;

  return (
    <section aria-label={title} className="my-10 sm:my-14">
      <SectionHeader
        title={title}
        subtitle={subtitle}
        badgeText={badgeText}
        badgeIcon={badgeIcon}
        viewAllUrl={viewAllUrl}
      />
      {isLoading ? (
        <SectionLoadingGrid />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {properties.slice(0, 4).map((prop) => (
            <PropertyCard key={prop.id} property={prop} />
          ))}
        </div>
      )}
    </section>
  );
}
