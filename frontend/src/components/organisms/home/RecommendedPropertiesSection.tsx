import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, LucideIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { propertyApi } from '../../../modules/property/services/property.api';
import { CatalogQueryParams, CatalogPropertyItem } from '../../../modules/property/property.types';
import { PropertyCard } from '../PropertyCard';

export interface RecommendedSectionProps {
  title: string;
  subtitle: string;
  badgeText?: string;
  badgeIcon?: LucideIcon;
  queryParams: CatalogQueryParams;
  viewAllUrl?: string;
  showEmptyIfFiltered?: boolean;
  onResetCategory?: () => void;
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

function SectionBadge({ text, icon: Icon }: { text?: string; icon?: LucideIcon }) {
  if (!text) return null;
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary-50 text-primary-700 border border-primary-200 mb-2">
      {Icon && <Icon className="w-3.5 h-3.5 text-primary-600" />}
      {text}
    </span>
  );
}

type HeaderProps = {
  title: string; subtitle: string; badgeText?: string; badgeIcon?: LucideIcon; viewAllUrl: string;
};

function SectionHeader(p: HeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
      <div>
        <SectionBadge text={p.badgeText} icon={p.badgeIcon} />
        <h2 className="text-xl sm:text-2xl font-black text-gray-900">{p.title}</h2>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">{p.subtitle}</p>
      </div>
      <Link to={p.viewAllUrl} className="inline-flex items-center gap-1 text-sm font-bold text-primary-600 hover:text-primary-700 transition-colors shrink-0 group">
        <span>Lihat Semua</span>
        <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
      </Link>
    </div>
  );
}

function EmptyResetBtn({ onReset }: { onReset?: () => void }) {
  if (!onReset) return null;
  return (
    <button type="button" onClick={onReset} className="text-xs font-bold text-primary-600 hover:text-primary-700 underline">
      Tampilkan Semua Penginapan
    </button>
  );
}

function EmptyCategoryState({ category, onReset }: { category?: string; onReset?: () => void }) {
  return (
    <div className="text-center py-10 bg-gray-50 rounded-2xl border border-gray-100 p-6">
      <p className="text-gray-600 text-sm font-medium mb-3">
        Belum ada properti untuk kategori <span className="font-semibold capitalize">"{category}"</span>.
      </p>
      <EmptyResetBtn onReset={onReset} />
    </div>
  );
}

type ContentProps = {
  isLoading: boolean; properties: CatalogPropertyItem[];
  showEmpty?: boolean; category?: string; onReset?: () => void;
};

function SectionContent(p: ContentProps) {
  if (p.isLoading) return <SectionLoadingGrid />;
  if (p.properties.length === 0 && p.showEmpty && p.category) {
    return <EmptyCategoryState category={p.category} onReset={p.onReset} />;
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {p.properties.slice(0, 4).map((item) => (
        <PropertyCard key={item.id} property={item} />
      ))}
    </div>
  );
}

function useSectionData(params: CatalogQueryParams) {
  const { data, isLoading } = useQuery({
    queryKey: ['recommended-section', params],
    queryFn: () => propertyApi.getCatalog(params),
  });
  return { properties: data?.data || [], isLoading };
}

export function RecommendedPropertiesSection(props: RecommendedSectionProps): React.JSX.Element | null {
  const { properties, isLoading } = useSectionData(props.queryParams);
  const cat = props.queryParams.category;
  if (!isLoading && properties.length === 0 && (!props.showEmptyIfFiltered || !cat)) return null;

  return (
    <section aria-label={props.title} className="my-10 sm:my-14">
      <SectionHeader {...props} viewAllUrl={props.viewAllUrl || '/search'} />
      <SectionContent
        isLoading={isLoading} properties={properties}
        showEmpty={props.showEmptyIfFiltered} category={cat} onReset={props.onResetCategory}
      />
    </section>
  );
}
