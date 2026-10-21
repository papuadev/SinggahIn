import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateProperty } from '../../modules/property/hooks/useProperties';
import { PropertyFormData } from '../../modules/property/schemas/property.schema';
import { PropertyForm } from '../../modules/property/components/PropertyForm';
import { Alert } from '../../components/atoms/Alert';

function CreatePageHeader(): React.JSX.Element {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-gray-900">Tambah Properti Baru</h1>
      <p className="text-sm text-gray-600 mt-1">
        Lengkapi detail informasi, pilih kategori, dan tentukan titik koordinat peta penginapan Anda.
      </p>
    </div>
  );
}

function usePropertyCreateSubmit() {
  const navigate = useNavigate();
  const mut = useCreateProperty();
  const onSubmit = async (data: PropertyFormData) => {
    await mut.mutateAsync(data);
    navigate('/tenant/properties');
  };
  return { mut, onSubmit };
}

export function TenantPropertyCreatePage(): React.JSX.Element {
  const { mut, onSubmit } = usePropertyCreateSubmit();
  const errorMsg = (mut.error as Error)?.message || 'Gagal menyimpan properti.';
  return (
    <div className="max-w-4xl mx-auto py-4">
      <CreatePageHeader />
      {mut.isError && <Alert variant="error" className="mb-6">{errorMsg}</Alert>}
      <PropertyForm onSubmit={onSubmit} isLoading={mut.isPending} submitText="Simpan & Publikasikan Properti" />
    </div>
  );
}
