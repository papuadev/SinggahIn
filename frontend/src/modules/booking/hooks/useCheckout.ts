import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../../stores/auth.store';
import { propertyApi } from '../../property/services/property.api';
import { roomApi } from '../../room/services/room.api';
import { bookingApi } from '../services/booking.api';
import { PaymentMethod, CreateBookingPayload } from '../booking.types';

function computeNights(inStr?: string, outStr?: string): number {
  if (!inStr || !outStr) return 1;
  const diff = Math.round((new Date(outStr).getTime() - new Date(inStr).getTime()) / (1000 * 3600 * 24));
  return diff > 0 ? diff : 1;
}

export function useCheckoutParams() {
  const [params] = useSearchParams();
  const propertyId = params.get('propertyId') || '';
  const roomId = params.get('roomId') || '';
  const checkInDate = params.get('checkIn') || '';
  const checkOutDate = params.get('checkOut') || '';
  const guestCount = parseInt(params.get('guestCount') || '1', 10);
  return { propertyId, roomId, checkInDate, checkOutDate, guestCount };
}

export function useCheckoutQueries(propertyId: string, roomId: string) {
  const pQ = useQuery({
    queryKey: ['chk-prop', propertyId], queryFn: () => propertyApi.getPropertyById(propertyId),
    enabled: Boolean(propertyId),
  });
  const rQ = useQuery({
    queryKey: ['chk-room', roomId], queryFn: () => roomApi.getRoomById(roomId),
    enabled: Boolean(roomId),
  });
  return { property: pQ.data?.data, room: rQ.data?.data, isLoading: pQ.isLoading || rQ.isLoading };
}

async function executeCreateBooking(payload: CreateBookingPayload, navigate: any) {
  const res = await bookingApi.createBooking(payload);
  const targetId = (res.data as any).id || (res.data as any).bookingId;
  navigate(`/orders/${targetId}/payment`);
}

function validateBookingPayload(p: CreateBookingPayload): string | null {
  if (!p.roomId) return 'Kamar belum dipilih';
  if (!p.checkInDate || !p.checkOutDate) return 'Silakan pilih tanggal check-in dan check-out terlebih dahulu.';
  return null;
}

function useBookingSubmit(payload: CreateBookingPayload) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submit = async () => {
    const valErr = validateBookingPayload(payload);
    if (valErr) return setError(valErr);
    setLoading(true); setError(null);
    try { await executeCreateBooking(payload, navigate); }
    catch (err: any) { setError(err.response?.data?.message || err.message || 'Gagal membuat pesanan.'); }
    finally { setLoading(false); }
  };
  return { isSubmitting: loading, errorMsg: error, handleBooking: submit };
}

function buildSubmitPayload(p: any, method: PaymentMethod): CreateBookingPayload {
  return {
    roomId: p.roomId, checkInDate: p.checkInDate, checkOutDate: p.checkOutDate,
    guestCount: p.guestCount, paymentMethod: method,
  };
}

export function useCheckout() {
  const { user } = useAuthStore();
  const p = useCheckoutParams();
  const q = useCheckoutQueries(p.propertyId, p.roomId);
  const [method, setMethod] = useState<PaymentMethod>('MANUAL_TRANSFER');
  const hasDates = Boolean(p.checkInDate && p.checkOutDate);
  const nights = useMemo(() => computeNights(p.checkInDate, p.checkOutDate), [p.checkInDate, p.checkOutDate]);
  const sub = useBookingSubmit(buildSubmitPayload(p, method));
  const estimatedTotal = (q.room?.basePrice || 0) * nights;
  return {
    ...p, ...q, ...sub, user, nights, hasDates, paymentMethod: method,
    setPaymentMethod: setMethod, estimatedTotal,
  };
}
