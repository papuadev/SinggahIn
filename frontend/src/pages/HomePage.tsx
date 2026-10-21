import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ShieldCheck, CalendarCheck, CreditCard, Star, Sparkles, MapPin, ArrowRight } from 'lucide-react';
import { SEOHead } from '../components/atoms/SEOHead';
import { HeroCarousel } from '../components/organisms/HeroCarousel';
import { FloatingSearchWidget } from '../components/organisms/FloatingSearchWidget';
import { RecommendedPropertiesSection } from '../components/organisms/home/RecommendedPropertiesSection';
import { useUserLocation, UserCoordinates } from '../modules/property/hooks/useUserLocation';
import { CatalogQueryParams } from '../modules/property/property.types';

const VALUE_PROPS = [
  {
    icon: CalendarCheck,
    title: 'Harga Transparan & Dinamis',
    desc: 'Bandingkan tarif 1 bulan penuh secara real-time tanpa biaya tersembunyi.',
  },
  {
    icon: ShieldCheck,
    title: 'Properti Terverifikasi',
    desc: 'Seluruh hotel, villa, dan penginapan diverifikasi resmi oleh kurator SinggahIn.',
  },
  {
    icon: CreditCard,
    title: 'Pembayaran Fleksibel & Aman',
    desc: 'Didukung transfer manual dengan konfirmasi tenant dan payment gateway instan.',
  },
];

function ValuePropCard({ item }: { item: (typeof VALUE_PROPS)[number] }) {
  const Icon = item.icon;
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4">
      <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <h3 className="font-bold text-gray-900 text-base mb-1">{item.title}</h3>
        <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
      </div>
    </div>
  );
}

function ValuePropsHeader() {
  return (
    <div className="text-center max-w-xl mx-auto mb-8">
      <span className="text-xs font-bold text-primary-600 tracking-wider uppercase bg-primary-50 px-3 py-1 rounded-full inline-block mb-2">Tentang SinggahIn</span>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Mengapa Memilih SinggahIn?</h2>
      <p className="text-sm text-gray-500">Kenyamanan, kepastian tarif, dan keramahan khas nusantara di setiap langkah perjalanan Anda.</p>
    </div>
  );
}

function AboutUsSpotlight() {
  return (
    <div className="bg-gradient-to-r from-slate-900 via-primary-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-md border border-slate-800">
      <div className="space-y-2 text-center md:text-left max-w-2xl">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-400"><Sparkles className="w-4 h-4" /> Solusi Reservasi Instan</div>
        <h3 className="text-xl sm:text-2xl font-black">Ingin Tahu Lebih Banyak Mengenai Cerita & Nilai Kami?</h3>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">SinggahIn berdedikasi menciptakan ekosistem penginapan yang transparan bagi pelancong dan memberdayakan pemilik properti lokal di lebih dari 30 kota.</p>
      </div>
      <Link to="/about" className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-primary-700 hover:bg-primary-50 font-bold text-sm shadow-sm transition-all whitespace-nowrap shrink-0">
        Lebih Dekat Dengan Kami <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

function ValuePropsSection() {
  return (
    <section id="about-us" aria-label="Tentang SinggahIn" className="scroll-mt-28 mt-8 mb-14">
      <div id="tentang-kami" className="scroll-mt-28" />
      <ValuePropsHeader />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {VALUE_PROPS.map((vp, idx) => <ValuePropCard key={idx} item={vp} />)}
      </div>
      <AboutUsSpotlight />
    </section>
  );
}

function useCategoryFilter() {
  const [params, setParams] = useSearchParams();
  const selectedCategory = params.get('category') || '';
  const onCategoryChange = (cat: string) => {
    const next = new URLSearchParams(params);
    if (cat) next.set('category', cat);
    else next.delete('category');
    setParams(next);
  };
  return { selectedCategory, onCategoryChange };
}

function TopRatedSection({ category }: { category?: string }) {
  const url = `/search?sortBy=rating&sortOrder=desc${category ? `&category=${category}` : ''}`;
  return (
    <RecommendedPropertiesSection
      id="rekomendasi"
      title="Favorit Tamu & Rating Tertinggi"
      subtitle="Pilihan penginapan dengan ulasan bintang emas tertinggi dari tamu terverifikasi"
      badgeText="Paling Direkomendasikan" badgeIcon={Star}
      variant="highlighted"
      queryParams={{ sortBy: 'rating', sortOrder: 'desc', limit: 10, category }}
      viewAllUrl={url}
    />
  );
}

function getFreshPicksMeta(hasCoords: boolean) {
  if (hasCoords) {
    return {
      title: 'Penginapan Terdekat di Sekitar Anda',
      subtitle: 'Temukan hotel, villa, dan homestay paling dekat dari lokasi Anda saat ini',
      badgeText: 'Terdekat dari Anda', badgeIcon: MapPin,
    };
  }
  return {
    title: 'Jelajahi Penginapan Pilihan',
    subtitle: 'Koleksi villa, hotel, dan homestay terverifikasi untuk liburan tak terlupakan',
    badgeText: 'Pilihan Segar', badgeIcon: Sparkles,
  };
}

function buildFreshQueryParams(category?: string, coords?: UserCoordinates | null): CatalogQueryParams {
  if (coords) {
    return { limit: 10, category, latitude: coords.latitude, longitude: coords.longitude, sortBy: 'distance', sortOrder: 'asc' };
  }
  return { limit: 10, category };
}

function FreshPicksSection({ category, onReset }: { category?: string; onReset: () => void }) {
  const { coords, loading: geoLoading } = useUserLocation();
  const meta = getFreshPicksMeta(Boolean(coords));
  const queryParams = buildFreshQueryParams(category, coords);
  const url = `/search${category ? `?category=${category}` : ''}`;
  return (
    <RecommendedPropertiesSection
      id="terdekat"
      {...meta} queryParams={queryParams} isLoading={geoLoading}
      viewAllUrl={url} showEmptyIfFiltered onResetCategory={onReset}
    />
  );
}

export function HomePage(): React.JSX.Element {
  const { selectedCategory: cat, onCategoryChange } = useCategoryFilter();
  return (
    <div className="w-full flex flex-col">
      <SEOHead canonicalUrl="https://singgahin.biz.id/" />
      <HeroCarousel />
      <div className="-mt-6 sm:-mt-10 md:-mt-14 relative z-30 px-3 sm:px-6">
        <FloatingSearchWidget initialValues={{ category: cat }} onCategoryChange={onCategoryChange} />
      </div>
      <TopRatedSection category={cat || undefined} />
      <FreshPicksSection category={cat || undefined} onReset={() => onCategoryChange('')} />
      <ValuePropsSection />
    </div>
  );
}
