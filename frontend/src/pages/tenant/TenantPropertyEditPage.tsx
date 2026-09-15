import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { usePropertyDetail, useUpdateProperty } from '../../modules/property/hooks/useProperties';
import { Property } from '../../modules/property/property.types';
import { PropertyFormData } from '../../modules/property/schemas/property.schema';
import { PropertyForm } from '../../modules/property/components/PropertyForm';
import { Alert } from '../../components/atoms/Alert';
import { Spinner } from '../../components/atoms/Spinner';

function EditPageHeader(): React.JSX.Element {
  return (
    <div className="mb-6">
      <Link
        to="/tenant/properties"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors mb-3"
      >
        <ArrowLeft className="w-4 h-4" /> Kembali ke Kelola Properti
      </Link>
      <h1 className="text-2xl font-bold text-gray-900">Ubah Properti</h1>
      <p className="text-sm text-gray-600 mt-1">
        Perbarui informasi, kategori, atau titik lokasi peta penginapan Anda.
      </p>
    </div>
  );
}

function toInitialData(property: Property): PropertyFormData {
  return {
    title: property.title,
    description: property.description,
    categoryId: property.categoryId,
    address: property.address,
    city: property.city,
    latitude: property.latitude,
    longitude: property.longitude,
  };
}

interface EditFormSectionProps {
  property: Property;
  id: string;
  navigate: (to: string) => void;
}

function EditFormSection({ property, id, navigate }: EditFormSectionProps): React.JSX.Element {
  const updateMutation = useUpdateProperty(id);
  const handleSubmit = async (data: PropertyFormData) => {
    await updateMutation.mutateAsync(data);
    navigate('/tenant/properties');
  };

  return (
    <>
      {updateMutation.isError && <Alert variant="error" className="mb-6">{(updateMutation.error as Error).message || 'Gagal memperbarui properti.'}</Alert>}
      <PropertyForm initialData={toInitialData(property)} onSubmit={handleSubmit} isLoading={updateMutation.isPending} submitText="Simpan Perubahan Properti" />
    </>
  );
}

export function TenantPropertyEditPage(): React.JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: property, isLoading, isError, error } = usePropertyDetail(id);

  if (isLoading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>;
  if (isError || !property || !id) {
    return <Alert variant="error">{(error as Error)?.message || 'Properti tidak ditemukan.'}</Alert>;
  }

  return (
    <div className="max-w-4xl mx-auto py-4">
      <EditPageHeader />
      <EditFormSection property={property} id={id} navigate={navigate} />
    </div>
  );
}
