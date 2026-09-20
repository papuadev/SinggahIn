import React, { useState, useEffect, useRef } from 'react';
import { useForm, UseFormSetValue, UseFormRegister } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Sparkles, MapPin } from 'lucide-react';
import { propertyFormSchema, PropertyFormData } from '../schemas/property.schema';
import { usePropertyCategories } from '../hooks/useProperties';
import { propertyApi } from '../services/property.api';
import { PropertyCategory, GeocodeSuggestion } from '../property.types';
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
  data: { formattedAddress?: string; formatted?: string; address?: string; city?: string },
  setValue: UseFormSetValue<PropertyFormData>
): void {
  const addressText = data.formattedAddress || data.formatted || data.address;
  if (addressText) setValue('address', addressText, { shouldValidate: true });
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

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<GeocodeSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const autocompleteRef = useRef<HTMLDivElement>(null);

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

  const handleCurrentLocation = async (newLat: number, newLng: number) => {
    onMapChange(newLat, newLng);
    await triggerDetectAddress(
      newLat,
      newLng,
      setValue,
      setDetecting,
      (msg) => setGeoFeedback(msg ? `Lokasi saat ini terdeteksi. ${msg}` : null)
    );
  };

  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 3) {
      setSuggestions([]);
      setShowDropdown(false);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await propertyApi.searchGeocode(searchQuery.trim());
        if (res?.data && res.data.length > 0) {
          setSuggestions(res.data);
          setShowDropdown(true);
        } else {
          setSuggestions([]);
          setShowDropdown(true);
        }
      } catch {
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (autocompleteRef.current && !autocompleteRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectSuggestion = (item: GeocodeSuggestion) => {
    setValue('address', item.formattedAddress, { shouldValidate: true });
    if (item.city) {
      setValue('city', item.city, { shouldValidate: true });
    }
    setValue('latitude', item.latitude, { shouldValidate: true });
    setValue('longitude', item.longitude, { shouldValidate: true });
    setShowDropdown(false);
    setSuggestions([]);
    setSearchQuery('');
    setGeoFeedback(`Pin peta dipindahkan ke: ${item.formattedAddress}`);
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

        <div ref={autocompleteRef} className="relative">
          <FormField label="Alamat Lengkap" required error={errors.address?.message}>
            <Input
              placeholder="Contoh: Jl. Kolonel Masturi No. 88"
              hasError={Boolean(errors.address)}
              {...register('address', {
                onChange: (e) => setSearchQuery(e.target.value),
              })}
              onFocus={() => {
                if (suggestions.length > 0) setShowDropdown(true);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setShowDropdown(false);
              }}
              rightIcon={isSearching ? <Spinner size="sm" /> : undefined}
              autoComplete="off"
            />
          </FormField>

          {showDropdown && (
            <div
              className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto"
              data-testid="address-suggestions-dropdown"
            >
              {isSearching ? (
                <div className="p-3 text-xs text-gray-500 flex items-center gap-2">
                  <Spinner size="sm" /> Mencari alamat...
                </div>
              ) : suggestions.length > 0 ? (
                <ul className="divide-y divide-gray-100">
                  {suggestions.map((item, idx) => (
                    <li
                      key={`${item.latitude}-${item.longitude}-${idx}`}
                      onClick={() => handleSelectSuggestion(item)}
                      className="px-3.5 py-2.5 hover:bg-primary-50 cursor-pointer flex items-start gap-2.5 transition-colors text-left"
                      role="button"
                      tabIndex={0}
                    >
                      <MapPin className="w-4 h-4 text-primary-600 mt-0.5 shrink-0" />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-800 leading-tight">
                          {item.formattedAddress}
                        </span>
                        {item.city && (
                          <span className="text-xs text-gray-500 mt-0.5">{item.city}</span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-3 text-xs text-gray-400">Tidak ada saran alamat ditemukan</div>
              )}
            </div>
          )}
        </div>
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
        <PropertyMapPin
          latitude={lat}
          longitude={lng}
          onChange={onMapChange}
          onLocationDetected={handleCurrentLocation}
          height="280px"
        />
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

