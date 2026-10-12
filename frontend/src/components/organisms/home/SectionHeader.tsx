import { Link } from 'react-router-dom';
import { ArrowRight, Star, ChevronLeft, ChevronRight, LucideIcon } from 'lucide-react';

export interface HeaderProps {
  title: string;
  subtitle: string;
  badgeText?: string;
  badgeIcon?: LucideIcon;
  viewAllUrl: string;
  isHighlighted?: boolean;
  onLeft: () => void;
  onRight: () => void;
}

function DefaultBadge({ text, icon: Icon }: { text: string; icon?: LucideIcon }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary-50 text-primary-700 border border-primary-200 mb-2">
      {Icon && <Icon className="w-3.5 h-3.5 text-primary-600" />}{text}
    </span>
  );
}

function HighlightedBadge({ text }: { text: string }) {
  return (
    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-slate-800/80 backdrop-blur-md text-slate-100 border border-slate-700/80 shadow-xs mb-3">
      <span className="flex items-center justify-center w-4 h-4 rounded-full bg-amber-400/20 text-amber-300 shrink-0">
        <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
      </span>
      <span>{text}</span>
      <span className="inline-block w-1 h-1 rounded-full bg-slate-500" />
      <span className="text-amber-300 font-semibold text-xs">Rating 4.8+</span>
    </div>
  );
}

function SectionBadge({ text, icon, isHighlighted }: { text?: string; icon?: LucideIcon; isHighlighted?: boolean }) {
  if (!text) return null;
  return isHighlighted ? <HighlightedBadge text={text} /> : <DefaultBadge text={text} icon={icon} />;
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

export function SectionHeader(p: HeaderProps) {
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
