import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

function CityCrumb({ city }: { city?: string }) {
  if (!city) return null;
  return (
    <>
      <ChevronRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
      <Link to={`/search?city=${encodeURIComponent(city)}`} className="hover:text-primary-600 transition-colors whitespace-nowrap">
        {city}
      </Link>
    </>
  );
}

function RootCrumbs() {
  return (
    <>
      <Link to="/" className="hover:text-primary-600 transition-colors whitespace-nowrap">Beranda</Link>
      <ChevronRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
      <Link to="/search" className="hover:text-primary-600 transition-colors whitespace-nowrap">Katalog</Link>
    </>
  );
}

export function PropertyDetailBreadcrumb({ title, city }: { title: string; city?: string }): React.JSX.Element {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-gray-500 py-1 overflow-x-auto">
      <RootCrumbs />
      <CityCrumb city={city} />
      <ChevronRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
      <span className="text-gray-900 font-medium truncate max-w-[200px] sm:max-w-xs">{title}</span>
    </nav>
  );
}
