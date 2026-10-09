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

function buildCheckoutUrl(propertyId: string, roomId: string, inDate: string, outDate: string): string {
  const p = new URLSearchParams({ propertyId, roomId, checkIn: inDate, checkOut: outDate });
  return `/checkout?${p.toString()}`;
}

function usePropertyBooking(id?: string, inD?: string, outD?: string, onMissing?: () => void) {
  const navigate = useNavigate();
  return useCallback((roomId: string) => {
    if (!inD || !outD) return onMissing?.();
    navigate(buildCheckoutUrl(id!, roomId, inD, outD));
  }, [inD, outD, id, navigate, onMissing]);
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

function useMissingDatesModal() {
  const [isOpen, setIsOpen] = useState(false);
  const openModal = useCallback(() => setIsOpen(true), []);
  const closeModal = useCallback(() => setIsOpen(false), []);
  const onPickDates = useCallback(() => {
    document.getElementById('sidebar-date-trigger')?.scrollIntoView({ behavior: 'smooth' });
  }, []);
  return { isDateModalOpen: isOpen, openDateModal: openModal, closeDateModal: closeModal, handlePickDates: onPickDates };
}

export function usePropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const dates = useDateRangeParams();
  const dateModal = useMissingDatesModal();
  const { data: property, isLoading, isError } = usePropertyQuery(id);
  const { rooms, lowestPrice } = useRoomSelection(property?.rooms, id);
  const [selectedRoomId, setSelectedRoomId] = useState<string | undefined>(undefined);
  const handleBookRoom = usePropertyBooking(id, dates.checkIn, dates.checkOut, dateModal.openDateModal);
  return {
    id, property, rooms, lowestPrice, selectedRoomId, setSelectedRoomId,
    isLoading, isError, scrollToRooms: useScrollToRooms(), handleBookRoom, ...dateModal, ...dates,
  };
}
