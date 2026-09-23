import React from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { Sparkles } from 'lucide-react';
import { PropertyFormData } from '../schemas/property.schema';
import { PropertyCategory, GeocodeSuggestion } from '../property.types';
import { FormField } from '../../../components/molecules/FormField';
import { Input } from '../../../components/atoms/Input';
import { Button } from '../../../components/atoms/Button';
import { Spinner } from '../../../components/atoms/Spinner';
import { PropertyMapPin } from './PropertyMapPin';
import { PropertyAddressAutocomplete } from './PropertyAddressAutocomplete';
import { PropertyFacilitiesSelector } from './PropertyFacilitiesSelector';
import { usePropertyFormState } from '../hooks/usePropertyFormState';

export interface PropertyFormProps {
  initialData?: Partial<PropertyFormData>;
  onSubmit: (data: PropertyFormData) => Promise<void> | void;
  isLoading?: boolean;
  submitText?: string;
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

function PropertyDescriptionField({ register, error }: { register: UseFormRegister<PropertyFormData>; error?: string }) {
  return (
    <FormField label="Deskripsi Penginapan" required error={error}>
      <textarea
        rows={3} placeholder="Jelaskan daya tarik, fasilitas unggulan, dan suasana properti Anda..."
        className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500 placeholder:text-gray-400"
        {...register('description')}
      />
    </FormField>
  );
}

interface NameAndCatProps {
  register: UseFormRegister<PropertyFormData>;
  errors: FieldErrors<PropertyFormData>;
  categories: PropertyCategory[];
  loading: boolean;
}

function PropertyNameAndCategoryRow({ register, errors, categories, loading }: NameAndCatProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField label="Nama Properti / Penginapan" required error={errors.title?.message}>
        <Input placeholder="Contoh: Villa Alam Asri" hasError={Boolean(errors.title)} {...register('title')} />
      </FormField>
      <CategorySelectField register={register} error={errors.categoryId?.message} categories={categories} isLoading={loading} />
    </div>
  );
}

interface LocationRowProps {
  register: UseFormRegister<PropertyFormData>;
  errors: FieldErrors<PropertyFormData>;
  onSelectSuggestion: (item: GeocodeSuggestion) => void;
}

function PropertyFormLocationRow({ register, errors, onSelectSuggestion }: LocationRowProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField label="Kota" required error={errors.city?.message}>
        <Input placeholder="Contoh: Bandung" hasError={Boolean(errors.city)} {...register('city')} />
      </FormField>
      <PropertyAddressAutocomplete register={register} error={errors.address?.message} onSelectSuggestion={onSelectSuggestion} />
    </div>
  );
}

function MapHeader({ detecting, onDetect }: { detecting: boolean; onDetect: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <label className="text-sm font-semibold text-gray-800">Titik Koordinat Lokasi di Peta</label>
      <Button
        type="button" variant="ghost" size="sm" disabled={detecting} onClick={onDetect}
        leftIcon={detecting ? <Spinner size="sm" /> : <Sparkles className="w-3.5 h-3.5 text-primary-600" />}
      >
        Deteksi Alamat dari Peta
      </Button>
    </div>
  );
}

function PropertyFormMapSection({ state, errors }: { state: ReturnType<typeof usePropertyFormState>; errors: FieldErrors<PropertyFormData> }) {
  return (
    <div className="space-y-2 pt-2 border-t border-gray-100">
      <MapHeader detecting={state.detecting} onDetect={state.onDetectAddress} />
      {state.geoFeedback && <p className="text-xs text-primary-700 bg-primary-50 p-2 rounded">{state.geoFeedback}</p>}
      <PropertyMapPin latitude={state.lat} longitude={state.lng} onChange={state.onMapChange} onLocationDetected={state.onLocationDetected} height="280px" />
      {(errors.latitude || errors.longitude) && <p className="text-xs text-red-600">Koordinat peta wajib ditentukan dengan benar.</p>}
    </div>
  );
}

function PropertyFormSubmitBar({ isLoading, submitText }: { isLoading: boolean; submitText: string }) {
  return (
    <div className="pt-4 border-t border-gray-200 flex justify-end">
      <Button type="submit" variant="primary" size="md" disabled={isLoading} leftIcon={isLoading ? <Spinner size="sm" /> : undefined}>
        {isLoading ? 'Menyimpan...' : submitText}
      </Button>
    </div>
  );
}

export function PropertyForm({ initialData, onSubmit, isLoading = false, submitText = 'Simpan Properti' }: PropertyFormProps): React.JSX.Element {
  const state = usePropertyFormState(initialData);
  const { register, handleSubmit, formState: { errors } } = state.form;
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <PropertyNameAndCategoryRow register={register} errors={errors} categories={state.categories} loading={state.loadingCategories} />
      <PropertyDescriptionField register={register} error={errors.description?.message} />
      <PropertyFormLocationRow register={register} errors={errors} onSelectSuggestion={state.onSelectSuggestion} />
      <PropertyFacilitiesSelector selected={state.facilities} onChange={state.onFacilitiesChange} />
      <PropertyFormMapSection state={state} errors={errors} />
      <PropertyFormSubmitBar isLoading={isLoading} submitText={submitText} />
    </form>
  );
}
