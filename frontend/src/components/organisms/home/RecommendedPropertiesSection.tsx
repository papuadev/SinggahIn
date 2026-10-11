import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, LucideIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { propertyApi } from '../../../modules/property/services/property.api';
import { CatalogQueryParams, CatalogPropertyItem } from '../../../modules/property/property.types';
import { PropertyCard } from '../PropertyCard';

export interface RecommendedSectionProps {
  title: string;
  subtitle: string;
  badgeText?: string;
  badgeIcon?: LucideIcon;
  variant?: 'default' | 'highlighted';
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

function SectionBadge({ text, icon: Icon, isHighlighted }: { text?: string; icon?: LucideIcon; isHighlighted?: boolean }) {
  if (!text) return null;
  if (!isHighlighted) {
    return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary-50 text-primary-700 border border-primary-200 mb-2">{Icon && <Icon className="w-3.5 h-3.5 text-primary-600" />}{text}</span>;
  }
  return (
    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-slate-800/80 backdrop-blur-md text-slate-100 border border-slate-700/80 shadow-xs mb-3">
      <span className="flex items-center justify-center w-4 h-4 rounded-full bg-amber-400/20 text-amber-300 shrink-0"><Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" /></span>
      <span>{text}</span><span className="inline-block w-1 h-1 rounded-full bg-slate-500" /><span className="text-amber-300 font-semibold text-[11px]">Rating 4.8+</span>
    </div>
  );
}

function SectionHeaderTitle({ title, isHighlighted }: { title: string; isHighlighted?: boolean }) {
  const cls = isHighlighted
    ? 'text-2xl sm:text-3xl font-black tracking-tight text-white'
    : 'text-xl sm:text-2xl font-black text-gray-900';
  return <h2 className={cls}>{title}</h2>;
}

type HeaderProps = {
  title: string; subtitle: string; badgeText?: string; badgeIcon?: LucideIcon; viewAllUrl: string; isHighlighted?: boolean;
};

function SectionHeader(p: HeaderProps) {
  const btnCls = p.isHighlighted ? 'px-4 py-2 bg-slate-800/90 hover:bg-slate-700 text-white border border-slate-700 shadow-xs' : 'text-primary-600 hover:text-primary-700';
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 relative z-10">
      <div>
        <SectionBadge text={p.badgeText} icon={p.badgeIcon} isHighlighted={p.isHighlighted} />
        <SectionHeaderTitle title={p.title} isHighlighted={p.isHighlighted} />
        <p className={`text-xs sm:text-sm mt-1 ${p.isHighlighted ? 'text-slate-300' : 'text-gray-600'}`}>{p.subtitle}</p>
      </div>
      <Link to={p.viewAllUrl} className={`inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold rounded-full transition-all shrink-0 group ${btnCls}`}>
        <span>Lihat Semua</span><ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
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

function AmbientGlowOrbs() {
  return (
    <>
      <div className="absolute -top-20 -left-20 w-80 h-80 bg-sky-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-indigo-500/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/3 w-72 h-72 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />
    </>
  );
}

export function RecommendedPropertiesSection(props: RecommendedSectionProps): React.JSX.Element | null {
  const { properties, isLoading } = useSectionData(props.queryParams);
  if (!isLoading && properties.length === 0 && (!props.showEmptyIfFiltered || !props.queryParams.category)) return null;
  const isHigh = props.variant === 'highlighted';
  const secCls = isHigh
    ? 'relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen my-10 sm:my-14 py-12 sm:py-16 bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950/90 border-y border-slate-800 shadow-2xl overflow-hidden'
    : 'my-10 sm:my-14';
  return (
    <section aria-label={props.title} className={secCls}>
      {isHigh && <AmbientGlowOrbs />}
      <div className={isHigh ? 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10' : ''}>
        <SectionHeader {...props} viewAllUrl={props.viewAllUrl || '/search'} isHighlighted={isHigh} />
        <SectionContent isLoading={isLoading} properties={properties} showEmpty={props.showEmptyIfFiltered} category={props.queryParams.category} onReset={props.onResetCategory} />
      </div>
    </section>
  );
}
