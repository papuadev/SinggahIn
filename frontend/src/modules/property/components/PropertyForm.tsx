import React, { useState } from 'react';
import { useForm, UseFormSetValue, UseFormRegister } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Sparkles } from 'lucide-react';
import { propertyFormSchema, PropertyFormData } from '../schemas/property.schema';
import { usePropertyCategories } from '../hooks/useProperties';
import { propertyApi } from '../services/property.api';
import { PropertyCategory } from '../property.types';
import { FormField } from '../../../components/molecules/FormField';
import { Input } from '../../../components/atoms/Input';
import { Button } from '../../../components/atoms/Button';
import { Spinner } from '../../../components/atoms/Spinner';
import { PropertyMapPin } from './PropertyMapPin';

export interface PropertyFormProps {
  initialData?: Partial<PropertyFormData>;
  onSubmit: (data: PropertyFormData) => Promise<void> | void;
  isLoading?: boolean;
  submitText?: string;
}

function applyGeocodeResult(
  data: { formattedAddress?: string; city?: string },
  setValue: UseFormSetValue<PropertyFormData>
): void {
  if (data.formattedAddress) setValue('address', data.formattedAddress, { shouldValidate: true });
  if (data.city) setValue('city', data.city, { shouldValidate: true });
}

async function triggerDetectAddress(
  lat: number, lng: number, setValue: UseFormSetValue<PropertyFormData>,
  setDetecting: (d: boolean) => void, setFeedback: (f: string | null) => void
): Promise<void> {
  if (!lat || !lng) return setFeedback('Tentukan titik di peta terlebih dahulu.');
  try {
    setDetecting(true); setFeedback(null);
    const res = await propertyApi.reverseGeocode(lat, lng);
    applyGeocodeResult(res.data, setValue);
    setFeedback('Alamat & kota berhasil dideteksi dari titik koordinat peta.');
  } catch (err: unknown) {
    setFeedback(err instanceof Error ? err.message : 'Gagal mendeteksi alamat.');
  } finally {
    setDetecting(false);
  }
}

interface CategorySelectProps {
  register: UseFormRegister<PropertyFormData>;
  error?: string;
  categories: PropertyCategory[];
  isLoading: boolean;
}

function CategorySelectField({ register, error, categories, isLoading }: CategorySelectProps) {
  return (
    <FormField label="Kategori Properti" required error={error}>
      <select
        {...register('categoryId')} disabled={isLoading} aria-label="Kategori Properti"
        className="w-full rounded-lg border border-gray-300 py-2.5 px-3.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500 disabled:bg-gray-50"
      >
        <option value="">{isLoading ? 'Memuat kategori...' : '-- Pilih Kategori --'}</option>
        {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
    </FormField>
  );
}

export function PropertyForm({
  initialData,
  onSubmit,
  isLoading = false,
  submitText = 'Simpan Properti',
}: PropertyFormProps): React.JSX.Element {
  const { data: categories = [], isLoading: loadingCategories } = usePropertyCategories();
  const [detecting, setDetecting] = useState(false);
  const [geoFeedback, setGeoFeedback] = useState<string | null>(null);

  const {
    register, handleSubmit, setValue, watch, formState: { errors },
  } = useForm<PropertyFormData>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: {
      title: initialData?.title || '',
      categoryId: initialData?.categoryId || '',
      description: initialData?.description || '',
      city: initialData?.city || '',
      address: initialData?.address || '',
      latitude: initialData?.latitude ?? -6.2088,
      longitude: initialData?.longitude ?? 106.8456,
    },
  });

  const lat = watch('latitude');
  const lng = watch('longitude');

  const onMapChange = (newLat: number, newLng: number) => {
    setValue('latitude', newLat, { shouldValidate: true });
    setValue('longitude', newLng, { shouldValidate: true });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Nama Properti / Penginapan" required error={errors.title?.message}>
          <Input placeholder="Contoh: Villa Alam Asri" hasError={Boolean(errors.title)} {...register('title')} />
        </FormField>
        <CategorySelectField register={register} error={errors.categoryId?.message} categories={categories} isLoading={loadingCategories} />
      </div>

      <FormField label="Deskripsi Penginapan" required error={errors.description?.message}>
        <textarea
          rows={3}
          placeholder="Jelaskan daya tarik, fasilitas unggulan, dan suasana properti Anda..."
          className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500 placeholder:text-gray-400"
          {...register('description')}
        />
      </FormField>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Kota" required error={errors.city?.message}>
          <Input placeholder="Contoh: Bandung" hasError={Boolean(errors.city)} {...register('city')} />
        </FormField>
        <FormField label="Alamat Lengkap" required error={errors.address?.message}>
          <Input placeholder="Contoh: Jl. Kolonel Masturi No. 88" hasError={Boolean(errors.address)} {...register('address')} />
        </FormField>
      </div>

      <div className="space-y-2 pt-2 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-gray-800">Titik Koordinat Lokasi di Peta</label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={detecting}
            onClick={() => triggerDetectAddress(lat, lng, setValue, setDetecting, setGeoFeedback)}
            leftIcon={detecting ? <Spinner size="sm" /> : <Sparkles className="w-3.5 h-3.5 text-primary-600" />}
          >
            Deteksi Alamat dari Peta
          </Button>
        </div>
        {geoFeedback && <p className="text-xs text-primary-700 bg-primary-50 p-2 rounded">{geoFeedback}</p>}
        <PropertyMapPin latitude={lat} longitude={lng} onChange={onMapChange} height="280px" />
        {(errors.latitude || errors.longitude) && (
          <p className="text-xs text-red-600">Koordinat peta wajib ditentukan dengan benar.</p>
        )}
      </div>

      <div className="pt-4 border-t border-gray-200 flex justify-end">
        <Button type="submit" variant="primary" size="md" disabled={isLoading} leftIcon={isLoading ? <Spinner size="sm" /> : undefined}>
          {isLoading ? 'Menyimpan...' : submitText}
        </Button>
      </div>
    </form>
  );
}
