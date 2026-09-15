import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Building2, MapPin, Edit, Trash2 } from 'lucide-react';
import { Property } from '../../modules/property/property.types';
import { useTenantProperties, useDeleteProperty } from '../../modules/property/hooks/useProperties';
import { Button } from '../../components/atoms/Button';
import { Badge } from '../../components/atoms/Badge';
import { Alert } from '../../components/atoms/Alert';
import { Spinner } from '../../components/atoms/Spinner';
import { Modal } from '../../components/molecules/Modal';

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
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
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

function PropertyListContent({
  isLoading, isError, error, properties, onSelectDelete,
}: {
  isLoading: boolean; isError: boolean; error?: Error;
  properties?: Property[]; onSelectDelete: (p: Property) => void;
}): React.JSX.Element {
  if (isLoading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>;
  if (isError) return <Alert variant="error">{error?.message || 'Gagal memuat properti'}</Alert>;
  if (!properties || properties.length === 0) return <EmptyState />;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {properties.map((prop) => (
        <PropertyCard key={prop.id} property={prop} onDelete={onSelectDelete} />
      ))}
    </div>
  );
}

export function TenantPropertyListPage(): React.JSX.Element {
  const { data: properties, isLoading, isError, error } = useTenantProperties();
  const deleteMutation = useDeleteProperty();
  const [target, setTarget] = useState<Property | null>(null);

  const confirmDelete = async () => {
    if (!target) return;
    await deleteMutation.mutateAsync(target.id);
    setTarget(null);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader />
      {deleteMutation.isError && <Alert variant="error" className="mb-4">{(deleteMutation.error as Error).message}</Alert>}
      <PropertyListContent isLoading={isLoading} isError={isError} error={error as Error} properties={properties} onSelectDelete={setTarget} />
      <DeleteDialog target={target} isDeleting={deleteMutation.isPending} onClose={() => setTarget(null)} onConfirm={confirmDelete} />
    </div>
  );
}
