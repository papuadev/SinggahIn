import { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, startOfToday, addDays, isBefore, isSameDay } from 'date-fns';
import { propertyApi } from '../services/property.api';
import { CalendarDayItem } from '../property.types';

function computeNextMonth(m: number, y: number): { month: number; year: number } {
  return m === 12 ? { month: 1, year: y + 1 } : { month: m + 1, year: y };
}

function computePrevMonth(m: number, y: number): { month: number; year: number } {
  return m === 1 ? { month: 12, year: y - 1 } : { month: m - 1, year: y };
}

function canNavigatePrev(m: number, y: number): boolean {
  const today = startOfToday();
  const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  return new Date(y, m - 1, 1) > currentMonthStart;
}

export function checkRangeAvailable(from: Date, to: Date, map: Map<string, CalendarDayItem>): boolean {
  let curr = from;
  while (isBefore(curr, to) && !isSameDay(curr, to)) {
    const item = map.get(format(curr, 'yyyy-MM-dd'));
    if (item && !item.isAvailable) return false;
    curr = addDays(curr, 1);
  }
  return true;
}

function useCalendarFetch(propertyId: string, month: number, year: number, roomId?: string) {
  return useQuery({
    queryKey: ['property-calendar', propertyId, month, year, roomId],
    queryFn: async () => (await propertyApi.getCalendar(propertyId, { month, year, roomId })).data,
    enabled: Boolean(propertyId),
  });
}

function useCalendarMonthNavigation(initialMonth?: number, initialYear?: number) {
  const today = startOfToday();
  const [month, setMonth] = useState(initialMonth ?? today.getMonth() + 1);
  const [year, setYear] = useState(initialYear ?? today.getFullYear());
  const canGoPrev = canNavigatePrev(month, year);
  const goToNext = () => {
    const next = computeNextMonth(month, year);
    setMonth(next.month); setYear(next.year);
  };
  const goToPrev = () => {
    const prev = computePrevMonth(month, year);
    if (canGoPrev) { setMonth(prev.month); setYear(prev.year); }
  };
  return { month, year, canGoPrev, goToNext, goToPrev };
}

function buildDateMap(calendar?: CalendarDayItem[]) {
  const map = new Map<string, CalendarDayItem>();
  calendar?.forEach((item) => map.set(item.date, item));
  return map;
}

function useCalendarDisabledCheck(dateMap: Map<string, CalendarDayItem>) {
  const today = startOfToday();
  return useCallback((date: Date): boolean => {
    if (isBefore(date, today)) return true;
    const item = dateMap.get(format(date, 'yyyy-MM-dd'));
    return Boolean(item && !item.isAvailable);
  }, [dateMap, today]);
}

export interface UsePropertyCalendarProps {
  propertyId: string;
  initialRoomId?: string;
  initialMonth?: number;
  initialYear?: number;
}

export function usePropertyCalendar(
  { propertyId, initialRoomId, initialMonth, initialYear }: UsePropertyCalendarProps
) {
  const nav = useCalendarMonthNavigation(initialMonth, initialYear);
  const [selectedRoomId, setSelectedRoomId] = useState<string | undefined>(initialRoomId);
  const [validationError, setValidationError] = useState<string | null>(null);
  const { data, isLoading, isError } = useCalendarFetch(propertyId, nav.month, nav.year, selectedRoomId);
  const dateMap = useMemo(() => buildDateMap(data?.calendar), [data]);
  const isDateDisabled = useCalendarDisabledCheck(dateMap);

  return {
    ...nav, selectedRoomId, setSelectedRoomId, validationError, setValidationError,
    calendarData: data, dateMap, isLoading, isError, isDateDisabled,
  };
}
