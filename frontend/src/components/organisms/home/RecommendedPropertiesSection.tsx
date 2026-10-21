import React, { useRef, useState } from 'react';
import { LucideIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { propertyApi } from '../../../modules/property/services/property.api';
import { CatalogQueryParams, CatalogPropertyItem } from '../../../modules/property/property.types';
import { PropertyCard } from '../PropertyCard';
import { SectionHeader } from './SectionHeader';

export interface RecommendedSectionProps {
  id?: string;
  title: string; subtitle: string; badgeText?: string; badgeIcon?: LucideIcon;
  variant?: 'default' | 'highlighted'; queryParams: CatalogQueryParams;
  viewAllUrl?: string; showEmptyIfFiltered?: boolean; onResetCategory?: () => void;
  isLoading?: boolean;
}

function SkeletonBody({ isHigh }: { isHigh?: boolean }) {
  const shimmer = isHigh ? 'bg-slate-700/60' : 'bg-gray-200';
  const border = isHigh ? 'border-slate-700/60' : 'border-gray-100';
  return (
    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
      <div className="space-y-2">
        <div className="flex justify-between"><div className={`h-3.5 ${shimmer} rounded w-1/3`} /><div className={`h-3.5 ${shimmer} rounded w-10`} /></div>
        <div className={`h-4 ${shimmer} rounded w-4/5`} />
      </div>
      <div className={`pt-3 border-t ${border} space-y-1.5`}>
        <div className={`h-3 ${shimmer} rounded w-1/4`} /><div className={`h-5 ${shimmer} rounded w-1/2`} />
      </div>
    </div>
  );
}

function SectionSkeletonCard({ isHigh }: { isHigh?: boolean }) {
  const container = isHigh ? 'bg-slate-800/80 border-slate-700/80' : 'bg-white border-gray-100 shadow-sm';
  const img = isHigh ? 'bg-slate-700/70' : 'bg-gray-200';
  return (
    <div className={`${container} rounded-2xl border overflow-hidden animate-pulse flex flex-col h-full`}>
      <div className={`aspect-[4/3] w-full ${img}`} />
      <SkeletonBody isHigh={isHigh} />
    </div>
  );
}

function SectionLoadingRow({ isHigh }: { isHigh?: boolean }) {
  return (
    <div className="flex gap-4 sm:gap-5 overflow-hidden pb-4 pt-1 -mx-4 px-4 sm:mx-0 sm:px-0">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="shrink-0 w-[270px] sm:w-[300px] lg:w-[320px]">
          <SectionSkeletonCard isHigh={isHigh} />
        </div>
      ))}
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

function ScrollIndicator({ progress, isHigh }: { progress: number; isHigh?: boolean }) {
  const track = isHigh ? 'bg-white/15' : 'bg-gray-200';
  const bar = isHigh ? 'bg-white/80' : 'bg-primary-600';
  return (
    <div className="flex justify-center mt-3" aria-hidden="true">
      <div className={`relative w-24 sm:w-28 h-1 rounded-full overflow-hidden ${track}`}>
        <div
          className={`absolute top-0 bottom-0 left-0 w-1/3 rounded-full transition-transform duration-100 ${bar}`}
          style={{ transform: `translateX(${progress * 200}%)` }}
        />
      </div>
    </div>
  );
}

type ScrollRowProps = {
  properties: CatalogPropertyItem[]; scrollRef: React.RefObject<HTMLDivElement>;
  isHigh?: boolean; onScroll: () => void; progress: number;
};

function SectionScrollRow(p: ScrollRowProps) {
  const showIndicator = p.properties.length > 3;
  return (
    <div>
      <div ref={p.scrollRef} onScroll={p.onScroll} className="flex gap-4 sm:gap-5 overflow-x-auto pb-3 pt-1 scroll-smooth snap-x snap-mandatory focus:outline-none -mx-4 px-4 sm:mx-0 sm:px-0 no-scrollbar">
        {p.properties.map((item) => (
          <div key={item.id} className="shrink-0 w-[270px] sm:w-[300px] lg:w-[320px] snap-start flex flex-col">
            <PropertyCard property={item} className="h-full" />
          </div>
        ))}
      </div>
      {showIndicator && <ScrollIndicator progress={p.progress} isHigh={p.isHigh} />}
    </div>
  );
}

type ContentProps = {
  isLoading: boolean; properties: CatalogPropertyItem[];
  showEmpty?: boolean; category?: string; onReset?: () => void;
  scrollRef: React.RefObject<HTMLDivElement>; isHighlighted?: boolean;
  onScroll: () => void; progress: number;
};

function SectionContent(p: ContentProps) {
  if (p.isLoading) return <SectionLoadingRow isHigh={p.isHighlighted} />;
  if (p.properties.length === 0 && p.showEmpty && p.category) {
    return <EmptyCategoryState category={p.category} onReset={p.onReset} />;
  }
  return <SectionScrollRow properties={p.properties} scrollRef={p.scrollRef} isHigh={p.isHighlighted} onScroll={p.onScroll} progress={p.progress} />;
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
  const [progress, setProgress] = useState(0);
  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    if (max <= 0) return setProgress(0);
    const isEnd = max - el.scrollLeft <= 4;
    setProgress(isEnd ? 1 : Math.min(1, Math.max(0, el.scrollLeft / max)));
  };
  const scroll = (offset: number) => scrollRef.current?.scrollBy({ left: offset, behavior: 'smooth' });
  return { scrollRef, progress, onScroll, scrollLeft: () => scroll(-340), scrollRight: () => scroll(340) };
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

function SectionWrapper({ id, title, isHigh, children }: { id?: string; title: string; isHigh: boolean; children: React.ReactNode }) {
  return (
    <section id={id} aria-label={title} className={`${getSectionClass(isHigh)} ${id ? 'scroll-mt-28' : ''}`}>
      {isHigh && <AmbientGlowOrbs />}
      <div className={isHigh ? 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10' : ''}>{children}</div>
    </section>
  );
}

export function RecommendedPropertiesSection(props: RecommendedSectionProps): React.JSX.Element | null {
  const { properties, isLoading: queryLoading } = useSectionData(props.queryParams);
  const isLoading = Boolean(props.isLoading || queryLoading);
  const { scrollRef, scrollLeft, scrollRight, onScroll, progress } = useHorizontalScroll();
  const isHigh = props.variant === 'highlighted';
  if (!isLoading && properties.length === 0 && (!props.showEmptyIfFiltered || !props.queryParams.category)) return null;
  return (
    <SectionWrapper id={props.id} title={props.title} isHigh={isHigh}>
      <SectionHeader {...props} onLeft={scrollLeft} onRight={scrollRight} viewAllUrl={props.viewAllUrl || '/search'} isHighlighted={isHigh} />
      <SectionContent isLoading={isLoading} properties={properties} showEmpty={props.showEmptyIfFiltered} category={props.queryParams.category} onReset={props.onResetCategory} scrollRef={scrollRef} isHighlighted={isHigh} onScroll={onScroll} progress={progress} />
    </SectionWrapper>
  );
}
