import React from 'react';
import { ChevronLeft, ChevronRight, LucideIcon } from 'lucide-react';

interface CatalogPaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (newPage: number) => void;
}

type PageBtnProps = { p: number; current: number; onSelect: (p: number) => void };

function PageButton({ p, current, onSelect }: PageBtnProps) {
  const isActive = p === current;
  const cls = isActive
    ? 'bg-primary-600 text-white font-bold shadow-sm'
    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50';
  return (
    <button
      type="button"
      onClick={() => onSelect(p)}
      aria-label={`Halaman ${p}`}
      aria-current={isActive ? 'page' : undefined}
      className={`w-9 h-9 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center transition-all ${cls}`}
    >
      {p}
    </button>
  );
}

function PageNumbers({ current, total, onSelect }: { current: number; total: number; onSelect: (p: number) => void }) {
  const pages = Array.from({ length: total }, (_, i) => i + 1);
  return (
    <div className="flex items-center gap-1">
      {pages.map((p) => (
        <PageButton key={p} p={p} current={current} onSelect={onSelect} />
      ))}
    </div>
  );
}

type NavBtnProps = { disabled: boolean; onClick: () => void; label: string; icon: LucideIcon; iconRight?: boolean };

function NavButton({ disabled, onClick, label, icon: Icon, iconRight }: NavBtnProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={label}
      className="h-9 px-3 rounded-xl border border-gray-200 bg-white text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white flex items-center gap-1 transition-colors"
    >
      {!iconRight && <Icon className="w-4 h-4" />}
      <span className="hidden sm:inline">{label}</span>
      {iconRight && <Icon className="w-4 h-4" />}
    </button>
  );
}

function PaginationNavControls({ page, totalPages, onPageChange }: { page: number; totalPages: number; onPageChange: (p: number) => void }) {
  return (
    <div className="flex items-center gap-2">
      <NavButton disabled={page <= 1} onClick={() => onPageChange(page - 1)} label="Sebelumnya" icon={ChevronLeft} />
      <PageNumbers current={page} total={totalPages} onSelect={onPageChange} />
      <NavButton disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} label="Berikutnya" icon={ChevronRight} iconRight />
    </div>
  );
}

export function CatalogPagination({ page, totalPages, totalItems, onPageChange }: CatalogPaginationProps): React.JSX.Element | null {
  if (totalPages <= 1) return null;
  return (
    <nav aria-label="Navigasi halaman properti" className="mt-10 pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
      <span className="text-xs sm:text-sm text-gray-500">
        Menampilkan halaman <strong className="text-gray-900">{page}</strong> dari{' '}
        <strong className="text-gray-900">{totalPages}</strong> ({totalItems} total properti)
      </span>
      <PaginationNavControls page={page} totalPages={totalPages} onPageChange={onPageChange} />
    </nav>
  );
}
