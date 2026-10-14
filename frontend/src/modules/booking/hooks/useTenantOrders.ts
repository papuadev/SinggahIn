import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { bookingApi } from '../services/booking.api';
import { paymentApi } from '../../payment/services/payment.api';
import { BookingStatus } from '../booking.types';
import { EmergencyCancelPayload } from '../../payment/payment.types';
import { useDebounce } from '../../../libs/useDebounce';

function useTenantOrderQuery(
  status: BookingStatus | undefined, page: number, limit: number, search?: string, sortBy?: string
) {
  const queryParams = { status, page, limit, search: search?.trim() || undefined, sortBy };
  return useQuery({
    queryKey: ['tenant-orders', status, page, limit, search, sortBy],
    queryFn: () => bookingApi.getTenantBookings(queryParams),
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

function useUrlSyncedState(syncUrl: boolean) {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlStatus = (searchParams.get('status') as BookingStatus | null) || undefined;
  const urlSort = searchParams.get('sortBy') || 'createdAt_desc';
  const [status, setStatus] = useState<BookingStatus | undefined>(syncUrl ? urlStatus : undefined);
  const [sortBy, setSortBy] = useState<string>(syncUrl ? urlSort : 'createdAt_desc');

  useEffect(() => {
    if (!syncUrl) return;
    setStatus(urlStatus);
    if (urlSort) setSortBy(urlSort);
  }, [syncUrl, urlStatus, urlSort]);

  return { status, setStatus, sortBy, setSortBy, setSearchParams };
}

function useFilterHandlers(setStatus: any, setSortBy: any, setPage: any, setSearchParams: any, syncUrl: boolean) {
  const changeStatus = (s?: BookingStatus) => {
    setStatus(s); setPage(1);
    if (syncUrl) updateQueryParam(setSearchParams, 'status', s);
  };
  const changeSortBy = (s: string) => {
    setSortBy(s); setPage(1);
    if (syncUrl) updateQueryParam(setSearchParams, 'sortBy', s, 'createdAt_desc');
  };
  return { changeStatus, changeSortBy };
}

function updateQueryParam(setSearchParams: any, key: string, value?: string, defaultVal?: string) {
  setSearchParams((prev: URLSearchParams) => {
    const next = new URLSearchParams(prev);
    if (value && value !== defaultVal) next.set(key, value);
    else next.delete(key);
    return next;
  });
}

export function useTenantOrders(limit = 10, syncUrl = false) {
  const { status, setStatus, sortBy, setSortBy, setSearchParams } = useUrlSyncedState(syncUrl);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const q = useTenantOrderQuery(status, page, limit, useDebounce(search, 300), sortBy);
  const actions = useTenantOrderActions(() => { q.refetch(); });
  const { changeStatus, changeSortBy } = useFilterHandlers(setStatus, setSortBy, setPage, setSearchParams, syncUrl);

  return {
    bookings: q.data?.data || [], meta: q.data?.meta, isLoading: q.isLoading,
    status, setStatus: changeStatus, search, setSearch: (s: string) => { setSearch(s); setPage(1); },
    sortBy, setSortBy: changeSortBy, page, setPage, refetch: q.refetch, ...actions,
  };
}
