import React from 'react';
import { Link } from 'react-router-dom';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  Linkedin
} from 'lucide-react';

const ACCOMMODATION_LINKS = [
  { label: 'Hotel & Resort', href: '/search?category=HOTEL' },
  { label: 'Villa', href: '/search?category=VILLA' },
  { label: 'Homestay', href: '/search?category=HOMESTAY' },
  { label: 'Penginapan di Jakarta', href: '/search?city=Jakarta' },
  { label: 'Penginapan di Yogyakarta', href: '/search?city=Yogyakarta' },
  { label: 'Penginapan di Bali', href: '/search?city=Bali' },
];

const ABOUT_LINKS: { label: string; to?: string; href?: string }[] = [
  { label: 'Tentang SinggahIn', to: '/about' },
  { label: 'Visi & Misi Perusahaan', to: '/about#visi-misi' },
  { label: 'Nilai-Nilai Perusahaan', to: '/about#core-values' },
  { label: 'Daftar Mitra Properti (Tenant)', to: '/register' },
];

const SOCIAL_LINKS = [
  { name: 'Instagram', href: 'https://instagram.com/singgahin', icon: Instagram, color: 'hover:text-pink-400 hover:bg-pink-950/40' },
  { name: 'Facebook', href: 'https://facebook.com/singgahin', icon: Facebook, color: 'hover:text-blue-400 hover:bg-blue-950/40' },
  { name: 'Twitter / X', href: 'https://x.com/singgahin', icon: Twitter, color: 'hover:text-sky-400 hover:bg-sky-950/40' },
  { name: 'YouTube', href: 'https://youtube.com/@singgahin', icon: Youtube, color: 'hover:text-red-400 hover:bg-red-950/40' },
  { name: 'LinkedIn', href: 'https://linkedin.com/company/singgahin', icon: Linkedin, color: 'hover:text-blue-300 hover:bg-blue-900/40' },
];

export function Footer(): React.JSX.Element {
  const handleRouteClick = () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  };

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, href?: string) => {
    if (href && href.startsWith('/#')) {
      const targetId = href.replace('/#', '');
      const el = document.getElementById(targetId);
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: 'smooth' });
        window.history.pushState(null, '', href);
        return;
      }
    }
  };

  return (
    <footer id="contact-us" aria-label="Footer SinggahIn" className="scroll-mt-20 bg-slate-900 text-slate-300 border-t border-slate-800">

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Col 1 & 2: Brand Information */}
          <div className="lg:col-span-2 space-y-5">
            <Link to="/" onClick={handleRouteClick} className="inline-flex items-center gap-2.5">
              <img src="/logo.webp" alt="SinggahIn" className="h-9 w-auto brightness-110" />
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Platform reservasi hotel, villa, apartemen, dan penginapan terkurasi di seluruh Indonesia. Hadir dengan kalender tarif transparan tanpa biaya tersembunyi untuk kepastian singgah Anda.
            </p>

            <div className="pt-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Ikuti Media Sosial Kami
              </h4>
              <div className="flex items-center gap-2">
                {SOCIAL_LINKS.map((s, idx) => {
                  const Icon = s.icon;
                  return (
                    <a
                      key={idx}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.name}
                      className={`w-9 h-9 rounded-lg bg-slate-800 border border-slate-700/80 flex items-center justify-center text-slate-300 transition-colors ${s.color}`}
                    >
                      <Icon className="w-4 h-4" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Col 3: Menu Tentang Penginapan */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Cari Penginapan
            </h3>
            <ul className="space-y-2.5 text-sm">
              {ACCOMMODATION_LINKS.map((item, idx) => (
                <li key={idx}>
                  <Link
                    to={item.href}
                    onClick={handleRouteClick}
                    className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5"
                  >
                    <span className="text-slate-600">›</span> {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: About Us & Perusahaan */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              About Us & Bantuan
            </h3>
            <ul className="space-y-2.5 text-sm">
              {ABOUT_LINKS.map((item, idx) => (
                <li key={idx}>
                  {item.to ? (
                    <Link
                      to={item.to}
                      onClick={handleRouteClick}
                      className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5"
                    >
                      <span className="text-slate-600">›</span> {item.label}
                    </Link>
                  ) : (
                    <a
                      href={item.href}
                      onClick={(e) => handleAnchorClick(e, item.href)}
                      className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5"
                    >
                      <span className="text-slate-600">›</span> {item.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Col 5: Contact Us Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Contact Us
            </h3>
            <div className="space-y-3 text-sm text-slate-400">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-primary-400 shrink-0 mt-0.5" />
                <span>Gedung SinggahIn, Jl. Jend. Sudirman Kav. 28, Jakarta Selatan 12920</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-primary-400 shrink-0" />
                <a href="mailto:support@singgahin.biz.id" className="hover:text-white transition-colors">
                  support@singgahin.biz.id
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <a href="https://wa.me/6282247700456" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  +62 822-4770-0456 (WA)
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Senin - Minggu (24 Jam)</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Bottom Legal / Copyright Strip */}
      <div className="border-t border-slate-800 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <p>&copy; {new Date().getFullYear()} SinggahIn. Seluruh hak cipta dilindungi undang-undang.</p>
          <div className="flex items-center gap-6">
            <Link to="/about" onClick={handleRouteClick} className="hover:text-slate-300 transition-colors">Tentang Kami</Link>
            <span className="text-slate-700">|</span>
            <span className="text-slate-400">Bangga Melayani Indonesia</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
