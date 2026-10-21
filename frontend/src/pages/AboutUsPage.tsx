import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  CalendarCheck,
  Sparkles,
  HeartHandshake,
  Award,
  TrendingUp,
  ArrowRight,
  Compass,
  PhoneCall,
  Clock,
  Check
} from 'lucide-react';
import { SEOHead } from '../components/atoms/SEOHead';
import { Button } from '../components/atoms/Button';

const CORE_VALUES = [
  { icon: CalendarCheck, title: 'Transparansi Tarif Penuh', desc: 'Tidak ada biaya tersembunyi di akhir checkout. Fitur kalender harga interaktif menampilkan tarif dinamis harian secara terbuka.', color: 'bg-blue-50 text-blue-600' },
  { icon: ShieldCheck, title: 'Keamanan & Verifikasi Resmi', desc: 'Setiap penginapan diverifikasi langsung oleh tim kurator kami. Transaksi terproteksi dengan gerbang pembayaran resmi dan bukti invoice sah.', color: 'bg-emerald-50 text-emerald-600' },
  { icon: HeartHandshake, title: 'Dukungan untuk Mitra Lokal', desc: 'Kami memberdayakan pemilik properti independen dan UMKM lokal dengan dasbor manajemen cerdas dan akses langsung ke ribuan tamu.', color: 'bg-amber-50 text-amber-600' },
  { icon: Clock, title: 'Layanan Pelanggan Responsif', desc: 'Tim dukungan SinggahIn siaga membantu kendala pemesanan, verifikasi transfer, hingga kebutuhan check-in Anda 24 jam setiap hari.', color: 'bg-purple-50 text-purple-600' },
];

function HeroDecorations() {
  return (
    <>
      <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-80 h-80 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />
    </>
  );
}

function HeroButtons() {
  return (
    <div className="pt-2 flex flex-wrap gap-4 items-center">
      <Link to="/search"><Button variant="primary" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>Mulai Cari Penginapan</Button></Link>
      <a href="#contact-us" className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-white text-sm font-semibold transition-colors"><PhoneCall className="w-4 h-4 text-emerald-400" /> Hubungi Tim Kami</a>
    </div>
  );
}

function AboutUsHero() {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-primary-950 to-slate-900 text-white p-8 sm:p-14 lg:p-20 shadow-xl">
      <HeroDecorations />
      <div className="relative z-10 max-w-3xl space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-primary-200 tracking-wide"><Sparkles className="w-3.5 h-3.5 text-amber-400" /> Mengenal Lebih Dekat SinggahIn</div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">Menghubungkan Perjalanan Anda dengan Kenyamanan Terbaik di Indonesia</h1>
        <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">SinggahIn adalah platform reservasi penginapan terkurasi yang memadukan kehangatan keramahan lokal nusantara dengan teknologi modern. Kami percaya setiap perjalanan layak mendapatkan kepastian harga, kamar yang nyaman, dan pengalaman tanpa rasa cemas.</p>
        <HeroButtons />
      </div>
    </section>
  );
}

const STORY_POINTS = ['Verifikasi langsung foto fasilitas dan kelayakan kamar', 'Sistem kalender harga harian dinamis real-time', 'Invoice resmi otomatis dan bukti reservasi langsung sah'];

function StoryPointsList() {
  return (
    <div className="space-y-3 pt-2">
      {STORY_POINTS.map((point, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0"><Check className="w-3.5 h-3.5 stroke-[3]" /></div>
          <span className="text-sm font-medium text-gray-700">{point}</span>
        </div>
      ))}
    </div>
  );
}

function VisionCard() {
  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
      <h4 className="text-sm font-bold text-primary-700 uppercase tracking-wider mb-1">Visi</h4>
      <p className="text-sm text-gray-600 leading-relaxed">Menjadi ekosistem reservasi akomodasi paling tepercaya di Indonesia yang memberdayakan potensi pariwisata nusantara secara berkelanjutan.</p>
    </div>
  );
}

function MissionCard() {
  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
      <h4 className="text-sm font-bold text-primary-700 uppercase tracking-wider mb-1">Misi</h4>
      <ul className="text-sm text-gray-600 space-y-2 list-disc list-inside">
        <li>Menyediakan kalender tarif dinamis transparan tanpa biaya siluman.</li>
        <li>Mendampingi pemilik properti lokal berkembang melalui platform teknologi modern.</li>
        <li>Menjamin transaksi dan data tamu terlindungi dengan standar keamanan terdepan.</li>
      </ul>
    </div>
  );
}

function VisionMissionCard() {
  return (
    <div className="bg-gradient-to-br from-primary-50 via-white to-sky-50 rounded-3xl p-8 sm:p-10 border border-primary-100 shadow-sm space-y-6">
      <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Award className="w-5 h-5 text-primary-600" /> Visi & Misi SinggahIn</h3>
      <div className="space-y-4">
        <VisionCard />
        <MissionCard />
      </div>
    </div>
  );
}

function AboutUsStorySection() {
  return (
    <section id="visi-misi" className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
      <div className="space-y-6">
        <div className="inline-flex items-center gap-2 text-xs font-bold text-primary-600 tracking-wider uppercase bg-primary-50 px-3 py-1 rounded-full"><Compass className="w-3.5 h-3.5" /> Cerita SinggahIn</div>
        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 leading-snug">Membangun Standar Baru Kenyamanan Menginap Tanpa Biaya Tersembunyi</h2>
        <p className="text-gray-600 text-sm sm:text-base leading-relaxed">Perjalanan seringkali dirusak oleh hal-hal kecil: foto kamar yang tidak sesuai dengan aslinya, harga yang tiba-tiba melonjak saat halaman pembayaran, atau konfirmasi pemesanan yang lambat.</p>
        <p className="text-gray-600 text-sm sm:text-base leading-relaxed">SinggahIn didirikan untuk mengembalikan esensi sejati dari singgah — tempat beristirahat yang aman, ramah, dan dapat diandalkan. Kami menghubungkan pelancong dengan pemilik penginapan lokal melalui sistem yang adil dan transparan.</p>
        <StoryPointsList />
      </div>
      <VisionMissionCard />
    </section>
  );
}

function CoreValueCard({ val }: { val: typeof CORE_VALUES[number] }) {
  const Icon = val.icon;
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
      <div>
        <div className={`w-12 h-12 rounded-xl ${val.color} flex items-center justify-center mb-4`}><Icon className="w-6 h-6" /></div>
        <h3 className="font-bold text-gray-900 text-base mb-2">{val.title}</h3>
        <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">{val.desc}</p>
      </div>
    </div>
  );
}

function CoreValuesSection() {
  return (
    <section id="core-values" className="space-y-8">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 text-xs font-bold text-primary-600 tracking-wider uppercase bg-primary-50 px-3 py-1 rounded-full"><TrendingUp className="w-3.5 h-3.5" /> Nilai-Nilai Utama</div>
        <h2 className="text-2xl sm:text-3xl font-black text-gray-900">Prinsip yang Selalu Kami Pegang Teguh</h2>
        <p className="text-sm text-gray-500">Komitmen kami untuk memberikan pengalaman menginap terbaik bagi setiap tamu dan mitra.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {CORE_VALUES.map((val, idx) => <CoreValueCard key={idx} val={val} />)}
      </div>
    </section>
  );
}

export function AboutUsPage(): React.JSX.Element {
  return (
    <div className="w-full flex flex-col gap-12 sm:gap-16 pb-12">
      <SEOHead title="Tentang Kami - SinggahIn | Platform Penginapan Terpercaya" description="Pelajari kisah, visi, misi, dan nilai-nilai SinggahIn dalam menghadirkan pengalaman reservasi akomodasi terbaik dan transparan di seluruh Indonesia." />
      <AboutUsHero />
      <AboutUsStorySection />
      <CoreValuesSection />
    </div>
  );
}
