import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { propertyApi } from '../services/property.api';
import { CreatePropertyPayload, UpdatePropertyPayload } from '../property.types';

export const PROPERTY_KEYS = {
  categories: ['propertyCategories'] as const,
  myProperties: ['myProperties'] as const,
  detail: (id?: string) => ['property', id] as const,
};

export function usePropertyCategories() {
  return useQuery({
    queryKey: PROPERTY_KEYS.categories,
    queryFn: async () => {
      const res = await propertyApi.getCategories();
      return res.data;
    },
    staleTime: 1000 * 60 * 60,
  });
}

export function useTenantProperties() {
  return useQuery({
    queryKey: PROPERTY_KEYS.myProperties,
    queryFn: async () => {
      const res = await propertyApi.getMyProperties();
      return res.data;
    },
  });
}

export function usePropertyDetail(id?: string) {
  return useQuery({
    queryKey: PROPERTY_KEYS.detail(id),
    queryFn: async () => {
      if (!id) throw new Error('ID properti wajib diisi');
      const res = await propertyApi.getPropertyById(id);
      return res.data;
    },
    enabled: Boolean(id),
  });
}

export function useCreateProperty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePropertyPayload) => propertyApi.createProperty(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROPERTY_KEYS.myProperties });
    },
  });
}

export function useUpdateProperty(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdatePropertyPayload) => propertyApi.updateProperty(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROPERTY_KEYS.myProperties });
      queryClient.invalidateQueries({ queryKey: PROPERTY_KEYS.detail(id) });
    },
  });
}

export function useDeleteProperty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => propertyApi.deleteProperty(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROPERTY_KEYS.myProperties });
    },
  });
}
