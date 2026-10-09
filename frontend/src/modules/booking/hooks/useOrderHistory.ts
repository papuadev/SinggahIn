import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { bookingApi } from '../services/booking.api';
import { BookingStatus } from '../booking.types';

function useOrderQuery(status: BookingStatus | undefined, page: number, limit: number) {
  return useQuery({
    queryKey: ['user-orders', status, page, limit],
    queryFn: () => bookingApi.getUserBookings({ status, page, limit }),
  });
}

export function useOrderHistory(limit = 10) {
  const [status, setStatus] = useState<BookingStatus | undefined>();
  const [page, setPage] = useState(1);
  const { data, isLoading, refetch } = useOrderQuery(status, page, limit);
  const changeStatus = (s?: BookingStatus) => { setStatus(s); setPage(1); };
  return {
    bookings: data?.data || [], meta: data?.meta,
    isLoading, status, setStatus: changeStatus, page, setPage, refetch,
  };
}
