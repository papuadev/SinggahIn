import { useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { propertyApi } from '../modules/property/services/property.api';
import { roomApi } from '../modules/room/services/room.api';

function usePropertyQuery(id?: string) {
  return useQuery({
    queryKey: ['property-detail', id],
    queryFn: async () => (await propertyApi.getPropertyById(id!)).data,
    enabled: Boolean(id),
  });
}

function useFallbackRoomsQuery(id?: string, shouldFetch = false) {
  return useQuery({
    queryKey: ['property-rooms-fallback', id],
    queryFn: async () => (await roomApi.getRoomsByProperty(id!)).data,
    enabled: Boolean(id && shouldFetch),
  });
}

function usePropertyBooking(id?: string, checkIn?: string, checkOut?: string) {
  const navigate = useNavigate();
  return useCallback((roomId: string) => {
    const params = new URLSearchParams();
    if (checkIn) params.set('checkIn', checkIn);
    if (checkOut) params.set('checkOut', checkOut);
    params.set('propertyId', id!);
    params.set('roomId', roomId);
    navigate(`/checkout?${params.toString()}`);
  }, [checkIn, checkOut, id, navigate]);
}

function computeLowestPrice(rooms: Array<{ basePrice: number }>) {
  return rooms.length > 0 ? Math.min(...rooms.map((r) => r.basePrice)) : undefined;
}

function useRoomSelection(propertyRooms?: any[], id?: string) {
  const shouldFetchRooms = !propertyRooms || propertyRooms.length === 0;
  const { data: fallbackRooms } = useFallbackRoomsQuery(id, shouldFetchRooms);
  const rooms = (propertyRooms?.length ? propertyRooms : fallbackRooms) || [];
  const lowestPrice = computeLowestPrice(rooms);
  return { rooms, lowestPrice };
}

export function usePropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [params] = useSearchParams();
  const checkIn = params.get('checkIn') || undefined;
  const checkOut = params.get('checkOut') || undefined;
  const { data: property, isLoading, isError } = usePropertyQuery(id);
  const { rooms, lowestPrice } = useRoomSelection(property?.rooms, id);
  const scrollToRooms = useCallback(() => {
    document.getElementById('pilihan-kamar')?.scrollIntoView({ behavior: 'smooth' });
  }, []);
  const handleBookRoom = usePropertyBooking(id, checkIn, checkOut);
  return { id, property, rooms, checkIn, checkOut, lowestPrice, isLoading, isError, scrollToRooms, handleBookRoom };
}
