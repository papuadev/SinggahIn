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

function useCatalogSearch() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParams = parseQueryParams(searchParams);
  const { data, isLoading, isError } = useQuery({
    queryKey: ['catalog', searchParams.toString()],
    queryFn: () => propertyApi.getCatalog(queryParams),
  });

  const onSearch = (v: SearchWidgetValues) => setSearchParams(buildWidgetSearchParams(v, queryParams));
  const onSort = (by: 'price' | 'name', order: 'asc' | 'desc') => {
    const next = new URLSearchParams(searchParams);
    next.set('sortBy', by);
    next.set('sortOrder', order);
    next.set('page', '1');
    setSearchParams(next);
  };
  const onPage = (p: number) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(p));
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return {
    queryParams,
    properties: data?.data || [],
    meta: data?.meta || { page: 1, limit: 12, totalItems: 0, totalPages: 0 },
    isLoading,
    isError,
    onSearch,
    onSort,
    onPage,
    reset: () => setSearchParams({}),
  };
}

function SearchHeader({
  city,
  category,
  total,
  sortBy,
  sortOrder,
  onSortChange,
}: {
  city?: string;
  category?: string;
  total: number;
  sortBy: 'price' | 'name';
  sortOrder: 'asc' | 'desc';
  onSortChange: (by: 'price' | 'name', order: 'asc' | 'desc') => void;
}) {
  const title = city ? `Penginapan di ${city}` : 'Semua Penginapan';
  const subtitle = category ? `Kategori ${category} • ` : '';
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 my-6 pb-4 border-b border-gray-200">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-gray-900">{title}</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
          {subtitle}Ditemukan <strong className="text-gray-900">{total}</strong> penginapan
        </p>
      </div>
      <CatalogSortSelect sortBy={sortBy} sortOrder={sortOrder} onChange={onSortChange} />
    </div>
  );
}

export function CatalogSearchPage(): React.JSX.Element {
  const { queryParams, properties, meta, isLoading, isError, onSearch, onSort, onPage, reset } =
    useCatalogSearch();

  return (
    <div className="w-full flex flex-col py-4">
      <FloatingSearchWidget
        initialValues={{
          city: queryParams.city,
          category: queryParams.category,
          checkIn: queryParams.checkIn,
          checkOut: queryParams.checkOut,
          guests: queryParams.guests || 1,
        }}
        onSearch={onSearch}
      />
      <SearchHeader
        city={queryParams.city}
        category={queryParams.category}
        total={meta.totalItems}
        sortBy={queryParams.sortBy || 'price'}
        sortOrder={queryParams.sortOrder || 'asc'}
        onSortChange={onSort}
      />
      <CatalogPropertyGrid
        properties={properties}
        isLoading={isLoading}
        isError={isError}
        checkIn={queryParams.checkIn}
        checkOut={queryParams.checkOut}
        onResetFilters={reset}
      />
      <CatalogPagination
        page={meta.page}
        totalPages={meta.totalPages}
        totalItems={meta.totalItems}
        onPageChange={onPage}
      />
    </div>
  );
}
