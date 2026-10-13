import { Instagram, Facebook, Twitter, Youtube, Linkedin } from 'lucide-react';

export const ACCOMMODATION_LINKS = [
  { label: 'Hotel & Resort', href: '/search?category=HOTEL' },
  { label: 'Villa', href: '/search?category=VILLA' },
  { label: 'Homestay', href: '/search?category=HOMESTAY' },
  { label: 'Penginapan di Jakarta', href: '/search?city=Jakarta' },
  { label: 'Penginapan di Yogyakarta', href: '/search?city=Yogyakarta' },
  { label: 'Penginapan di Bali', href: '/search?city=Bali' },
];

export const ABOUT_LINKS: { label: string; to?: string; href?: string }[] = [
  { label: 'Tentang SinggahIn', to: '/about' },
  { label: 'Visi & Misi Perusahaan', to: '/about#visi-misi' },
  { label: 'Nilai-Nilai Perusahaan', to: '/about#core-values' },
  { label: 'Daftar Mitra Properti (Tenant)', to: '/register' },
];

export const SOCIAL_LINKS = [
  { name: 'Instagram', href: 'https://instagram.com/singgahin', icon: Instagram, color: 'hover:text-pink-400 hover:bg-pink-950/40' },
  { name: 'Facebook', href: 'https://facebook.com/singgahin', icon: Facebook, color: 'hover:text-blue-400 hover:bg-blue-950/40' },
  { name: 'Twitter / X', href: 'https://x.com/singgahin', icon: Twitter, color: 'hover:text-sky-400 hover:bg-sky-950/40' },
  { name: 'YouTube', href: 'https://youtube.com/@singgahin', icon: Youtube, color: 'hover:text-red-400 hover:bg-red-950/40' },
  { name: 'LinkedIn', href: 'https://linkedin.com/company/singgahin', icon: Linkedin, color: 'hover:text-blue-300 hover:bg-blue-900/40' },
];
