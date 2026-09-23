import { useState } from 'react';
import { useForm, UseFormSetValue } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { propertyFormSchema, PropertyFormData } from '../schemas/property.schema';
import { usePropertyCategories } from './useProperties';
import { propertyApi } from '../services/property.api';
import { GeocodeSuggestion } from '../property.types';

function applyGeocode(
  data: { formattedAddress?: string; formatted?: string; address?: string; city?: string },
  setValue: UseFormSetValue<PropertyFormData>
): void {
  const addressText = data.formattedAddress || data.formatted || data.address;
  if (addressText) setValue('address', addressText, { shouldValidate: true });
  if (data.city) setValue('city', data.city, { shouldValidate: true });
}

type FeedbackSetter = (f: string | null) => void;

export async function detectAddressFromCoords(
  lat: number, lng: number, setValue: UseFormSetValue<PropertyFormData>,
  setDetecting: (d: boolean) => void, setFeedback: FeedbackSetter
): Promise<void> {
  if (!lat || !lng) return setFeedback('Tentukan titik di peta terlebih dahulu.');
  try {
    setDetecting(true); setFeedback(null);
    const res = await propertyApi.reverseGeocode(lat, lng);
    applyGeocode(res.data, setValue);
    setFeedback('Alamat & kota berhasil dideteksi dari titik koordinat peta.');
  } catch (err: unknown) {
    setFeedback(err instanceof Error ? err.message : 'Gagal mendeteksi alamat.');
  } finally { setDetecting(false); }
}

function usePropertyFormData(initialData?: Partial<PropertyFormData>) {
  return useForm<PropertyFormData>({
    resolver: zodResolver(propertyFormSchema) as any,
    defaultValues: {
      title: initialData?.title || '',
      categoryId: initialData?.categoryId || '',
      description: initialData?.description || '',
      city: initialData?.city || '',
      address: initialData?.address || '',
      latitude: initialData?.latitude ?? -6.2088,
      longitude: initialData?.longitude ?? 106.8456,
      facilities: initialData?.facilities || [],
    },
  });
}

function usePropertyGeocoding(setValue: UseFormSetValue<PropertyFormData>, lat: number, lng: number) {
  const [detecting, setDetecting] = useState(false);
  const [geoFeedback, setFeedback] = useState<string | null>(null);
  const onMapChange = (newLat: number, newLng: number) => {
    setValue('latitude', newLat, { shouldValidate: true });
    setValue('longitude', newLng, { shouldValidate: true });
  };
  const onLocationDetected = (newLat: number, newLng: number) => {
    onMapChange(newLat, newLng);
    detectAddressFromCoords(newLat, newLng, setValue, setDetecting, (msg) => setFeedback(msg ? `Lokasi saat ini terdeteksi. ${msg}` : null));
  };
  const onDetectAddress = () => detectAddressFromCoords(lat, lng, setValue, setDetecting, setFeedback);
  return { detecting, geoFeedback, setFeedback, onMapChange, onLocationDetected, onDetectAddress };
}

function applySuggestion(item: GeocodeSuggestion, setValue: UseFormSetValue<PropertyFormData>, setFeedback: (msg: string) => void) {
  setValue('address', item.formattedAddress, { shouldValidate: true });
  if (item.city) setValue('city', item.city, { shouldValidate: true });
  setValue('latitude', item.latitude, { shouldValidate: true });
  setValue('longitude', item.longitude, { shouldValidate: true });
  setFeedback(`Pin peta dipindahkan ke: ${item.formattedAddress}`);
}

export function usePropertyFormState(initialData?: Partial<PropertyFormData>) {
  const { data: categories = [], isLoading: loadingCategories } = usePropertyCategories();
  const form = usePropertyFormData(initialData);
  const { watch, setValue } = form;
  const [lat, lng, facilities] = [watch('latitude'), watch('longitude'), watch('facilities') || []];
  const geo = usePropertyGeocoding(setValue, lat, lng);
  const onSelectSuggestion = (item: GeocodeSuggestion) => applySuggestion(item, setValue, geo.setFeedback);
  const onFacilitiesChange = (facs: string[]) => setValue('facilities', facs, { shouldValidate: true });

  return {
    form, categories, loadingCategories, detecting: geo.detecting, geoFeedback: geo.geoFeedback,
    lat, lng, facilities, onMapChange: geo.onMapChange, onLocationDetected: geo.onLocationDetected,
    onSelectSuggestion, onDetectAddress: geo.onDetectAddress, onFacilitiesChange,
  };
}
