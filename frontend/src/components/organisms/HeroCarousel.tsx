import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface CarouselSlide {
  id: string;
  tag: string;
  title: string;
  subtitle: string;
  ctaText: string;
  category?: string;
  imageUrl: string;
}

export const HERO_SLIDES: CarouselSlide[] = [
  {
    id: 'staycation-hemat',
    tag: 'Promo Spesial',
    title: 'Staycation Hemat & Nyaman',
    subtitle: 'Temukan penginapan terbaik untuk rehat sejenak dari rutinitas dengan harga bersahabat.',
    ctaText: 'Jelajahi Sekarang',
    category: 'hotel',
    imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'villa-keluarga',
    tag: 'Pilihan Keluarga',
    title: 'Villa Liburan Keluarga',
    subtitle: 'Nikmati momen hangat bersama keluarga di villa privat eksklusif berfasilitas lengkap.',
    ctaText: 'Lihat Villa',
    category: 'villa',
    imageUrl: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'unik-nusantara',
    tag: 'Destinasi Favorit',
    title: 'Penginapan Unik Nusantara',
    subtitle: 'Dari kabin pegunungan hingga resort tropis, nikmati pengalaman menginap otentik.',
    ctaText: 'Temukan Penginapan',
    category: 'others',
    imageUrl: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80',
  },
];

interface HeroCarouselProps {
  slides?: CarouselSlide[];
  onCtaClick?: (category?: string) => void;
}

function SlideIndicators({
  count, active, onSelect,
}: { count: number; active: number; onSelect: (idx: number) => void }) {
  const dots = Array.from({ length: count });
  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
      {dots.map((_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onSelect(i)}
          aria-label={`Pindah ke slide ${i + 1}`}
          className={`h-2.5 rounded-full transition-all duration-300 ${
            active === i ? 'w-8 bg-white' : 'w-2.5 bg-white/50 hover:bg-white/75'
          }`}
        />
      ))}
    </div>
  );
}

function SlideBadge({ tag }: { tag: string }) {
  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-600/90 text-xs font-semibold w-fit mb-3 backdrop-blur-sm">
      <Sparkles className="w-3.5 h-3.5" />
      <span>{tag}</span>
    </div>
  );
}

function SlideCtaButton({ text, onClick }: { text: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-6 py-3 bg-white text-primary-700 hover:bg-primary-50 active:bg-primary-100 font-bold rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5"
    >
      {text}
    </button>
  );
}

function SlideContent({ slide, onCta }: { slide: CarouselSlide; onCta: (cat?: string) => void }) {
  return (
    <div className="relative z-10 h-full flex flex-col justify-center px-6 sm:px-12 md:px-16 max-w-3xl text-white">
      <SlideBadge tag={slide.tag} />
      <h1 className="text-2xl sm:text-4xl md:text-5xl font-black leading-tight mb-3">{slide.title}</h1>
      <p className="text-sm sm:text-base md:text-lg text-white/90 mb-6">{slide.subtitle}</p>
      <div><SlideCtaButton text={slide.ctaText} onClick={() => onCta(slide.category)} /></div>
    </div>
  );
}

function NavArrows({ onPrev, onNext }: { onPrev: () => void; onNext: () => void }) {
  return (
    <>
      <button
        type="button"
        onClick={onPrev}
        aria-label="Slide sebelumnya"
        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white backdrop-blur-sm"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        type="button"
        onClick={onNext}
        aria-label="Slide berikutnya"
        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white backdrop-blur-sm"
      >
        <ChevronRight className="w-6 h-6" />
      </button>
    </>
  );
}

function HeroSlideBackground({ imageUrl, title }: { imageUrl: string; title: string }) {
  return (
    <>
      <img src={imageUrl} alt={title} className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-gray-950/80 via-gray-950/50 to-transparent" />
    </>
  );
}

function useCarouselAutoPlay(length: number) {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const next = useCallback(() => setIndex((p) => (p + 1) % length), [length]);
  const prev = useCallback(() => setIndex((p) => (p - 1 + length) % length), [length]);
  useEffect(() => {
    if (isPaused) return;
    const t = setInterval(next, 5000);
    return () => clearInterval(t);
  }, [isPaused, next]);
  return { index, setIndex, next, prev, setIsPaused };
}

export function HeroCarousel({ slides = HERO_SLIDES, onCtaClick }: HeroCarouselProps): React.JSX.Element {
  const { index, setIndex, next, prev, setIsPaused } = useCarouselAutoPlay(slides.length);
  const navigate = useNavigate();
  const handleCta = (cat?: string) => (onCtaClick ? onCtaClick(cat) : navigate(cat ? `/search?category=${cat}` : '/search'));
  const curr = slides[index];

  return (
    <section
      aria-label="Promosi Unggulan SinggahIn"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative w-full h-[360px] sm:h-[420px] md:h-[480px] rounded-3xl overflow-hidden shadow-xl bg-gray-900"
    >
      <HeroSlideBackground imageUrl={curr.imageUrl} title={curr.title} />
      <SlideContent slide={curr} onCta={handleCta} />
      <NavArrows onPrev={prev} onNext={next} />
      <SlideIndicators count={slides.length} active={index} onSelect={setIndex} />
    </section>
  );
}
