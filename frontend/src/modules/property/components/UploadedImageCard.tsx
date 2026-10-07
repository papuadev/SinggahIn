import React from 'react';
import { Trash2, Star, Check, ArrowLeft, ArrowRight } from 'lucide-react';
import { PropertyImage } from '../property.types';
import { Button } from '../../../components/atoms/Button';

function ImageCoverAction({ isCover, disabled, onSetCover }: { isCover: boolean; disabled: boolean; onSetCover: () => void }): React.JSX.Element {
  if (isCover) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary-700 bg-primary-50 px-2 py-0.5 rounded-md">
        <Check className="w-3 h-3" /> Sampul Utama
      </span>
    );
  }
  return (
    <Button variant="ghost" size="sm" onClick={onSetCover} disabled={disabled} className="text-xs text-gray-600 hover:text-primary-600" leftIcon={<Star className="w-3 h-3" />}>
      Jadikan Sampul
    </Button>
  );
}

interface UploadedNavProps {
  index: number; total: number; disabled: boolean; onMove: (from: number, to: number) => void;
}

const navBtnClass = 'p-1 text-gray-500 hover:text-primary-600 hover:bg-gray-100 rounded disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed';

function UploadedNavButtons({ index, total, disabled, onMove }: UploadedNavProps): React.JSX.Element {
  return (
    <div className="flex items-center gap-1">
      <button type="button" onClick={() => onMove(index, index - 1)} disabled={disabled || index === 0} aria-label="Pindah urutan ke kiri" className={navBtnClass}>
        <ArrowLeft className="w-4 h-4" />
      </button>
      <button type="button" onClick={() => onMove(index, index + 1)} disabled={disabled || index === total - 1} aria-label="Pindah urutan ke kanan" className={navBtnClass}>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}

function createDropHandler(index: number, onMove: (from: number, to: number) => void) {
  return (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const raw = e.dataTransfer.getData('text/plain');
    if (raw.startsWith('staged:')) return;
    const from = raw.startsWith('uploaded:') ? Number(raw.replace('uploaded:', '')) : Number(raw);
    if (!Number.isNaN(from)) onMove(from, index);
  };
}

export interface UploadedImageCardProps {
  image: PropertyImage; index: number; total: number; disabled: boolean;
  onSetCover: (id: string) => void; onDelete: (id: string) => void; onMove: (from: number, to: number) => void;
}

function CardThumbnail({ image, index }: { image: PropertyImage; index: number }): React.JSX.Element {
  return (
    <div className="relative aspect-video bg-gray-100 overflow-hidden">
      <img src={image.imageUrl} alt={`Foto Properti ${index + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 text-white text-[11px] font-bold">#{index + 1}</span>
    </div>
  );
}

function DeleteImageBtn({ id, disabled, onDelete }: { id: string; disabled: boolean; onDelete: (id: string) => void }): React.JSX.Element {
  return (
    <button
      type="button" onClick={() => onDelete(id)} disabled={disabled} aria-label="Hapus foto"
      className="p-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors disabled:opacity-50 cursor-pointer"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}

function CardFooterActions(p: UploadedImageCardProps): React.JSX.Element {
  return (
    <div className="flex items-center justify-between gap-1 p-2 bg-white border-t border-gray-100">
      <UploadedNavButtons index={p.index} total={p.total} disabled={p.disabled} onMove={p.onMove} />
      <div className="flex items-center gap-1">
        <ImageCoverAction isCover={p.image.isCover} disabled={p.disabled} onSetCover={() => p.onSetCover(p.image.id)} />
        <DeleteImageBtn id={p.image.id} disabled={p.disabled} onDelete={p.onDelete} />
      </div>
    </div>
  );
}

export function UploadedImageCard(props: UploadedImageCardProps): React.JSX.Element {
  const onDrop = createDropHandler(props.index, props.onMove);
  const border = props.image.isCover ? 'border-primary-500 ring-2 ring-primary-100' : 'border-gray-200 hover:border-gray-300';
  return (
    <div
      draggable={!props.disabled} onDragStart={(e) => e.dataTransfer.setData('text/plain', `uploaded:${props.index}`)}
      onDragOver={(e) => e.preventDefault()} onDrop={onDrop}
      className={`group relative rounded-xl overflow-hidden border bg-white shadow-2xs transition-shadow ${border}`}
    >
      <CardThumbnail image={props.image} index={props.index} />
      <CardFooterActions {...props} />
    </div>
  );
}
