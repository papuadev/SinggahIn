import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { bookingApi } from '../services/booking.api';
import { paymentApi } from '../../payment/services/payment.api';
import { BookingStatus } from '../booking.types';
import { EmergencyCancelPayload } from '../../payment/payment.types';

function useTenantOrderQuery(status: BookingStatus | undefined, page: number, limit: number) {
  return useQuery({
    queryKey: ['tenant-orders', status, page, limit],
    queryFn: () => bookingApi.getTenantBookings({ status, page, limit }),
  });
}

async function runAction(setLoading: (b: boolean) => void, fn: () => Promise<any>, onSuccess: () => void) {
  setLoading(true);
  try { await fn(); onSuccess(); }
  finally { setLoading(false); }
}

export function useTenantOrderActions(onSuccess: () => void) {
  const [loading, setLoading] = useState(false);
  const approve = (id: string) => runAction(setLoading, () => paymentApi.approvePaymentProof(id), onSuccess);
  const reject = (id: string, r?: string) => runAction(setLoading, () => paymentApi.rejectPaymentProof(id, { reason: r }), onSuccess);
  const emergency = (id: string, p: EmergencyCancelPayload) => runAction(setLoading, () => paymentApi.emergencyCancel(id, p), onSuccess);
  return { isActionLoading: loading, approve, reject, emergency };
}

export function useTenantOrders(limit = 10) {
  const [status, setStatus] = useState<BookingStatus | undefined>();
  const [page, setPage] = useState(1);
  const q = useTenantOrderQuery(status, page, limit);
  const actions = useTenantOrderActions(() => { q.refetch(); });
  const changeStatus = (s?: BookingStatus) => { setStatus(s); setPage(1); };
  return {
    bookings: q.data?.data || [], meta: q.data?.meta, isLoading: q.isLoading,
    status, setStatus: changeStatus, page, setPage, refetch: q.refetch, ...actions,
  };
}
