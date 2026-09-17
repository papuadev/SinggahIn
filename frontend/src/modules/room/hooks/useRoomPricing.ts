import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pricingApi } from '../services/pricing.api';
import {
  CreatePeakRatePayload,
  CreateRoomUnavailabilityPayload,
} from '../pricing.types';

export const PRICING_KEYS = {
  rates: (roomId?: string) => ['room-rates', roomId] as const,
  unavailabilities: (roomId?: string) => ['room-unavailabilities', roomId] as const,
};

export function useRoomRates(roomId?: string) {
  return useQuery({
    queryKey: PRICING_KEYS.rates(roomId),
    queryFn: async () => {
      if (!roomId) throw new Error('ID kamar wajib diisi');
      const res = await pricingApi.getRoomRates(roomId);
      return res.data;
    },
    enabled: Boolean(roomId),
  });
}

export function useCreateRoomRate(roomId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePeakRatePayload) => pricingApi.createRoomRate(roomId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRICING_KEYS.rates(roomId) });
    },
  });
}

export function useDeleteRoomRate(roomId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (rateId: string) => pricingApi.deleteRoomRate(roomId, rateId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRICING_KEYS.rates(roomId) });
    },
  });
}

export function useBulkCreatePropertyRates(propertyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePeakRatePayload) =>
      pricingApi.bulkCreatePropertyRates(propertyId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['room-rates'] });
    },
  });
}

export function useRoomUnavailabilities(roomId?: string) {
  return useQuery({
    queryKey: PRICING_KEYS.unavailabilities(roomId),
    queryFn: async () => {
      if (!roomId) throw new Error('ID kamar wajib diisi');
      const res = await pricingApi.getRoomUnavailabilities(roomId);
      return res.data;
    },
    enabled: Boolean(roomId),
  });
}

export function useCreateRoomUnavailability(roomId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateRoomUnavailabilityPayload) =>
      pricingApi.createRoomUnavailability(roomId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRICING_KEYS.unavailabilities(roomId) });
    },
  });
}

export function useDeleteRoomUnavailability(roomId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (unavailabilityId: string) =>
      pricingApi.deleteRoomUnavailability(roomId, unavailabilityId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRICING_KEYS.unavailabilities(roomId) });
    },
  });
}
