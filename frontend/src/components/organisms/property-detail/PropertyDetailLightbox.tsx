import React, { useEffect, useState, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { PropertyImage } from '../../../modules/property/property.types';

export interface PropertyDetailLightboxProps {
  images: PropertyImage[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
}

interface TopBarProps {
  index: number;
  total: number;
  isCover?: boolean;
  onClose: () => void;
}

interface StageProps {
  img: PropertyImage;
  index: number;
  total: number;
  onNext: () => void;
  onPrev: () => void;
}

function useLightboxKey(isOpen: boolean, close: () => void, next: () => void, prev: () => void) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, close, next, prev]);
}

function LightboxTopBar({ index, total, isCover, onClose }: TopBarProps) {
  return (
    <div className="flex items-center justify-between text-white pb-3 border-b border-gray-800">
      <div className="flex items-center gap-2 text-sm font-medium">
        <ImageIcon className="w-4 h-4 text-primary-400" />
        <span>{index + 1} / {total}</span>
        {isCover && <span className="text-xs bg-primary-600 px-2 py-0.5 rounded-full font-semibold">Foto Utama</span>}
      </div>
      <button type="button" onClick={onClose} aria-label="Tutup galeri" className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-colors">
        <X className="w-6 h-6" />
      </button>
    </div>
  );
}

function LightboxNavBtn({ dir, onClick }: { dir: 'prev' | 'next'; onClick: () => void }) {
  const isNext = dir === 'next';
  const Icon = isNext ? ChevronRight : ChevronLeft;
  const label = isNext ? 'Foto selanjutnya' : 'Foto sebelumnya';
  const pos = isNext ? 'right-2 sm:right-4' : 'left-2 sm:left-4';
  return (
    <button type="button" onClick={onClick} aria-label={label} className={`absolute ${pos} z-10 p-3 text-white bg-black/50 hover:bg-black/80 rounded-full transition-colors`}>
      <Icon className="w-6 h-6" />
    </button>
  );
}

function LightboxStage({ img, index, total, onNext, onPrev }: StageProps) {
  return (
    <div className="relative flex-1 flex items-center justify-center my-4 overflow-hidden">
      {total > 1 && <LightboxNavBtn dir="prev" onClick={onPrev} />}
      <img src={img.imageUrl} alt={`Foto properti ${index + 1}`} className="max-h-[70vh] max-w-full object-contain select-none transition-all duration-200" />
      {total > 1 && <LightboxNavBtn dir="next" onClick={onNext} />}
    </div>
  );
}

function LightboxThumbItem({ img, index, active, onSelect }: { img: PropertyImage; index: number; active: boolean; onSelect: () => void }) {
  const border = active ? 'border-primary-500 scale-105' : 'border-transparent opacity-60 hover:opacity-100';
  return (
    <button type="button" onClick={onSelect} aria-label={`Lihat foto ${index + 1}`} className={`relative w-16 h-12 rounded overflow-hidden flex-shrink-0 border-2 transition-all ${border}`}>
      <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />
    </button>
  );
}

function LightboxThumbs({ images, currentIndex, onSelect }: { images: PropertyImage[]; currentIndex: number; onSelect: (i: number) => void }) {
  return (
    <div className="flex justify-center gap-2 overflow-x-auto py-2">
      {images.map((img, i) => (
        <LightboxThumbItem key={img.id || i} img={img} index={i} active={i === currentIndex} onSelect={() => onSelect(i)} />
      ))}
    </div>
  );
}

function useLightboxState(images: PropertyImage[], initialIndex = 0, isOpen: boolean, onClose: () => void) {
  const [index, setIndex] = useState(initialIndex);
  useEffect(() => { setIndex(initialIndex); }, [initialIndex]);
  const goNext = useCallback(() => setIndex((p) => (p + 1) % images.length), [images.length]);
  const goPrev = useCallback(() => setIndex((p) => (p - 1 + images.length) % images.length), [images.length]);
  useLightboxKey(isOpen, onClose, goNext, goPrev);
  return { index, setIndex, goNext, goPrev };
}

export function PropertyDetailLightbox({ images, initialIndex = 0, isOpen, onClose }: PropertyDetailLightboxProps): React.JSX.Element | null {
  const { index, setIndex, goNext, goPrev } = useLightboxState(images, initialIndex, isOpen, onClose);
  if (!isOpen || images.length === 0) return null;
  return (
    <div role="dialog" aria-modal="true" aria-label="Galeri Foto Properti" className="fixed inset-0 z-50 bg-black/90 flex flex-col justify-between p-4 sm:p-6">
      <LightboxTopBar index={index} total={images.length} isCover={images[index].isCover} onClose={onClose} />
      <LightboxStage img={images[index]} index={index} total={images.length} onNext={goNext} onPrev={goPrev} />
      <LightboxThumbs images={images} currentIndex={index} onSelect={setIndex} />
    </div>
  );
}
