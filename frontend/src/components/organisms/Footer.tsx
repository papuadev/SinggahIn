import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import { ACCOMMODATION_LINKS, ABOUT_LINKS, SOCIAL_LINKS } from './footer/footer.constants';

export function isDashboardMode(pathname: string): boolean {
  return pathname.startsWith('/tenant') || pathname.startsWith('/orders') || pathname === '/profile';
}

function SocialIconList(): React.JSX.Element {
  return (
    <div className="flex items-center gap-2">
      {SOCIAL_LINKS.map((s, idx) => {
        const Icon = s.icon;
        return (
          <a key={idx} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.name}
            className={`w-9 h-9 rounded-lg bg-slate-800 border border-slate-700/80 flex items-center justify-center text-slate-300 transition-colors ${s.color}`}>
            <Icon className="w-4 h-4" />
          </a>
        );
      })}
    </div>
  );
}

function BrandSocialSection() {
  return (
    <div className="pt-1">
      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Ikuti Media Sosial Kami</h4>
      <SocialIconList />
    </div>
  );
}

function BrandColumn({ onRoute }: { onRoute: () => void }) {
  return (
    <div className="lg:col-span-2 space-y-5">
      <Link to="/" onClick={onRoute} className="inline-flex items-center gap-2.5">
        <img src="/logo.webp" alt="SinggahIn" className="h-9 w-auto brightness-110" />
      </Link>
      <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
        Platform reservasi hotel, villa, apartemen, dan penginapan terkurasi di seluruh Indonesia. Hadir dengan kalender tarif transparan tanpa biaya tersembunyi untuk kepastian singgah Anda.
      </p>
      <BrandSocialSection />
    </div>
  );
}

function AccommodationLinkItem({ item, onRoute }: { item: (typeof ACCOMMODATION_LINKS)[number]; onRoute: () => void }) {
  return (
    <Link to={item.href} onClick={onRoute} className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5">
      <span className="text-slate-600">›</span> {item.label}
    </Link>
  );
}

function AccommodationColumn({ onRoute }: { onRoute: () => void }) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold uppercase tracking-wider text-white">Cari Penginapan</h3>
      <ul className="space-y-2.5 text-sm">
        {ACCOMMODATION_LINKS.map((item, idx) => (
          <li key={idx}><AccommodationLinkItem item={item} onRoute={onRoute} /></li>
        ))}
      </ul>
    </div>
  );
}

function AboutLinkItem({ item, onRoute }: { item: (typeof ABOUT_LINKS)[number]; onRoute: () => void }) {
  if (item.to) {
    return (
      <Link to={item.to} onClick={onRoute} className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5">
        <span className="text-slate-600">›</span> {item.label}
      </Link>
    );
  }
  return (
    <a href={item.href} className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5">
      <span className="text-slate-600">›</span> {item.label}
    </a>
  );
}

function AboutColumn({ onRoute }: { onRoute: () => void }) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold uppercase tracking-wider text-white">About Us & Bantuan</h3>
      <ul className="space-y-2.5 text-sm">
        {ABOUT_LINKS.map((item, idx) => (
          <li key={idx}><AboutLinkItem item={item} onRoute={onRoute} /></li>
        ))}
      </ul>
    </div>
  );
}

function ContactColumn() {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold uppercase tracking-wider text-white">Contact Us</h3>
      <div className="space-y-3 text-sm text-slate-400">
        <div className="flex items-start gap-2.5"><MapPin className="w-4 h-4 text-primary-400 shrink-0 mt-0.5" /><span>Gedung SinggahIn, Jl. Jend. Sudirman Kav. 28, Jakarta Selatan 12920</span></div>
        <div className="flex items-center gap-2.5"><Mail className="w-4 h-4 text-primary-400 shrink-0" /><a href="mailto:support@singgahin.biz.id" className="hover:text-white transition-colors">support@singgahin.biz.id</a></div>
        <div className="flex items-center gap-2.5"><Phone className="w-4 h-4 text-emerald-400 shrink-0" /><a href="https://wa.me/6282247700456" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">+62 822-4770-0456 (WA)</a></div>
        <div className="flex items-center gap-2.5"><Clock className="w-4 h-4 text-amber-400 shrink-0" /><span>Senin - Minggu (24 Jam)</span></div>
      </div>
    </div>
  );
}

function CopyrightStrip({ onRoute }: { onRoute: () => void }) {
  return (
    <div className="border-t border-slate-800 py-6 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <p>&copy; {new Date().getFullYear()} SinggahIn. Seluruh hak cipta dilindungi undang-undang.</p>
        <div className="flex items-center gap-6">
          <Link to="/about" onClick={onRoute} className="hover:text-slate-300 transition-colors">Tentang Kami</Link>
          <span className="text-slate-700">|</span>
          <span className="text-slate-400">Bangga Melayani Indonesia</span>
        </div>
      </div>
    </div>
  );
}

function FullFooter({ onRoute }: { onRoute: () => void }): React.JSX.Element {
  return (
    <footer id="contact-us" aria-label="Footer SinggahIn" className="scroll-mt-20 bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          <BrandColumn onRoute={onRoute} />
          <AccommodationColumn onRoute={onRoute} />
          <AboutColumn onRoute={onRoute} />
          <ContactColumn />
        </div>
      </div>
      <CopyrightStrip onRoute={onRoute} />
    </footer>
  );
}

function MinimalFooter(): React.JSX.Element {
  return (
    <footer aria-label="Footer SinggahIn" className="py-6 text-center text-xs text-gray-400 border-t border-gray-200/80 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p>&copy; {new Date().getFullYear()} SinggahIn. Seluruh hak cipta dilindungi undang-undang.</p>
      </div>
    </footer>
  );
}

export function Footer(): React.JSX.Element {
  const { pathname } = useLocation();
  const onRoute = () => window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  if (isDashboardMode(pathname)) {
    return <MinimalFooter />;
  }
  return <FullFooter onRoute={onRoute} />;
}
