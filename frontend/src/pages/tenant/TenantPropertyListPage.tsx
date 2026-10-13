import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Property, TenantPropertySortOption } from '../../modules/property/property.types';
import { useTenantPropertiesQuery, usePropertyCategories, useDeleteProperty } from '../../modules/property/hooks/useProperties';
import { Button } from '../../components/atoms/Button';
import { Alert } from '../../components/atoms/Alert';
import { Spinner } from '../../components/atoms/Spinner';
import { Pagination } from '../../components/molecules/Pagination';
import { useDebounce } from '../../libs/useDebounce';
import { EmptyState, FilteredEmptyState } from './components/TenantPropertyStates';
import { TenantPropertyCard } from './components/TenantPropertyCard';
import { TenantPropertyDeleteModal } from './components/TenantPropertyDeleteModal';
import { TenantPropertyFilterBar } from './components/TenantPropertyFilterBar';

function PageHeader(): React.JSX.Element {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Kelola Properti</h1>
        <p className="text-sm text-gray-600 mt-1">Daftar seluruh penginapan dan properti yang Anda kelola.</p>
      </div>
      <Link to="/tenant/properties/new">
        <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>Tambah Properti</Button>
      </Link>
    </div>
  );
}

function PropertyGrid({
  isLoading, isError, error, properties, hasFilters, onResetFilters, onSelectDelete,
}: {
  isLoading: boolean; isError: boolean; error?: Error; properties?: Property[];
  hasFilters: boolean; onResetFilters: () => void; onSelectDelete: (p: Property) => void;
}): React.JSX.Element {
  if (isLoading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>;
  if (isError) return <Alert variant="error">{error?.message || 'Gagal memuat properti'}</Alert>;
  if (!properties || properties.length === 0) {
    return hasFilters ? <FilteredEmptyState onReset={onResetFilters} /> : <EmptyState />;
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {properties.map((prop) => (
        <TenantPropertyCard key={prop.id} property={prop} onDelete={onSelectDelete} />
      ))}
    </div>
  );
}

export function TenantPropertyListPage(): React.JSX.Element {
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState<string | undefined>();
  const [sortBy, setSortBy] = useState<TenantPropertySortOption>('createdAt_desc');
  const [page, setPage] = useState(1);
  const [target, setTarget] = useState<Property | null>(null);

  const debouncedSearch = useDebounce(search, 300);
  const { data: categoryList } = usePropertyCategories();
  const { data: queryRes, isLoading, isError, error } = useTenantPropertiesQuery({
    search: debouncedSearch.trim() || undefined,
    categoryId: categoryId || undefined,
    sortBy, page, limit: 6,
  });

  const deleteMutation = useDeleteProperty();
  const resetFilters = () => { setSearch(''); setCategoryId(undefined); setSortBy('createdAt_desc'); setPage(1); };
  const onPageChange = (p: number) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const confirmDelete = async () => { if (!target) return; await deleteMutation.mutateAsync(target.id); setTarget(null); };

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader />
      <TenantPropertyFilterBar
        search={search} onSearchChange={(v) => { setSearch(v); setPage(1); }}
        sortBy={sortBy} onSortChange={(s) => { setSortBy(s); setPage(1); }}
        selectedCategory={categoryId} onSelectCategory={(c) => { setCategoryId(c); setPage(1); }}
        categories={categoryList}
      />
      {deleteMutation.isError && <Alert variant="error" className="mb-4">{(deleteMutation.error as Error).message}</Alert>}
      <PropertyGrid
        isLoading={isLoading} isError={isError} error={error as Error}
        properties={queryRes?.data} hasFilters={Boolean(search.trim() || categoryId)}
        onResetFilters={resetFilters} onSelectDelete={setTarget}
      />
      {queryRes?.meta && (
        <Pagination
          page={page} totalPages={queryRes.meta.totalPages} totalItems={queryRes.meta.totalItems}
          itemLabel="properti" onPageChange={onPageChange} className="mt-8"
        />
      )}
      <TenantPropertyDeleteModal
        target={target} isDeleting={deleteMutation.isPending}
        onClose={() => setTarget(null)} onConfirm={confirmDelete}
      />
    </div>
  );
}
