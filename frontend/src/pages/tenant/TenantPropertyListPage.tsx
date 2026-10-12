import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Building2, MapPin, Edit, Trash2, Search, RotateCcw } from 'lucide-react';
import { Property, TenantPropertySortOption } from '../../modules/property/property.types';
import { useTenantPropertiesQuery, usePropertyCategories, useDeleteProperty } from '../../modules/property/hooks/useProperties';
import { Button } from '../../components/atoms/Button';
import { Badge } from '../../components/atoms/Badge';
import { Input } from '../../components/atoms/Input';
import { Select } from '../../components/atoms/Select';
import { Alert } from '../../components/atoms/Alert';
import { Spinner } from '../../components/atoms/Spinner';
import { Modal } from '../../components/molecules/Modal';
import { Pagination } from '../../components/molecules/Pagination';
import { useDebounce } from '../../libs/useDebounce';

function EmptyState(): React.JSX.Element {
  return (
    <div className="text-center py-16 bg-white rounded-xl border border-gray-200 p-8 shadow-xs">
      <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
      <h3 className="text-lg font-bold text-gray-900 mb-1">Belum Ada Properti</h3>
      <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
        Mulai sewakan penginapan Anda dengan menambahkan properti baru.
      </p>
      <Link to="/tenant/properties/new">
        <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
          Tambah Properti Pertama
        </Button>
      </Link>
    </div>
  );
}

function FilteredEmptyState({ onReset }: { onReset: () => void }): React.JSX.Element {
  return (
    <div className="text-center py-16 bg-white rounded-xl border border-gray-200 p-8 shadow-xs">
      <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
      <h3 className="text-lg font-bold text-gray-900 mb-1">Tidak Ada Properti yang Sesuai</h3>
      <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
        Tidak ada properti yang cocok dengan filter atau kata kunci pencarian Anda. Coba ubah atau reset filter.
      </p>
      <Button variant="outline" size="sm" onClick={onReset} leftIcon={<RotateCcw className="w-4 h-4" />}>
        Reset Filter
      </Button>
    </div>
  );
}

interface PropertyCardProps {
  property: Property;
  onDelete: (prop: Property) => void;
}

function CardActions({ property, onDelete }: PropertyCardProps): React.JSX.Element {
  return (
    <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
      <Link to={`/tenant/properties/${property.id}/edit`}>
        <Button variant="outline" size="sm" leftIcon={<Edit className="w-4 h-4" />}>
          Ubah
        </Button>
      </Link>
      <Button
        variant="ghost"
        size="sm"
        className="text-rose-600 hover:bg-rose-50"
        leftIcon={<Trash2 className="w-4 h-4" />}
        onClick={() => onDelete(property)}
      >
        Hapus
      </Button>
    </div>
  );
}

function CardDetails({ property }: { property: Property }): React.JSX.Element {
  return (
    <div className="text-xs text-gray-500 space-y-1 mb-4">
      <p className="flex items-center gap-1 font-medium text-gray-700">
        <MapPin className="w-3.5 h-3.5 text-primary-600 shrink-0" /> {property.city}
      </p>
      <p className="truncate pl-4.5">{property.address}</p>
    </div>
  );
}

function PropertyCard({ property, onDelete }: PropertyCardProps): React.JSX.Element {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-base font-bold text-gray-900 line-clamp-1">{property.title}</h3>
          <Badge variant="neutral">{property.category?.name || 'Umum'}</Badge>
        </div>
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">{property.description}</p>
        <CardDetails property={property} />
      </div>
      <CardActions property={property} onDelete={onDelete} />
    </div>
  );
}

function DeleteFooter({ onClose, onConfirm, isDeleting }: { onClose: () => void; onConfirm: () => void; isDeleting: boolean }) {
  return (
    <>
      <Button variant="ghost" onClick={onClose} disabled={isDeleting}>Batal</Button>
      <Button variant="danger" onClick={onConfirm} isLoading={isDeleting}>Hapus Properti</Button>
    </>
  );
}

interface DeleteDialogProps {
  target: Property | null;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

function DeleteDialog({ target, isDeleting, onClose, onConfirm }: DeleteDialogProps): React.JSX.Element {
  return (
    <Modal
      isOpen={Boolean(target)}
      onClose={onClose}
      title="Hapus Properti"
      description={`Yakin ingin menghapus properti "${target?.title}"?`}
      footer={<DeleteFooter onClose={onClose} onConfirm={onConfirm} isDeleting={isDeleting} />}
    >
      <p className="text-sm text-gray-600">Seluruh data kamar dan konfigurasi tarif properti ini akan terhapus secara permanen.</p>
    </Modal>
  );
}

function PageHeader(): React.JSX.Element {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Kelola Properti</h1>
        <p className="text-sm text-gray-600 mt-1">Daftar seluruh penginapan dan properti yang Anda kelola.</p>
      </div>
      <Link to="/tenant/properties/new">
        <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
          Tambah Properti
        </Button>
      </Link>
    </div>
  );
}

interface FilterBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  sortBy: TenantPropertySortOption;
  onSortChange: (val: TenantPropertySortOption) => void;
  selectedCategory?: string;
  onSelectCategory: (id?: string) => void;
  categories?: Array<{ id: string; name: string }>;
}

function PropertyFilterBar({
  search,
  onSearchChange,
  sortBy,
  onSortChange,
  selectedCategory,
  onSelectCategory,
  categories,
}: FilterBarProps): React.JSX.Element {
  return (
    <div className="space-y-4 mb-6">
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari properti berdasarkan judul, kota, atau alamat..."
            leftIcon={<Search className="w-4 h-4 text-gray-400" />}
          />
        </div>
        <div className="w-full sm:w-52">
          <Select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as TenantPropertySortOption)}
            size="md"
          >
            <option value="createdAt_desc">Terbaru</option>
            <option value="createdAt_asc">Terlama</option>
            <option value="title_asc">Nama: A - Z</option>
            <option value="title_desc">Nama: Z - A</option>
            <option value="city_asc">Kota: A - Z</option>
          </Select>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none items-center">
        <span className="text-xs font-medium text-gray-500 mr-1 shrink-0">Kategori:</span>
        <button
          type="button"
          onClick={() => onSelectCategory(undefined)}
          className={`px-3 py-1 rounded-full text-xs shrink-0 cursor-pointer transition-colors ${
            !selectedCategory
              ? 'bg-primary-600 text-white font-semibold'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          Semua
        </button>
        {categories?.map((cat) => {
          const active = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              className={`px-3 py-1 rounded-full text-xs shrink-0 cursor-pointer transition-colors ${
                active
                  ? 'bg-primary-600 text-white font-semibold'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function PropertyListContent({
  isLoading,
  isError,
  error,
  properties,
  hasFilters,
  onResetFilters,
  onSelectDelete,
}: {
  isLoading: boolean;
  isError: boolean;
  error?: Error;
  properties?: Property[];
  hasFilters: boolean;
  onResetFilters: () => void;
  onSelectDelete: (p: Property) => void;
}): React.JSX.Element {
  if (isLoading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>;
  if (isError) return <Alert variant="error">{error?.message || 'Gagal memuat properti'}</Alert>;
  if (!properties || properties.length === 0) {
    return hasFilters ? <FilteredEmptyState onReset={onResetFilters} /> : <EmptyState />;
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {properties.map((prop) => (
        <PropertyCard key={prop.id} property={prop} onDelete={onSelectDelete} />
      ))}
    </div>
  );
}

export function TenantPropertyListPage(): React.JSX.Element {
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState<string | undefined>();
  const [sortBy, setSortBy] = useState<TenantPropertySortOption>('createdAt_desc');
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search, 300);
  const { data: categoryList } = usePropertyCategories();
  const { data: queryRes, isLoading, isError, error } = useTenantPropertiesQuery({
    search: debouncedSearch.trim() || undefined,
    categoryId: categoryId || undefined,
    sortBy,
    page,
    limit: 6,
  });

  const properties = queryRes?.data || [];
  const meta = queryRes?.meta;

  const deleteMutation = useDeleteProperty();
  const [target, setTarget] = useState<Property | null>(null);

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const handleCategoryChange = (id?: string) => {
    setCategoryId(id);
    setPage(1);
  };

  const handleSortChange = (val: TenantPropertySortOption) => {
    setSortBy(val);
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearch('');
    setCategoryId(undefined);
    setSortBy('createdAt_desc');
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const confirmDelete = async () => {
    if (!target) return;
    await deleteMutation.mutateAsync(target.id);
    setTarget(null);
  };

  const hasFilters = Boolean(search.trim() || categoryId);

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader />
      <PropertyFilterBar
        search={search}
        onSearchChange={handleSearchChange}
        sortBy={sortBy}
        onSortChange={handleSortChange}
        selectedCategory={categoryId}
        onSelectCategory={handleCategoryChange}
        categories={categoryList}
      />
      {deleteMutation.isError && (
        <Alert variant="error" className="mb-4">
          {(deleteMutation.error as Error).message}
        </Alert>
      )}
      <PropertyListContent
        isLoading={isLoading}
        isError={isError}
        error={error as Error}
        properties={properties}
        hasFilters={hasFilters}
        onResetFilters={handleResetFilters}
        onSelectDelete={setTarget}
      />
      {meta && (
        <Pagination
          page={page}
          totalPages={meta.totalPages}
          totalItems={meta.totalItems}
          itemLabel="properti"
          onPageChange={handlePageChange}
          className="mt-8"
        />
      )}
      <DeleteDialog
        target={target}
        isDeleting={deleteMutation.isPending}
        onClose={() => setTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
