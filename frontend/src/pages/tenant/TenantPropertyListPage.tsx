import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Tag } from 'lucide-react';
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

function HeaderActionButtons() {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Link to="/tenant/categories"><Button variant="outline" leftIcon={<Tag className="w-4 h-4" />}>Kelola Kategori</Button></Link>
      <Link to="/tenant/properties/new"><Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>Tambah Properti</Button></Link>
    </div>
  );
}

function PageHeader(): React.JSX.Element {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Kelola Properti</h1>
        <p className="text-sm text-gray-600 mt-1">Daftar seluruh penginapan dan properti yang Anda kelola.</p>
      </div>
      <HeaderActionButtons />
    </div>
  );
}

type PropGridProps = {
  isLoading: boolean; isError: boolean; error?: Error; properties?: Property[];
  hasFilters: boolean; onResetFilters: () => void; onSelectDelete: (p: Property) => void;
};

function PropertyGrid({ isLoading, isError, error, properties, hasFilters, onResetFilters, onSelectDelete }: PropGridProps): React.JSX.Element {
  if (isLoading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>;
  if (isError) return <Alert variant="error">{error?.message || 'Gagal memuat properti'}</Alert>;
  if (!properties || properties.length === 0) return hasFilters ? <FilteredEmptyState onReset={onResetFilters} /> : <EmptyState />;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {properties.map((prop) => <TenantPropertyCard key={prop.id} property={prop} onDelete={onSelectDelete} />)}
    </div>
  );
}

function useTenantPropertyFilter() {
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState<string | undefined>();
  const [sortBy, setSortBy] = useState<TenantPropertySortOption>('createdAt_desc');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 300);
  const resetFilters = () => { setSearch(''); setCategoryId(undefined); setSortBy('createdAt_desc'); setPage(1); };
  const onPageChange = (p: number) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  return { search, setSearch, categoryId, setCategoryId, sortBy, setSortBy, page, setPage, debouncedSearch, resetFilters, onPageChange };
}

function useTenantPropertyDelete() {
  const [target, setTarget] = useState<Property | null>(null);
  const mut = useDeleteProperty();
  const closeModal = () => { mut.reset(); setTarget(null); };
  const confirmDelete = async () => {
    if (!target) return;
    try { await mut.mutateAsync(target.id); setTarget(null); } catch (_) {}
  };
  return { target, setTarget, mut, closeModal, confirmDelete };
}

function useTenantPropertyListData(f: ReturnType<typeof useTenantPropertyFilter>) {
  const { data: categoryList } = usePropertyCategories();
  const query = useTenantPropertiesQuery({
    search: f.debouncedSearch.trim() || undefined, categoryId: f.categoryId || undefined,
    sortBy: f.sortBy, page: f.page, limit: 6,
  });
  return { categoryList, ...query };
}

export function TenantPropertyListPage(): React.JSX.Element {
  const f = useTenantPropertyFilter(), d = useTenantPropertyDelete();
  const q = useTenantPropertyListData(f);
  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader />
      <TenantPropertyFilterBar search={f.search} onSearchChange={(v) => { f.setSearch(v); f.setPage(1); }} sortBy={f.sortBy} onSortChange={(s) => { f.setSortBy(s); f.setPage(1); }} selectedCategory={f.categoryId} onSelectCategory={(c) => { f.setCategoryId(c); f.setPage(1); }} categories={q.categoryList} />
      {d.mut.isError && <Alert variant="error" className="mb-4">{(d.mut.error as Error).message}</Alert>}
      <PropertyGrid isLoading={q.isLoading} isError={q.isError} error={q.error as Error} properties={q.data?.data} hasFilters={Boolean(f.search.trim() || f.categoryId)} onResetFilters={f.resetFilters} onSelectDelete={d.setTarget} />
      {q.data?.meta && <Pagination page={f.page} totalPages={q.data.meta.totalPages} totalItems={q.data.meta.totalItems} itemLabel="properti" onPageChange={f.onPageChange} className="mt-8" />}
      <TenantPropertyDeleteModal target={d.target} isDeleting={d.mut.isPending} error={d.mut.error ? (d.mut.error as Error).message : null} onClose={d.closeModal} onConfirm={d.confirmDelete} />
    </div>
  );
}
