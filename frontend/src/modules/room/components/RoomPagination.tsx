import React from 'react';
import { ChevronLeft, ChevronRight, LucideIcon } from 'lucide-react';

export interface RoomPaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (newPage: number) => void;
}

type PageBtnProps = { p: number; current: number; onSelect: (p: number) => void };
type NavBtnProps = { disabled: boolean; onClick: () => void; label: string; icon: LucideIcon; iconRight?: boolean };
const NAV_CLS = 'h-8 px-2.5 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white flex items-center gap-1 transition-colors';

function PageButton({ p, current, onSelect }: PageBtnProps): React.JSX.Element {
  const isActive = p === current;
  const cls = isActive ? 'bg-primary-600 text-white font-bold shadow-sm' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50';
  return (
    <button
      type="button" onClick={() => onSelect(p)} aria-label={`Halaman ${p}`}
      aria-current={isActive ? 'page' : undefined}
      className={`w-8 h-8 rounded-lg text-xs font-semibold flex items-center justify-center transition-all ${cls}`}
    >
      {p}
    </button>
  );
}

function PageNumbers({ current, total, onSelect }: { current: number; total: number; onSelect: (p: number) => void }): React.JSX.Element {
  const pages = Array.from({ length: total }, (_, i) => i + 1);
  return (
    <div className="flex items-center gap-1">
      {pages.map((p) => <PageButton key={p} p={p} current={current} onSelect={onSelect} />)}
    </div>
  );
}

function NavButton({ disabled, onClick, label, icon: Icon, iconRight }: NavBtnProps): React.JSX.Element {
  return (
    <button type="button" disabled={disabled} onClick={onClick} aria-label={label} className={NAV_CLS}>
      {!iconRight && <Icon className="w-3.5 h-3.5" />}
      <span className="hidden sm:inline">{label}</span>
      {iconRight && <Icon className="w-3.5 h-3.5" />}
    </button>
  );
}

function PaginationNavControls({ page, totalPages, onPageChange }: { page: number; totalPages: number; onPageChange: (p: number) => void }): React.JSX.Element {
  return (
    <div className="flex items-center gap-1.5">
      <NavButton disabled={page <= 1} onClick={() => onPageChange(page - 1)} label="Sebelumnya" icon={ChevronLeft} />
      <PageNumbers current={page} total={totalPages} onSelect={onPageChange} />
      <NavButton disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} label="Berikutnya" icon={ChevronRight} iconRight />
    </div>
  );
}

function computeRange(page: number, pageSize: number, total: number) {
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  return { start, end };
}

function PaginationInfoText({ start, end, total }: { start: number; end: number; total: number }): React.JSX.Element {
  return (
    <span className="text-xs text-gray-500">
      Menampilkan <strong className="text-gray-900">{start} - {end}</strong> dari <strong className="text-gray-900">{total}</strong> tipe kamar
    </span>
  );
}

export function RoomPagination({ page, totalPages, totalItems, pageSize, onPageChange }: RoomPaginationProps): React.JSX.Element | null {
  if (totalPages <= 1) return null;
  const { start, end } = computeRange(page, pageSize, totalItems);
  return (
    <nav aria-label="Navigasi halaman tipe kamar" className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
      <PaginationInfoText start={start} end={end} total={totalItems} />
      <PaginationNavControls page={page} totalPages={totalPages} onPageChange={onPageChange} />
    </nav>
  );
}
