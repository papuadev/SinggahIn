import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { bookingApi } from '../services/booking.api';
import { BookingStatus } from '../booking.types';
import { useDebounce } from '../../../libs/useDebounce';

type OrderQueryParams = { status?: BookingStatus; page: number; limit: number; search?: string; sortBy?: string };

function useOrderQuery(params: OrderQueryParams) {
  const { status, page, limit, search, sortBy } = params;
  return useQuery({
    queryKey: ['user-orders', status, page, limit, search, sortBy],
    queryFn: () => bookingApi.getUserBookings({ status, page, limit, search: search?.trim() || undefined, sortBy }),
  });
}

function useOrderFilters() {
  const [status, setStatus] = useState<BookingStatus | undefined>();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<string>('createdAt_desc');
  return {
    status, setStatus: (s?: BookingStatus) => { setStatus(s); setPage(1); },
    page, setPage,
    search, setSearch: (s: string) => { setSearch(s); setPage(1); },
    sortBy, setSortBy: (s: string) => { setSortBy(s); setPage(1); },
  };
}

export function useOrderHistory(limit = 10) {
  const filters = useOrderFilters();
  const debouncedSearch = useDebounce(filters.search, 300);
  const { data, isLoading, refetch } = useOrderQuery({ ...filters, limit, search: debouncedSearch });
  return { bookings: data?.data || [], meta: data?.meta, isLoading, refetch, ...filters };
}
