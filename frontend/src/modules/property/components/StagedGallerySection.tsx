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
  index: number;
  total: number;
  disabled: boolean;
  onMove: (from: number, to: number) => void;
}

function StagedNavButtons({ index, total, disabled, onMove }: StagedNavProps): React.JSX.Element {
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => onMove(index, index - 1)}
        disabled={disabled || index === 0}
        aria-label="Pindah ke kiri"
        className="p-1 text-gray-500 hover:text-primary-600 hover:bg-gray-100 rounded disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed"
      >
        <ArrowLeft className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => onMove(index, index + 1)}
        disabled={disabled || index === total - 1}
        aria-label="Pindah ke kanan"
        className="p-1 text-gray-500 hover:text-primary-600 hover:bg-gray-100 rounded disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed"
      >
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}

function StagedCardActions({
  index, total, disabled, onMove, onRemove, stagedId,
}: {
  index: number; total: number; disabled: boolean;
  onMove: (from: number, to: number) => void; onRemove: (id: string) => void; stagedId: string;
}): React.JSX.Element {
  return (
    <div className="flex items-center justify-between p-2 bg-white border-t border-gray-100">
      <StagedNavButtons index={index} total={total} disabled={disabled} onMove={onMove} />
      <button
        type="button"
        onClick={() => onRemove(stagedId)}
        disabled={disabled}
        aria-label="Batal unggah foto"
        className="p-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors disabled:opacity-50 cursor-pointer"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

interface StagedCardProps {
  staged: StagedImage;
  index: number;
  total: number;
  hasExistingCover: boolean;
  disabled: boolean;
  onMove: (fromIndex: number, toIndex: number) => void;
  onRemove: (id: string) => void;
}

function StagedImageCard({
  staged, index, total, hasExistingCover, disabled, onMove, onRemove,
}: StagedCardProps): React.JSX.Element {
  const isCover = !hasExistingCover && index === 0;
  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const from = Number(e.dataTransfer.getData('text/plain'));
    if (!Number.isNaN(from)) onMove(from, index);
  };
  const cardBorder = isCover ? 'border-amber-400 ring-2 ring-amber-100' : 'border-gray-200 hover:border-gray-300';

  return (
    <div
      draggable={!disabled}
      onDragStart={(e) => e.dataTransfer.setData('text/plain', String(index))}
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
      className={`group relative rounded-xl overflow-hidden border bg-white shadow-2xs transition-all ${cardBorder}`}
    >
      <div className="relative aspect-video bg-gray-100 overflow-hidden">
        <img src={staged.previewUrl} alt={`Foto ${index + 1}`} className="w-full h-full object-cover" />
        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 text-white text-[11px] font-bold">
          #{index + 1}
        </span>
        {isCover && <StagedCoverBadge />}
      </div>
      <StagedCardActions index={index} total={total} disabled={disabled} onMove={onMove} onRemove={onRemove} stagedId={staged.id} />
    </div>
  );
}

function StagedSectionHeader({
  count, isUploading, onClearAll, onUpload,
}: {
  count: number; isUploading: boolean; onClearAll: () => void; onUpload: () => void;
}): React.JSX.Element {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 pb-3 border-b border-amber-200/60">
      <div>
        <h4 className="text-sm font-bold text-gray-900">Foto Baru Dipilih ({count})</h4>
        <p className="text-xs text-gray-600 mt-0.5">Atur urutan foto atau batalkan sebelum diunggah</p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onClearAll} disabled={isUploading} className="text-xs">Batal Semua</Button>
        <Button variant="primary" size="sm" onClick={onUpload} disabled={isUploading} isLoading={isUploading} leftIcon={<UploadCloud className="w-4 h-4" />} className="text-xs">
          Unggah {count} Foto
        </Button>
      </div>
    </div>
  );
}

export interface StagedGalleryProps {
  stagedImages: StagedImage[];
  hasExistingCover: boolean;
  isUploading: boolean;
  onMove: (fromIndex: number, toIndex: number) => void;
  onRemove: (id: string) => void;
  onClearAll: () => void;
  onUpload: () => void;
}

export function StagedGallerySection(props: StagedGalleryProps): React.JSX.Element | null {
  const { stagedImages, hasExistingCover, isUploading, onMove, onRemove, onClearAll, onUpload } = props;
  if (stagedImages.length === 0) return null;

  return (
    <div className="mb-6 p-4 rounded-xl border border-amber-200 bg-amber-50/40">
      <StagedSectionHeader count={stagedImages.length} isUploading={isUploading} onClearAll={onClearAll} onUpload={onUpload} />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {stagedImages.map((staged, idx) => (
          <StagedImageCard
            key={staged.id}
            staged={staged}
            index={idx}
            total={stagedImages.length}
            hasExistingCover={hasExistingCover}
            disabled={isUploading}
            onMove={onMove}
            onRemove={onRemove}
          />
        ))}
      </div>
    </div>
  );
}
