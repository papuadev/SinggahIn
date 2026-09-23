import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Building2, Image as ImageIcon, BedDouble } from 'lucide-react';
import { usePropertyDetail, useUpdateProperty } from '../../modules/property/hooks/useProperties';
import { Property } from '../../modules/property/property.types';
import { PropertyFormData } from '../../modules/property/schemas/property.schema';
import { PropertyForm } from '../../modules/property/components/PropertyForm';
import { PropertyGalleryManager } from '../../modules/property/components/PropertyGalleryManager';
import { RoomListSection } from '../../modules/room/components/RoomListSection';
import { Alert } from '../../components/atoms/Alert';
import { Spinner } from '../../components/atoms/Spinner';

export type EditTab = 'info' | 'gallery' | 'rooms';

function EditPageHeader({ propertyTitle }: { propertyTitle?: string }): React.JSX.Element {
  return (
    <div className="mb-6">
      <Link to="/tenant/properties" className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors mb-3">
        <ArrowLeft className="w-4 h-4" /> Kembali ke Kelola Properti
      </Link>
      <h1 className="text-2xl font-bold text-gray-900">Ubah Properti</h1>
      <p className="text-sm text-gray-600 mt-1">
        {propertyTitle ? `Kelola ${propertyTitle}: perbarui informasi, galeri foto, dan tipe kamar.` : 'Perbarui informasi penginapan Anda.'}
      </p>
    </div>
  );
}

interface TabBtnProps {
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  count?: number;
  onClick: () => void;
}

function TabButton({ label, icon, isActive, count, onClick }: TabBtnProps): React.JSX.Element {
  const activeClass = 'bg-primary-600 text-white shadow-xs';
  const inactiveClass = 'text-gray-600 hover:text-gray-900 hover:bg-gray-100';
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg transition-all ${isActive ? activeClass : inactiveClass}`}
    >
      {icon}
      <span>{label}</span>
      {typeof count === 'number' && (
        <span className={`text-xs px-1.5 py-0.5 rounded-full ${isActive ? 'bg-primary-700 text-white' : 'bg-gray-200 text-gray-700'}`}>
          {count}
        </span>
      )}
    </button>
  );
}

function EditPageTabs({ activeTab, setActiveTab, imageCount }: {
  activeTab: EditTab;
  setActiveTab: (t: EditTab) => void;
  imageCount: number;
}): React.JSX.Element {
  return (
    <div className="flex items-center gap-2 p-1 bg-gray-50 rounded-xl border border-gray-200 mb-6 overflow-x-auto">
      <TabButton label="Informasi Dasar" icon={<Building2 className="w-4 h-4" />} isActive={activeTab === 'info'} onClick={() => setActiveTab('info')} />
      <TabButton label="Galeri Foto" icon={<ImageIcon className="w-4 h-4" />} isActive={activeTab === 'gallery'} count={imageCount} onClick={() => setActiveTab('gallery')} />
      <TabButton label="Tipe & Tarif Kamar" icon={<BedDouble className="w-4 h-4" />} isActive={activeTab === 'rooms'} onClick={() => setActiveTab('rooms')} />
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
    facilities: property.facilities || [],
  };
}

function EditInfoSection({ property, id }: { property: Property; id: string }): React.JSX.Element {
  const navigate = useNavigate();
  const updateMutation = useUpdateProperty(id);
  const handleSubmit = async (data: PropertyFormData) => {
    await updateMutation.mutateAsync(data);
    navigate('/tenant/properties');
  };

  return (
    <>
      {updateMutation.isError && (
        <Alert variant="error" className="mb-6">{(updateMutation.error as Error).message || 'Gagal memperbarui properti.'}</Alert>
      )}
      <PropertyForm
        initialData={toInitialData(property)}
        onSubmit={handleSubmit}
        isLoading={updateMutation.isPending}
        submitText="Simpan Perubahan Properti"
      />
    </>
  );
}

export function TenantPropertyEditPage(): React.JSX.Element {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<EditTab>('info');
  const { data: property, isLoading, isError, error, refetch } = usePropertyDetail(id);

  if (isLoading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>;
  if (isError || !property || !id) {
    return <Alert variant="error">{(error as Error)?.message || 'Properti tidak ditemukan.'}</Alert>;
  }

  return (
    <div className="max-w-4xl mx-auto py-4">
      <EditPageHeader propertyTitle={property.title} />
      <EditPageTabs activeTab={activeTab} setActiveTab={setActiveTab} imageCount={property.images?.length ?? 0} />
      {activeTab === 'info' && <EditInfoSection property={property} id={id} />}
      {activeTab === 'gallery' && (
        <PropertyGalleryManager propertyId={id} images={property.images || []} onImagesUpdated={() => refetch()} />
      )}
      {activeTab === 'rooms' && <RoomListSection propertyId={id} />}
    </div>
  );
}
