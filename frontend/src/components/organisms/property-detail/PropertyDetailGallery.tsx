import React, { useState } from 'react';
import { Image as ImageIcon, Building } from 'lucide-react';
import { PropertyImage } from '../../../modules/property/property.types';
import { PropertyDetailLightbox } from './PropertyDetailLightbox';

export interface PropertyDetailGalleryProps {
  images?: PropertyImage[];
  title: string;
}

interface MainCoverProps {
  img: PropertyImage;
  title: string;
  onClick: () => void;
  hasOthers: boolean;
}

function GalleryEmptyState({ title }: { title: string }) {
  return (
    <div
      aria-label={`Galeri placeholder ${title}`}
      className="w-full h-72 sm:h-96 rounded-2xl bg-gray-100 flex flex-col items-center justify-center text-gray-400 gap-3 border border-gray-200"
    >
      <Building className="w-14 h-14 text-gray-300" />
      <span className="text-sm font-medium">Foto properti belum diunggah oleh pemilik</span>
    </div>
  );
}

function ViewAllButton({ total, onClick }: { total: number; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="absolute bottom-4 right-4 z-10 flex items-center gap-2 bg-white/95 hover:bg-white text-gray-900 font-semibold text-xs sm:text-sm px-4 py-2 rounded-xl shadow-md border border-gray-200 backdrop-blur-sm transition-transform active:scale-95"
    >
      <ImageIcon className="w-4 h-4 text-primary-600" />
      <span>Lihat Semua Foto ({total})</span>
    </button>
  );
}

function MainCoverImage({ img, title, onClick, hasOthers }: MainCoverProps) {
  const colSpan = hasOthers ? 'md:col-span-2' : 'md:col-span-4';
  return (
    <div className={`${colSpan} relative aspect-[4/3] md:aspect-auto md:h-[420px] cursor-pointer overflow-hidden group`} onClick={onClick}>
      <img src={img.imageUrl} alt={`${title} - Foto Utama`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
    </div>
  );
}

function ThumbnailItem({ img, title, index, onSelect }: { img: PropertyImage; title: string; index: number; onSelect: () => void }) {
  return (
    <div className="relative aspect-[4/3] h-[204px] cursor-pointer overflow-hidden group" onClick={onSelect}>
      <img src={img.imageUrl} alt={`${title} - Foto ${index + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
    </div>
  );
}

function ThumbnailGrid({ others, all, title, onSelect }: { others: PropertyImage[]; all: PropertyImage[]; title: string; onSelect: (i: number) => void }) {
  return (
    <div className="hidden md:grid md:col-span-2 grid-cols-2 gap-2 sm:gap-3">
      {others.map((img) => (
        <ThumbnailItem key={img.id} img={img} title={title} index={all.findIndex((i) => i.id === img.id)} onSelect={() => onSelect(all.findIndex((i) => i.id === img.id))} />
      ))}
    </div>
  );
}

function GalleryGrid({ main, others, all, title, onSelect }: { main: PropertyImage; others: PropertyImage[]; all: PropertyImage[]; title: string; onSelect: (i: number) => void }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-2 sm:gap-3 rounded-2xl overflow-hidden max-h-[480px]">
      <MainCoverImage img={main} title={title} onClick={() => onSelect(all.indexOf(main))} hasOthers={others.length > 0} />
      {others.length > 0 && <ThumbnailGrid others={others} all={all} title={title} onSelect={onSelect} />}
    </div>
  );
}

export function PropertyDetailGallery({ images = [], title }: PropertyDetailGalleryProps): React.JSX.Element {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const openLightbox = (idx: number) => { setSelectedIndex(idx); setLightboxOpen(true); };
  if (!images || images.length === 0) return <GalleryEmptyState title={title} />;
  const main = images.find((i) => i.isCover) || images[0];
  const others = images.filter((i) => i.id !== main.id).slice(0, 4);
  return (
    <section aria-label="Galeri Foto Properti" className="relative">
      <GalleryGrid main={main} others={others} all={images} title={title} onSelect={openLightbox} />
      <ViewAllButton total={images.length} onClick={() => openLightbox(0)} />
      <PropertyDetailLightbox images={images} initialIndex={selectedIndex} isOpen={lightboxOpen} onClose={() => setLightboxOpen(false)} />
    </section>
  );
}
