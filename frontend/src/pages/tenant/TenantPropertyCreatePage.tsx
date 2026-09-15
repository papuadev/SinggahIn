import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useCreateProperty } from '../../modules/property/hooks/useProperties';
import { PropertyFormData } from '../../modules/property/schemas/property.schema';
import { PropertyForm } from '../../modules/property/components/PropertyForm';
import { Alert } from '../../components/atoms/Alert';

function CreatePageHeader(): React.JSX.Element {
  return (
    <div className="mb-6">
      <Link
        to="/tenant/properties"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors mb-3"
      >
        <ArrowLeft className="w-4 h-4" /> Kembali ke Kelola Properti
      </Link>
      <h1 className="text-2xl font-bold text-gray-900">Tambah Properti Baru</h1>
      <p className="text-sm text-gray-600 mt-1">
        Lengkapi detail informasi, pilih kategori, dan tentukan titik koordinat peta penginapan Anda.
      </p>
    </div>
  );
}

export function TenantPropertyCreatePage(): React.JSX.Element {
  const navigate = useNavigate();
  const createMutation = useCreateProperty();

  const handleSubmit = async (data: PropertyFormData) => {
    await createMutation.mutateAsync(data);
    navigate('/tenant/properties');
  };

  return (
    <div className="max-w-4xl mx-auto py-4">
      <CreatePageHeader />
      {createMutation.isError && <Alert variant="error" className="mb-6">{(createMutation.error as Error).message || 'Gagal menyimpan properti.'}</Alert>}
      <PropertyForm onSubmit={handleSubmit} isLoading={createMutation.isPending} submitText="Simpan & Publikasikan Properti" />
    </div>
  );
}
