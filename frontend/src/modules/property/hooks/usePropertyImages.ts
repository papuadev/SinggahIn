import { useMutation, useQueryClient } from '@tanstack/react-query';
import { propertyApi } from '../services/property.api';
import { PROPERTY_KEYS } from './useProperties';

export function useUploadPropertyImages(propertyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (files: File[]) => propertyApi.uploadImages(propertyId, files),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROPERTY_KEYS.detail(propertyId) });
      queryClient.invalidateQueries({ queryKey: PROPERTY_KEYS.myProperties });
    },
  });
}

export function useDeletePropertyImage(propertyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (imageId: string) => propertyApi.deleteImage(propertyId, imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROPERTY_KEYS.detail(propertyId) });
      queryClient.invalidateQueries({ queryKey: PROPERTY_KEYS.myProperties });
    },
  });
}

export function useSetCoverPropertyImage(propertyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (imageId: string) => propertyApi.setCoverImage(propertyId, imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROPERTY_KEYS.detail(propertyId) });
      queryClient.invalidateQueries({ queryKey: PROPERTY_KEYS.myProperties });
    },
  });
}
