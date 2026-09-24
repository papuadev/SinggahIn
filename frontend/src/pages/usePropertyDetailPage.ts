import { useCallback, useState } from 'react';
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

function useDateRangeParams() {
  const [params, setParams] = useSearchParams();
  const checkIn = params.get('checkIn') || undefined;
  const checkOut = params.get('checkOut') || undefined;
  const handleSelectDates = useCallback((newCheckIn: string, newCheckOut: string) => {
    const next = new URLSearchParams(params);
    if (newCheckIn) next.set('checkIn', newCheckIn); else next.delete('checkIn');
    if (newCheckOut) next.set('checkOut', newCheckOut); else next.delete('checkOut');
    setParams(next, { replace: true });
  }, [params, setParams]);
  return { checkIn, checkOut, handleSelectDates };
}

function useScrollToRooms() {
  return useCallback(() => {
    document.getElementById('pilihan-kamar')?.scrollIntoView({ behavior: 'smooth' });
  }, []);
}

export function usePropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const dates = useDateRangeParams();
  const { data: property, isLoading, isError } = usePropertyQuery(id);
  const { rooms, lowestPrice } = useRoomSelection(property?.rooms, id);
  const [selectedRoomId, setSelectedRoomId] = useState<string | undefined>(undefined);
  const scrollToRooms = useScrollToRooms();
  const handleBookRoom = usePropertyBooking(id, dates.checkIn, dates.checkOut);
  return {
    id, property, rooms, lowestPrice, selectedRoomId, setSelectedRoomId,
    isLoading, isError, scrollToRooms, handleBookRoom, ...dates,
  };
}
