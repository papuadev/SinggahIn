import React, { useMemo } from 'react';
import { DayPicker, DateRange } from 'react-day-picker';
import { parseISO, format, isSameDay } from 'date-fns';
import { id } from 'date-fns/locale';
import { Calendar, AlertCircle } from 'lucide-react';
import { usePropertyCalendar, checkRangeAvailable } from '../../../modules/property/hooks/usePropertyCalendar';
import { createDayContentRenderer, CalendarDayButton } from './calendar/CalendarDayCell';
import { CalendarHeader } from './calendar/CalendarHeader';
import { CalendarLegend } from './calendar/CalendarLegend';
import { CalendarDateSummary } from './calendar/CalendarDateSummary';

export interface InteractivePriceCalendarProps {
  propertyId: string;
  rooms?: Array<{ id: string; name: string; basePrice: number }>;
  selectedRoomId?: string;
  onRoomChange?: (roomId: string) => void;
  checkIn?: string;
  checkOut?: string;
  initialMonth?: number;
  initialYear?: number;
  onSelectDates?: (checkIn: string, checkOut: string) => void;
  variant?: 'default' | 'sidebar';
}

function resolveInitialMonthYear(checkIn?: string, m?: number, y?: number) {
  if (m && y) return { initialMonth: m, initialYear: y };
  if (checkIn) {
    try {
      const d = parseISO(checkIn);
      return { initialMonth: d.getMonth() + 1, initialYear: d.getFullYear() };
    } catch { /* ignore */ }
  }
  return { initialMonth: m, initialYear: y };
}

function CalendarSectionHeader() {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2">
        <Calendar className="w-5 h-5 text-primary-600 shrink-0" />
        <h2 id="kalender-harga" className="text-lg sm:text-xl font-bold text-gray-900">
          Kalender Ketersediaan & Tarif Harian
        </h2>
      </div>
      <p className="text-xs sm:text-sm text-gray-500 mt-1">
        Pilih tanggal menginap untuk melihat ketersediaan unit dan kalkulasi harga akurat
      </p>
    </div>
  );
}

function CalendarAlert({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="mb-4 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-xs sm:text-sm text-red-700">
      <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
      <span>{message}</span>
    </div>
  );
}

function processRangeSelection(
  range: DateRange | undefined, map: ReturnType<typeof usePropertyCalendar>['dateMap'],
  setError: (msg: string | null) => void, onSelect?: (inDate: string, outDate: string) => void
) {
  if (!range?.from) { onSelect?.('', ''); setError(null); return; }
  const fromStr = format(range.from, 'yyyy-MM-dd');
  if (!range.to || isSameDay(range.from, range.to)) { setError(null); onSelect?.(fromStr, ''); return; }
  if (!checkRangeAvailable(range.from, range.to, map)) {
    setError('Rentang tanggal memuat tanggal yang tidak tersedia (Sold Out).');
    onSelect?.(fromStr, ''); return;
  }
  setError(null);
  onSelect?.(fromStr, format(range.to, 'yyyy-MM-dd'));
}

const RDP_CLASSES = {
  root: 'w-full !m-0',
  months: 'w-full !m-0',
  month: 'w-full !m-0 space-y-2',
  caption: 'hidden',
  table: 'w-full border-collapse !max-w-none space-y-1 sm:space-y-1.5',
  head_row: 'flex w-full justify-between pb-2 mb-1 border-b border-gray-100',
  head_cell: 'text-gray-500 font-bold text-xs sm:text-sm flex-1 text-center py-1 sm:py-1.5',
  row: 'flex w-full justify-between mt-1 sm:mt-1.5',
  cell: 'text-center p-0.5 sm:p-1 relative flex-1 min-h-[48px] sm:min-h-[54px] md:min-h-[58px] !w-auto !h-auto flex items-center justify-center',
  day: 'h-full w-full min-h-[48px] sm:min-h-[54px] md:min-h-[58px] p-1 sm:p-1.5 font-normal rounded-xl hover:bg-primary-50 transition-all flex items-center justify-center border border-transparent hover:border-primary-200',
  day_range_middle: '!bg-primary-50 !text-primary-700 !rounded-none !border-transparent',
  day_selected: '!bg-primary-600 !text-white font-bold !rounded-xl shadow-md shadow-primary-500/25',
  day_disabled: 'opacity-40 cursor-not-allowed hover:bg-transparent hover:border-transparent text-gray-300',
};

const RDP_SIDEBAR_CLASSES = {
  root: 'w-full !m-0',
  months: 'w-full !m-0',
  month: 'w-full !m-0 space-y-0.5',
  caption: 'hidden',
  table: 'w-full border-collapse !max-w-none space-y-0.5',
  head_row: 'flex w-full justify-between pb-1 mb-0.5 border-b border-gray-100',
  head_cell: 'text-gray-500 font-bold text-xs flex-1 text-center py-0.5',
  row: 'flex w-full justify-between mt-0.5',
  cell: 'text-center p-0.5 relative flex-1 min-h-[32px] sm:min-h-[35px] !w-auto !h-auto flex items-center justify-center',
  day: 'h-full w-full min-h-[32px] sm:min-h-[35px] py-0.5 px-0.5 font-normal rounded-lg hover:bg-primary-50 transition-all flex items-center justify-center border border-transparent hover:border-primary-200',
  day_range_middle: '!bg-primary-50 !text-primary-700 !rounded-none !border-transparent',
  day_selected: '!bg-primary-600 !text-white font-bold !rounded-lg shadow-sm shadow-primary-500/25',
  day_disabled: 'opacity-40 cursor-not-allowed hover:bg-transparent hover:border-transparent text-gray-300',
};

interface GridProps {
  selectedRange: DateRange; onSelect: (r: DateRange | undefined) => void;
  monthDate: Date; disabled: (d: Date) => boolean; dayRenderer: (props: any) => React.ReactElement | null;
  isSidebar?: boolean;
}

function CalendarGrid({ selectedRange, onSelect, monthDate, disabled, dayRenderer, isSidebar }: GridProps) {
  return (
    <div className={isSidebar ? 'py-0.5 w-full overflow-hidden' : 'py-1 sm:py-2 w-full overflow-hidden'}>
      <DayPicker
        mode="range" selected={selectedRange} onSelect={onSelect}
        month={monthDate} disabled={disabled} locale={id}
        components={{ DayContent: dayRenderer, Day: CalendarDayButton }}
        showOutsideDays={false} classNames={isSidebar ? RDP_SIDEBAR_CLASSES : RDP_CLASSES}
        className="rdp-full-width w-full"
      />
    </div>
  );
}

interface CardBodyProps {
  cal: ReturnType<typeof usePropertyCalendar>;
  rooms: Array<{ id: string; name: string; basePrice: number }>;
  activeRoomId?: string; onRoomChange: (id: string) => void;
  selectedRange: DateRange; onSelect: (r: DateRange | undefined) => void;
  dayRenderer: any; checkIn?: string; checkOut?: string; onReset: () => void;
  isSidebar?: boolean;
}

function CalendarCardBody({ cal, rooms, activeRoomId, onRoomChange, selectedRange, onSelect, dayRenderer, checkIn, checkOut, onReset, isSidebar }: CardBodyProps) {
  const cardCls = isSidebar ? '' : 'bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 shadow-sm';
  return (
    <div className={cardCls}>
      <CalendarHeader month={cal.month} year={cal.year} onNext={cal.goToNext} onPrev={cal.goToPrev} canPrev={cal.canGoPrev} rooms={rooms} selectedRoomId={activeRoomId} onRoomChange={onRoomChange} />
      <CalendarAlert message={cal.validationError} />
      <CalendarGrid selectedRange={selectedRange} onSelect={onSelect} monthDate={new Date(cal.year, cal.month - 1, 1)} disabled={cal.isDateDisabled} dayRenderer={dayRenderer} isSidebar={isSidebar} />
      <CalendarDateSummary checkIn={checkIn} checkOut={checkOut} onReset={onReset} />
      <CalendarLegend />
    </div>
  );
}

function useInteractiveCalendarState(props: InteractivePriceCalendarProps) {
  const { propertyId, selectedRoomId, onRoomChange, checkIn, checkOut, onSelectDates } = props;
  const init = resolveInitialMonthYear(checkIn, props.initialMonth, props.initialYear);
  const cal = usePropertyCalendar({ propertyId, initialRoomId: selectedRoomId, ...init });
  const activeRoomId = selectedRoomId || cal.selectedRoomId;
  const dayRenderer = useMemo(() => createDayContentRenderer(cal.dateMap), [cal.dateMap]);
  const selectedRange: DateRange = { from: checkIn ? parseISO(checkIn) : undefined, to: checkOut ? parseISO(checkOut) : undefined };
  const onSelect = (r: DateRange | undefined) => processRangeSelection(r, cal.dateMap, cal.setValidationError, onSelectDates);
  const onRoom = (rId: string) => { cal.setSelectedRoomId(rId); onRoomChange?.(rId); };
  return { cal, activeRoomId, dayRenderer, selectedRange, onSelect, onRoom };
}

export function InteractivePriceCalendar(props: InteractivePriceCalendarProps): React.JSX.Element {
  const { rooms = [], checkIn, checkOut, onSelectDates, variant = 'default' } = props;
  const s = useInteractiveCalendarState(props);
  const isSidebar = variant === 'sidebar';
  return (
    <section aria-labelledby="kalender-harga" className={isSidebar ? 'w-full' : 'py-6 border-b border-gray-100'}>
      {!isSidebar && <CalendarSectionHeader />}
      <CalendarCardBody
        cal={s.cal} rooms={rooms} activeRoomId={s.activeRoomId} onRoomChange={s.onRoom}
        selectedRange={s.selectedRange} onSelect={s.onSelect} dayRenderer={s.dayRenderer}
        checkIn={checkIn} checkOut={checkOut} onReset={() => onSelectDates?.('', '')} isSidebar={isSidebar}
      />
    </section>
  );
}
