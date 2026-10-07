import React from 'react';
import { UploadCloud, Trash2, Star, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '../../../components/atoms/Button';
import { StagedImage } from '../property-gallery.types';

function StagedCoverBadge(): React.JSX.Element {
  return (
    <span className="absolute top-2 right-2 inline-flex items-center gap-1 text-[10px] font-semibold text-amber-800 bg-amber-100/90 px-2 py-0.5 rounded-md shadow-xs backdrop-blur-xs">
      <Star className="w-3 h-3 text-amber-600 fill-amber-500" /> Calon Sampul
    </span>
  );
}

interface StagedNavProps {
  index: number; total: number; disabled: boolean; onMove: (from: number, to: number) => void;
}

const stagedBtnCls = 'p-1 text-gray-500 hover:text-primary-600 hover:bg-gray-100 rounded disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed';

function StagedNavButtons({ index, total, disabled, onMove }: StagedNavProps): React.JSX.Element {
  return (
    <div className="flex items-center gap-1">
      <button type="button" onClick={() => onMove(index, index - 1)} disabled={disabled || index === 0} aria-label="Pindah ke kiri" className={stagedBtnCls}>
        <ArrowLeft className="w-4 h-4" />
      </button>
      <button type="button" onClick={() => onMove(index, index + 1)} disabled={disabled || index === total - 1} aria-label="Pindah ke kanan" className={stagedBtnCls}>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}

interface StagedActionsProps {
  index: number; total: number; disabled: boolean;
  onMove: (from: number, to: number) => void; onRemove: (id: string) => void; stagedId: string;
}

function StagedCardActions(p: StagedActionsProps): React.JSX.Element {
  return (
    <div className="flex items-center justify-between p-2 bg-white border-t border-gray-100">
      <StagedNavButtons index={p.index} total={p.total} disabled={p.disabled} onMove={p.onMove} />
      <button
        type="button" onClick={() => p.onRemove(p.stagedId)} disabled={p.disabled} aria-label="Batal unggah foto"
        className="p-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors disabled:opacity-50 cursor-pointer"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

function createStagedDropHandler(index: number, onMove: (from: number, to: number) => void) {
  return (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const raw = e.dataTransfer.getData('text/plain');
    if (raw.startsWith('uploaded:')) return;
    const from = raw.startsWith('staged:') ? Number(raw.replace('staged:', '')) : Number(raw);
    if (!Number.isNaN(from)) onMove(from, index);
  };
}

interface StagedCardProps {
  staged: StagedImage; index: number; total: number; hasExistingCover: boolean;
  disabled: boolean; onMove: (from: number, to: number) => void; onRemove: (id: string) => void;
}

function StagedImagePreview({ staged, index, isCover }: { staged: StagedImage; index: number; isCover: boolean }): React.JSX.Element {
  return (
    <div className="relative aspect-video bg-gray-100 overflow-hidden">
      <img src={staged.previewUrl} alt={`Foto ${index + 1}`} className="w-full h-full object-cover" />
      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 text-white text-[11px] font-bold">#{index + 1}</span>
      {isCover && <StagedCoverBadge />}
    </div>
  );
}

function StagedImageCard(p: StagedCardProps): React.JSX.Element {
  const isCover = !p.hasExistingCover && p.index === 0;
  const onDrop = createStagedDropHandler(p.index, p.onMove);
  const border = isCover ? 'border-amber-400 ring-2 ring-amber-100' : 'border-gray-200 hover:border-gray-300';
  return (
    <div
      draggable={!p.disabled} onDragStart={(e) => e.dataTransfer.setData('text/plain', `staged:${p.index}`)}
      onDragOver={(e) => e.preventDefault()} onDrop={onDrop}
      className={`group relative rounded-xl overflow-hidden border bg-white shadow-2xs transition-all ${border}`}
    >
      <StagedImagePreview staged={p.staged} index={p.index} isCover={isCover} />
      <StagedCardActions index={p.index} total={p.total} disabled={p.disabled} onMove={p.onMove} onRemove={p.onRemove} stagedId={p.staged.id} />
    </div>
  );
}

function StagedHeaderActions({ count, isUploading, onClearAll, onUpload }: { count: number; isUploading: boolean; onClearAll: () => void; onUpload: () => void }): React.JSX.Element {
  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={onClearAll} disabled={isUploading} className="text-xs">Batal Semua</Button>
      <Button variant="primary" size="sm" onClick={onUpload} disabled={isUploading} isLoading={isUploading} leftIcon={<UploadCloud className="w-4 h-4" />} className="text-xs">
        Unggah {count} Foto
      </Button>
    </div>
  );
}

function StagedSectionHeader(p: { count: number; isUploading: boolean; onClearAll: () => void; onUpload: () => void }): React.JSX.Element {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 pb-3 border-b border-amber-200/60">
      <div>
        <h4 className="text-sm font-bold text-gray-900">Foto Baru Dipilih ({p.count})</h4>
        <p className="text-xs text-gray-600 mt-0.5">Atur urutan foto atau batalkan sebelum diunggah</p>
      </div>
      <StagedHeaderActions count={p.count} isUploading={p.isUploading} onClearAll={p.onClearAll} onUpload={p.onUpload} />
    </div>
  );
}

export interface StagedGalleryProps {
  stagedImages: StagedImage[]; hasExistingCover: boolean; isUploading: boolean;
  onMove: (fromIndex: number, toIndex: number) => void; onRemove: (id: string) => void;
  onClearAll: () => void; onUpload: () => void;
}

export function StagedGallerySection(p: StagedGalleryProps): React.JSX.Element | null {
  if (p.stagedImages.length === 0) return null;
  return (
    <div className="mb-6 p-4 rounded-xl border border-amber-200 bg-amber-50/40">
      <StagedSectionHeader count={p.stagedImages.length} isUploading={p.isUploading} onClearAll={p.onClearAll} onUpload={p.onUpload} />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {p.stagedImages.map((staged, idx) => (
          <StagedImageCard key={staged.id} staged={staged} index={idx} total={p.stagedImages.length} hasExistingCover={p.hasExistingCover} disabled={p.isUploading} onMove={p.onMove} onRemove={p.onRemove} />
        ))}
      </div>
    </div>
  );
}
