import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { propertyApi } from '../services/property.api';
import {
  CreatePropertyPayload,
  UpdatePropertyPayload,
  GetTenantPropertiesParams,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from '../property.types';

export const PROPERTY_KEYS = {
  categories: ['propertyCategories'] as const,
  categoriesActive: ['propertyCategories', 'active'] as const,
  myProperties: ['myProperties'] as const,
  myPropertiesList: (params?: GetTenantPropertiesParams) => ['myPropertiesList', params] as const,
  detail: (id?: string) => ['property', id] as const,
};

export function usePropertyCategories(activeOnly?: boolean) {
  return useQuery({
    queryKey: activeOnly ? PROPERTY_KEYS.categoriesActive : PROPERTY_KEYS.categories,
    queryFn: async () => {
      if (typeof propertyApi.getCategories !== 'function') return [];
      const res = await propertyApi.getCategories(activeOnly ? { activeOnly: true } : undefined);
      return res?.data || [];
    },
    staleTime: 1000 * 60 * 60,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCategoryPayload) => propertyApi.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['propertyCategories'] });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryPayload }) =>
      propertyApi.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['propertyCategories'] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => propertyApi.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['propertyCategories'] });
    },
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

export function useTenantPropertiesQuery(params?: GetTenantPropertiesParams) {
  return useQuery({
    queryKey: PROPERTY_KEYS.myPropertiesList(params),
    queryFn: () => propertyApi.getMyProperties(params),
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
      queryClient.invalidateQueries({ queryKey: ['myPropertiesList'] });
    },
  });
}

export function useUpdateProperty(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdatePropertyPayload) => propertyApi.updateProperty(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROPERTY_KEYS.myProperties });
      queryClient.invalidateQueries({ queryKey: ['myPropertiesList'] });
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
      queryClient.invalidateQueries({ queryKey: ['myPropertiesList'] });
    },
  });
}

export function useAssignImageRoom(propertyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ imageId, roomId }: { imageId: string; roomId: string | null }) =>
      propertyApi.assignImageToRoom(propertyId, imageId, roomId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROPERTY_KEYS.detail(propertyId) });
      queryClient.invalidateQueries({ queryKey: PROPERTY_KEYS.myProperties });
    },
  });
}

