import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User as UserIcon, MapPin, Info, Phone, Sparkles } from 'lucide-react';
import { useAuthStore } from '../../stores/auth.store';
import { Button } from '../atoms/Button';
import { UserMenu } from './navbar/UserMenu';

function GuestButtons(): React.JSX.Element {
  return (
    <div className="flex items-center gap-2">
      <Link to="/login"><Button variant="ghost" size="sm" leftIcon={<UserIcon className="w-4 h-4" />}>Masuk</Button></Link>
      <Link to="/register" className="hidden sm:inline-block"><Button variant="primary" size="sm">Daftar</Button></Link>
    </div>
  );
}

function BrandLogo({ isTenant }: { isTenant: boolean }): React.JSX.Element {
  return (
    <Link to={isTenant ? "/tenant/dashboard" : "/"} className="flex items-center gap-2.5">
      <img src="/logo.webp" alt="SinggahIn" className="h-8 w-auto object-contain" />
      <span className="text-2xl font-black tracking-tight text-primary-600 sr-only">SinggahIn</span>
      {isTenant && (
        <span className="hidden sm:inline-block px-2 py-0.5 text-xs font-semibold bg-primary-50 text-primary-700 rounded-md border border-primary-100">
          Tenant
        </span>
      )}
    </Link>
  );
}

function handleScrollTo(e: React.MouseEvent<HTMLAnchorElement>, id: string) {
  e.preventDefault();
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' });
    window.history.pushState(null, '', `#${id}`);
  }
}

function DesktopLandingNav(): React.JSX.Element {
  return (
    <nav aria-label="Navigasi Halaman Utama" className="hidden md:flex items-center gap-6 lg:gap-8">
      <a href="#rekomendasi" onClick={(e) => handleScrollTo(e, 'rekomendasi')} className="group inline-flex items-center gap-1.5 text-sm font-semibold text-gray-700 hover:text-primary-600 transition-colors">
        <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400 animate-blink" />
        <span>Rekomendasi Penginapan</span>
      </a>
      <a href="#terdekat" onClick={(e) => handleScrollTo(e, 'terdekat')} className="text-sm font-semibold text-gray-600 hover:text-primary-600 transition-colors">Penginapan Terdekat</a>
      <a href="#about-us" onClick={(e) => handleScrollTo(e, 'about-us')} className="text-sm font-semibold text-gray-600 hover:text-primary-600 transition-colors">About Us</a>
      <a href="#contact-us" onClick={(e) => handleScrollTo(e, 'contact-us')} className="text-sm font-semibold text-gray-600 hover:text-primary-600 transition-colors">Contact Us</a>
    </nav>
  );
}

const MOBILE_NAV_LINKS = [
  { id: 'rekomendasi', label: 'Rekomendasi Penginapan', icon: <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400 animate-blink" />, cls: 'bg-amber-50/90 border border-amber-200 text-amber-900 hover:bg-amber-100' },
  { id: 'terdekat', label: 'Penginapan Terdekat', icon: <MapPin className="w-3.5 h-3.5 text-primary-500" />, cls: 'bg-gray-100/90 hover:bg-primary-50 text-gray-700 hover:text-primary-700' },
  { id: 'about-us', label: 'About Us', icon: <Info className="w-3.5 h-3.5 text-sky-500" />, cls: 'bg-gray-100/90 hover:bg-primary-50 text-gray-700 hover:text-primary-700' },
  { id: 'contact-us', label: 'Contact Us', icon: <Phone className="w-3.5 h-3.5 text-emerald-500" />, cls: 'bg-gray-100/90 hover:bg-primary-50 text-gray-700 hover:text-primary-700' },
];

function MobileLandingNav(): React.JSX.Element {
  return (
    <nav aria-label="Navigasi Cepat Penginapan" className="md:hidden border-t border-gray-100 bg-white/95 backdrop-blur-xs px-3 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth">
      {MOBILE_NAV_LINKS.map((l) => (
        <a key={l.id} href={`#${l.id}`} onClick={(e) => handleScrollTo(e, l.id)} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors shrink-0 active:scale-95 ${l.cls}`}>
          {l.icon} {l.label}
        </a>
      ))}
    </nav>
  );
}

function NavbarContent({ isLandingPage, isTenant, isAuthenticated }: { isLandingPage: boolean; isTenant: boolean; isAuthenticated: boolean }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <BrandLogo isTenant={isTenant} />
      {isLandingPage && <DesktopLandingNav />}
      <div className="flex items-center gap-2">{isAuthenticated ? <UserMenu /> : <GuestButtons />}</div>
    </div>
  );
}

export function Navbar(): React.JSX.Element {
  const location = useLocation();
  const { isAuthenticated, user } = useAuthStore();
  const isTenant = user?.role === 'TENANT';
  const isLandingPage = location.pathname === '/' && !isTenant;

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <NavbarContent isLandingPage={isLandingPage} isTenant={isTenant} isAuthenticated={isAuthenticated} />
      {isLandingPage && <MobileLandingNav />}
    </header>
  );
}
