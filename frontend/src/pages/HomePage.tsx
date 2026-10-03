import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { ShieldCheck, CalendarCheck, CreditCard, Star, Sparkles } from 'lucide-react';
import { SEOHead } from '../components/atoms/SEOHead';
import { HeroCarousel } from '../components/organisms/HeroCarousel';
import { FloatingSearchWidget } from '../components/organisms/FloatingSearchWidget';
import { RecommendedPropertiesSection } from '../components/organisms/home/RecommendedPropertiesSection';

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

function ValuePropsSection() {
  return (
    <section aria-label="Keunggulan SinggahIn" className="mt-6 mb-12">
      <div className="text-center max-w-xl mx-auto mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Mengapa Memilih SinggahIn?</h2>
        <p className="text-sm text-gray-500">Kenyamanan dan kepastian menginap di setiap langkah perjalanan Anda.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {VALUE_PROPS.map((vp, idx) => (
          <ValuePropCard key={idx} item={vp} />
        ))}
      </div>
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
      title="Favorit Tamu & Rating Tertinggi"
      subtitle="Pilihan penginapan dengan ulasan bintang emas tertinggi dari tamu terverifikasi"
      badgeText="Paling Direkomendasikan" badgeIcon={Star}
      queryParams={{ sortBy: 'rating', sortOrder: 'desc', limit: 4, category }}
      viewAllUrl={url}
    />
  );
}

function FreshPicksSection({ category, onReset }: { category?: string; onReset: () => void }) {
  const url = `/search${category ? `?category=${category}` : ''}`;
  return (
    <RecommendedPropertiesSection
      title="Jelajahi Penginapan Pilihan"
      subtitle="Koleksi villa, hotel, dan homestay terverifikasi untuk liburan tak terlupakan"
      badgeText="Pilihan Segar" badgeIcon={Sparkles}
      queryParams={{ limit: 4, category }}
      viewAllUrl={url} showEmptyIfFiltered onResetCategory={onReset}
    />
  );
}

export function HomePage(): React.JSX.Element {
  const { selectedCategory: cat, onCategoryChange } = useCategoryFilter();
  return (
    <div className="w-full flex flex-col">
      <SEOHead />
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
