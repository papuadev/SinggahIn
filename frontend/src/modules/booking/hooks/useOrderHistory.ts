import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { bookingApi } from '../services/booking.api';
import { BookingStatus } from '../booking.types';
import { useDebounce } from '../../../libs/useDebounce';

function useOrderQuery(
  status: BookingStatus | undefined,
  page: number,
  limit: number,
  search?: string,
  sortBy?: string
) {
  return useQuery({
    queryKey: ['user-orders', status, page, limit, search, sortBy],
    queryFn: () =>
      bookingApi.getUserBookings({
        status,
        page,
        limit,
        search: search?.trim() || undefined,
        sortBy,
      }),
  });
}

export function useOrderHistory(limit = 10) {
  const [status, setStatus] = useState<BookingStatus | undefined>();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<string>('createdAt_desc');
  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading, refetch } = useOrderQuery(status, page, limit, debouncedSearch, sortBy);
  const changeStatus = (s?: BookingStatus) => { setStatus(s); setPage(1); };
  const changeSearch = (s: string) => { setSearch(s); setPage(1); };
  const changeSortBy = (s: string) => { setSortBy(s); setPage(1); };

  return {
    bookings: data?.data || [], meta: data?.meta,
    isLoading, status, setStatus: changeStatus,
    search, setSearch: changeSearch,
    sortBy, setSortBy: changeSortBy,
    page, setPage, refetch,
  };
}
