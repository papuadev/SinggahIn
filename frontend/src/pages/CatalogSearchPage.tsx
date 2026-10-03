import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { propertyApi } from '../modules/property/services/property.api';
import { CatalogQueryParams } from '../modules/property/property.types';
import {
  FloatingSearchWidget,
  SearchWidgetValues,
} from '../components/organisms/FloatingSearchWidget';
import { CatalogSortSelect } from '../components/organisms/catalog/CatalogSortSelect';
import { CatalogPropertyGrid } from '../components/organisms/catalog/CatalogPropertyGrid';
import { CatalogPagination } from '../components/organisms/catalog/CatalogPagination';
import { SEOHead } from '../components/atoms/SEOHead';

function parseQueryParams(searchParams: URLSearchParams): CatalogQueryParams {
  return {
    city: searchParams.get('city') || undefined,
    category: searchParams.get('category') || undefined,
    checkIn: searchParams.get('checkIn') || undefined,
    checkOut: searchParams.get('checkOut') || undefined,
    guests: searchParams.get('guests') ? Number(searchParams.get('guests')) : undefined,
    sortBy: (searchParams.get('sortBy') as 'price' | 'name') || 'price',
    sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'asc',
    page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
    limit: 12,
  };
}

function buildWidgetSearchParams(values: SearchWidgetValues, current: CatalogQueryParams) {
  const next = new URLSearchParams();
  if (values.city) next.set('city', values.city);
  if (values.category) next.set('category', values.category);
  if (values.checkIn) next.set('checkIn', values.checkIn);
  if (values.checkOut) next.set('checkOut', values.checkOut);
  if (values.guests > 1) next.set('guests', String(values.guests));
  if (current.sortBy) next.set('sortBy', current.sortBy);
  if (current.sortOrder) next.set('sortOrder', current.sortOrder);
  return next;
}

function handleCategoryUpdate(params: URLSearchParams, setParams: (p: URLSearchParams) => void, cat: string) {
  const next = new URLSearchParams(params);
  if (cat) next.set('category', cat);
  else next.delete('category');
  next.set('page', '1');
  setParams(next);
}

function applyNavParam(params: URLSearchParams, setParams: (p: URLSearchParams) => void, mutator: (n: URLSearchParams) => void) {
  const next = new URLSearchParams(params);
  mutator(next);
  setParams(next);
}

function useCatalogNav(params: URLSearchParams, setParams: (p: URLSearchParams) => void) {
  const onSort = (by: 'price' | 'name' | 'rating', order: 'asc' | 'desc') => {
    applyNavParam(params, setParams, (n) => { n.set('sortBy', by); n.set('sortOrder', order); n.set('page', '1'); });
  };
  const onPage = (p: number) => {
    applyNavParam(params, setParams, (n) => n.set('page', String(p)));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  return { onSort, onPage };
}

function useCatalogQuery(searchParams: URLSearchParams, queryParams: CatalogQueryParams) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['catalog', searchParams.toString()],
    queryFn: () => propertyApi.getCatalog(queryParams),
  });
  return { properties: data?.data || [], meta: data?.meta, isLoading, isError };
}

function useCatalogSearch() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParams = parseQueryParams(searchParams);
  const qData = useCatalogQuery(searchParams, queryParams);
  const nav = useCatalogNav(searchParams, setSearchParams);
  const onSearch = (v: SearchWidgetValues) => setSearchParams(buildWidgetSearchParams(v, queryParams));
  const onCat = (cat: string) => handleCategoryUpdate(searchParams, setSearchParams, cat);
  return { queryParams, ...qData, onSearch, onCategoryChange: onCat, ...nav, reset: () => setSearchParams({}) };
}

function SearchHeaderTitle({ city, category, total }: { city?: string; category?: string; total: number }) {
  const title = city ? `Penginapan di ${city}` : 'Semua Penginapan';
  const sub = category ? `Kategori ${category} • ` : '';
  return (
    <div>
      <h1 className="text-xl sm:text-2xl font-black text-gray-900">{title}</h1>
      <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
        {sub}Ditemukan <strong className="text-gray-900">{total}</strong> penginapan
      </p>
    </div>
  );
}

type HeaderProps = {
  city?: string; category?: string; total: number;
  sortBy: 'price' | 'name' | 'rating'; sortOrder: 'asc' | 'desc';
  onSortChange: (by: 'price' | 'name' | 'rating', order: 'asc' | 'desc') => void;
};

function SearchHeader(p: HeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 my-6 pb-4 border-b border-gray-200">
      <SearchHeaderTitle city={p.city} category={p.category} total={p.total} />
      <CatalogSortSelect sortBy={p.sortBy} sortOrder={p.sortOrder} onChange={p.onSortChange} />
    </div>
  );
}

function CatalogWidget({
  q, onSearch, onCat,
}: {
  q: CatalogQueryParams; onSearch: (v: SearchWidgetValues) => void; onCat: (c: string) => void;
}) {
  const init = { city: q.city, category: q.category, checkIn: q.checkIn, checkOut: q.checkOut, guests: q.guests || 1 };
  return <FloatingSearchWidget initialValues={init} onSearch={onSearch} onCategoryChange={onCat} />;
}

function getCatalogSEOTitle(city?: string, category?: string): string {
  if (city && category) return `Sewa ${category} di ${city}`;
  if (city) return `Sewa Penginapan Murah di ${city}`;
  if (category) return `Daftar ${category} Pilihan`;
  return 'Katalog Penginapan & Villa Murah';
}

export function CatalogSearchPage(): React.JSX.Element {
  const s = useCatalogSearch();
  const m = s.meta || { page: 1, limit: 12, totalItems: 0, totalPages: 0 };
  const { city, category, sortBy = 'price', sortOrder = 'asc' } = s.queryParams;
  return (
    <div className="w-full flex flex-col py-4">
      <SEOHead title={getCatalogSEOTitle(city, category)} />
      <CatalogWidget q={s.queryParams} onSearch={s.onSearch} onCat={s.onCategoryChange} />
      <SearchHeader city={city} category={category} total={m.totalItems} sortBy={sortBy} sortOrder={sortOrder} onSortChange={s.onSort} />
      <CatalogPropertyGrid properties={s.properties} isLoading={s.isLoading} isError={s.isError} checkIn={s.queryParams.checkIn} checkOut={s.queryParams.checkOut} onResetFilters={s.reset} />
      <CatalogPagination page={m.page} totalPages={m.totalPages} totalItems={m.totalItems} onPageChange={s.onPage} />
    </div>
  );
}
