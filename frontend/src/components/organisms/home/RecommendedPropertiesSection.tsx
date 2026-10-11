import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, ChevronLeft, ChevronRight, LucideIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { propertyApi } from '../../../modules/property/services/property.api';
import { CatalogQueryParams, CatalogPropertyItem } from '../../../modules/property/property.types';
import { PropertyCard } from '../PropertyCard';

export interface RecommendedSectionProps {
  title: string; subtitle: string; badgeText?: string; badgeIcon?: LucideIcon;
  variant?: 'default' | 'highlighted'; queryParams: CatalogQueryParams;
  viewAllUrl?: string; showEmptyIfFiltered?: boolean; onResetCategory?: () => void;
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

function SectionLoadingRow() {
  const items = Array.from({ length: 4 });
  return (
    <div className="flex gap-4 sm:gap-5 overflow-hidden pb-4 pt-1 -mx-4 px-4 sm:mx-0 sm:px-0">
      {items.map((_, i) => (
        <div key={i} className="shrink-0 w-[270px] sm:w-[300px] lg:w-[320px]">
          <SectionSkeletonCard />
        </div>
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
      <span>{text}</span><span className="inline-block w-1 h-1 rounded-full bg-slate-500" /><span className="text-amber-300 font-semibold text-xs">Rating 4.8+</span>
    </div>
  );
}

function SectionHeaderTitle({ title, isHighlighted }: { title: string; isHighlighted?: boolean }) {
  const cls = isHighlighted
    ? 'text-2xl sm:text-3xl font-black tracking-tight text-white'
    : 'text-xl sm:text-2xl font-black text-gray-900';
  return <h2 className={cls}>{title}</h2>;
}

function SectionNavButtons({ onLeft, onRight, isHighlighted }: { onLeft: () => void; onRight: () => void; isHighlighted?: boolean }) {
  const btnCls = isHighlighted
    ? 'p-2 rounded-full border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 transition-colors'
    : 'p-2 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 transition-colors shadow-xs';
  return (
    <div className="hidden sm:flex items-center gap-1.5">
      <button type="button" onClick={onLeft} aria-label="Geser ke kiri" className={btnCls}>
        <ChevronLeft className="w-4 h-4" />
      </button>
      <button type="button" onClick={onRight} aria-label="Geser ke kanan" className={btnCls}>
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

type HeaderProps = {
  title: string; subtitle: string; badgeText?: string; badgeIcon?: LucideIcon; viewAllUrl: string; isHighlighted?: boolean;
};

function ViewAllLink({ url, isHigh }: { url: string; isHigh?: boolean }) {
  const cls = isHigh
    ? 'px-4 py-2 bg-slate-800/90 hover:bg-slate-700 text-white border border-slate-700 shadow-xs'
    : 'text-primary-600 hover:text-primary-700';
  return (
    <Link to={url} className={`inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold rounded-full transition-all group ${cls}`}>
      <span>Lihat Semua</span>
      <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
    </Link>
  );
}

function SectionHeader(p: HeaderProps & { onLeft: () => void; onRight: () => void }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 relative z-10">
      <div>
        <SectionBadge text={p.badgeText} icon={p.badgeIcon} isHighlighted={p.isHighlighted} />
        <SectionHeaderTitle title={p.title} isHighlighted={p.isHighlighted} />
        <p className={`text-xs sm:text-sm mt-1 ${p.isHighlighted ? 'text-slate-300' : 'text-gray-600'}`}>{p.subtitle}</p>
      </div>
      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
        <SectionNavButtons onLeft={p.onLeft} onRight={p.onRight} isHighlighted={p.isHighlighted} />
        <ViewAllLink url={p.viewAllUrl} isHigh={p.isHighlighted} />
      </div>
    </div>
  );
}

function EmptyCategoryState({ category, onReset }: { category?: string; onReset?: () => void }) {
  return (
    <div className="text-center py-10 bg-gray-50 rounded-2xl border border-gray-100 p-6">
      <p className="text-gray-600 text-sm font-medium mb-3">
        Belum ada properti untuk kategori <span className="font-semibold capitalize">"{category}"</span>.
      </p>
      {onReset && (
        <button type="button" onClick={onReset} className="text-xs font-bold text-primary-600 hover:text-primary-700 underline">
          Tampilkan Semua Penginapan
        </button>
      )}
    </div>
  );
}

function SectionScrollRow({ properties, scrollRef, isHigh }: { properties: CatalogPropertyItem[]; scrollRef: React.RefObject<HTMLDivElement>; isHigh?: boolean }) {
  const scrollCls = isHigh ? 'scrollbar-themed-dark' : 'scrollbar-themed-light';
  return (
    <div ref={scrollRef} className={`flex gap-4 sm:gap-5 overflow-x-auto pb-4 pt-1 scroll-smooth snap-x snap-mandatory focus:outline-none -mx-4 px-4 sm:mx-0 sm:px-0 ${scrollCls}`}>
      {properties.map((item) => (
        <div key={item.id} className="shrink-0 w-[270px] sm:w-[300px] lg:w-[320px] snap-start">
          <PropertyCard property={item} />
        </div>
      ))}
    </div>
  );
}

type ContentProps = {
  isLoading: boolean; properties: CatalogPropertyItem[];
  showEmpty?: boolean; category?: string; onReset?: () => void;
  scrollRef: React.RefObject<HTMLDivElement>; isHighlighted?: boolean;
};

function SectionContent(p: ContentProps) {
  if (p.isLoading) return <SectionLoadingRow />;
  if (p.properties.length === 0 && p.showEmpty && p.category) {
    return <EmptyCategoryState category={p.category} onReset={p.onReset} />;
  }
  return <SectionScrollRow properties={p.properties} scrollRef={p.scrollRef} isHigh={p.isHighlighted} />;
}

function useSectionData(params: CatalogQueryParams) {
  const { data, isLoading } = useQuery({
    queryKey: ['recommended-section', params],
    queryFn: () => propertyApi.getCatalog(params),
  });
  return { properties: data?.data || [], isLoading };
}

function useHorizontalScroll() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scroll = (offset: number) => {
    scrollRef.current?.scrollBy({ left: offset, behavior: 'smooth' });
  };
  return { scrollRef, scrollLeft: () => scroll(-340), scrollRight: () => scroll(340) };
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

function getSectionClass(isHigh?: boolean) {
  return isHigh
    ? 'relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen my-10 sm:my-14 py-12 sm:py-16 bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950/90 border-y border-slate-800 shadow-2xl overflow-hidden'
    : 'my-10 sm:my-14';
}

export function RecommendedPropertiesSection(props: RecommendedSectionProps): React.JSX.Element | null {
  const { properties, isLoading } = useSectionData(props.queryParams);
  const { scrollRef, scrollLeft, scrollRight } = useHorizontalScroll();
  if (!isLoading && properties.length === 0 && (!props.showEmptyIfFiltered || !props.queryParams.category)) return null;
  const isHigh = props.variant === 'highlighted';
  return (
    <section aria-label={props.title} className={getSectionClass(isHigh)}>
      {isHigh && <AmbientGlowOrbs />}
      <div className={isHigh ? 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10' : ''}>
        <SectionHeader {...props} onLeft={scrollLeft} onRight={scrollRight} viewAllUrl={props.viewAllUrl || '/search'} isHighlighted={isHigh} />
        <SectionContent isLoading={isLoading} properties={properties} showEmpty={props.showEmptyIfFiltered} category={props.queryParams.category} onReset={props.onResetCategory} scrollRef={scrollRef} isHighlighted={isHigh} />
      </div>
    </section>
  );
}
