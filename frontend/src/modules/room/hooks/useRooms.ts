import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roomApi } from '../services/room.api';
import { CreateRoomPayload, UpdateRoomPayload } from '../room.types';
import { PROPERTY_KEYS } from '../../property/hooks/useProperties';

export const ROOM_KEYS = {
  list: (propertyId?: string) => ['rooms', propertyId] as const,
  detail: (id?: string) => ['room', id] as const,
};

export function usePropertyRooms(propertyId?: string) {
  return useQuery({
    queryKey: ROOM_KEYS.list(propertyId),
    queryFn: async () => {
      if (!propertyId) throw new Error('ID properti wajib diisi');
      const res = await roomApi.getRoomsByProperty(propertyId);
      return res.data;
    },
    enabled: Boolean(propertyId),
  });
}

export function useRoomDetail(id?: string) {
  return useQuery({
    queryKey: ROOM_KEYS.detail(id),
    queryFn: async () => {
      if (!id) throw new Error('ID kamar wajib diisi');
      const res = await roomApi.getRoomById(id);
      return res.data;
    },
    enabled: Boolean(id),
  });
}

export function useCreateRoom(propertyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateRoomPayload) => roomApi.createRoom(propertyId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ROOM_KEYS.list(propertyId) });
      queryClient.invalidateQueries({ queryKey: PROPERTY_KEYS.detail(propertyId) });
    },
  });
}

export function useUpdateRoom(propertyId: string, id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateRoomPayload) => roomApi.updateRoom(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ROOM_KEYS.list(propertyId) });
      queryClient.invalidateQueries({ queryKey: ROOM_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: PROPERTY_KEYS.detail(propertyId) });
    },
  });
}

export function useDeleteRoom(propertyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => roomApi.deleteRoom(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ROOM_KEYS.list(propertyId) });
      queryClient.invalidateQueries({ queryKey: PROPERTY_KEYS.detail(propertyId) });
    },
  });
}
