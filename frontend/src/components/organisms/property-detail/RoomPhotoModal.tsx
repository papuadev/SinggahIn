import React, { useEffect, useState, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';

export interface RoomPhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomName: string;
  images: string[];
  isFallback?: boolean;
}

function useRoomPhotoKey(isOpen: boolean, close: () => void, next: () => void, prev: () => void) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, close, next, prev]);
}

function TopBarBadges({ roomName, isFallback }: { roomName: string; isFallback?: boolean }) {
  return (
    <>
      <span className="text-xs bg-primary-600 text-white px-2.5 py-0.5 rounded-full font-semibold">{roomName}</span>
      {isFallback && <span className="text-xs text-amber-300 font-medium italic hidden sm:inline">(Foto Utama Properti)</span>}
    </>
  );
}

function RoomPhotoCounter({ index, total }: { index: number; total: number }) {
  return (
    <div className="flex items-center gap-2 text-sm font-medium">
      <ImageIcon className="w-4 h-4 text-primary-400" />
      <span>{total > 0 ? `${index + 1} / ${total}` : '0 / 0'}</span>
    </div>
  );
}

function RoomPhotoTopBar({ index, total, roomName, isFallback, onClose }: {
  index: number; total: number; roomName: string; isFallback?: boolean; onClose: () => void;
}) {
  return (
    <div className="flex items-center justify-between text-white pb-3 border-b border-gray-800" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center gap-2">
        <RoomPhotoCounter index={index} total={total} />
        <TopBarBadges roomName={roomName} isFallback={isFallback} />
      </div>
      <button type="button" onClick={onClose} aria-label="Tutup foto kamar" className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-colors cursor-pointer">
        <X className="w-6 h-6" />
      </button>
    </div>
  );
}

function NavBtn({ dir, onClick }: { dir: 'prev' | 'next'; onClick: () => void }) {
  const isNext = dir === 'next';
  const Icon = isNext ? ChevronRight : ChevronLeft;
  const label = isNext ? 'Foto berikutnya' : 'Foto sebelumnya';
  const pos = isNext ? 'right-2 sm:right-4' : 'left-2 sm:left-4';
  const handleClick = (e: React.MouseEvent) => { e.stopPropagation(); onClick(); };
  return (
    <button type="button" onClick={handleClick} aria-label={label} className={`absolute ${pos} z-10 p-3 text-white bg-black/50 hover:bg-black/80 rounded-full transition-colors cursor-pointer`}>
      <Icon className="w-6 h-6" />
    </button>
  );
}

function EmptyRoomPhoto() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-2">
      <ImageIcon className="w-12 h-12 stroke-1" />
      <p className="text-sm">Belum ada foto yang tersedia untuk kamar ini.</p>
    </div>
  );
}

function RoomPhotoStage({ src, roomName, index, total, onNext, onPrev }: {
  src?: string; roomName: string; index: number; total: number; onNext: () => void; onPrev: () => void;
}) {
  if (!src) return <EmptyRoomPhoto />;
  return (
    <div className="relative flex-1 flex items-center justify-center my-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
      {total > 1 && <NavBtn dir="prev" onClick={onPrev} />}
      <img src={src} alt={`${roomName} foto ${index + 1}`} className="max-h-[70vh] max-w-full object-contain select-none transition-all duration-200 cursor-default" />
      {total > 1 && <NavBtn dir="next" onClick={onNext} />}
    </div>
  );
}

function ThumbItem({ img, index, active, onSelect }: { img: string; index: number; active: boolean; onSelect: () => void }) {
  const border = active ? 'border-primary-500 scale-105' : 'border-transparent opacity-60 hover:opacity-100';
  return (
    <button type="button" onClick={onSelect} aria-label={`Thumbnail ${index + 1}`} className={`relative w-16 h-12 rounded overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${border}`}>
      <img src={img} alt="" className="w-full h-full object-cover" />
    </button>
  );
}

function FallbackNotice({ isFallback }: { isFallback?: boolean }) {
  if (!isFallback) return null;
  return <p className="text-xs text-gray-400 text-center italic">*Menampilkan foto utama penginapan karena tipe kamar ini belum memiliki foto spesifik.</p>;
}

function useBodyScrollLock(isOpen: boolean) {
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [isOpen]);
}

function RoomPhotoThumbs({ images, currentIndex, isFallback, onSelect }: {
  images: string[]; currentIndex: number; isFallback?: boolean; onSelect: (i: number) => void;
}) {
  if (images.length === 0) return null;
  return (
    <div className="flex flex-col items-center gap-2 py-2" onClick={(e) => e.stopPropagation()}>
      {images.length > 1 && (
        <div className="flex justify-center gap-2 overflow-x-auto max-w-full py-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {images.map((img, i) => (<ThumbItem key={img + i} img={img} index={i} active={i === currentIndex} onSelect={() => onSelect(i)} />))}
        </div>
      )}
      <FallbackNotice isFallback={isFallback} />
    </div>
  );
}

function useRoomPhotoState(images: string[], isOpen: boolean, onClose: () => void) {
  const [index, setIndex] = useState(0);
  useEffect(() => { if (isOpen) setIndex(0); }, [isOpen]);
  const goNext = useCallback(() => setIndex((p) => (images.length > 0 ? (p + 1) % images.length : 0)), [images.length]);
  const goPrev = useCallback(() => setIndex((p) => (images.length > 0 ? (p - 1 + images.length) % images.length : 0)), [images.length]);
  useRoomPhotoKey(isOpen, onClose, goNext, goPrev);
  useBodyScrollLock(isOpen);
  return { index, setIndex, goNext, goPrev };
}

export function RoomPhotoModal({ isOpen, onClose, roomName, images, isFallback }: RoomPhotoModalProps): React.JSX.Element | null {
  const { index, setIndex, goNext, goPrev } = useRoomPhotoState(images, isOpen, onClose);
  if (!isOpen) return null;
  return (
    <div role="dialog" aria-modal="true" aria-label={`Foto Kamar ${roomName}`} onClick={onClose} className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-4 sm:p-6 backdrop-blur-xs overflow-hidden select-none">
      <RoomPhotoTopBar index={index} total={images.length} roomName={roomName} isFallback={isFallback} onClose={onClose} />
      <RoomPhotoStage src={images[index]} roomName={roomName} index={index} total={images.length} onNext={goNext} onPrev={goPrev} />
      <RoomPhotoThumbs images={images} currentIndex={index} isFallback={isFallback} onSelect={setIndex} />
    </div>
  );
}
