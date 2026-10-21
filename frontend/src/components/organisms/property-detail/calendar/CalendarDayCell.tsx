import { useRef } from 'react';
import { DayContentProps, DayProps, useDayRender } from 'react-day-picker';
import { format } from 'date-fns';
import { CalendarDayItem } from '../../../../modules/property/property.types';
import { formatCalendarPrice } from '../../../../libs/formatters';

interface CellContentProps {
  dayNumber: number;
  item?: CalendarDayItem;
  isSelected?: boolean;
  isRangeMiddle?: boolean;
}

function AvailableBadge({ price, isSelected, isRangeMiddle }: { price: number; isSelected?: boolean; isRangeMiddle?: boolean }) {
  const textCls = isSelected && !isRangeMiddle ? 'text-white' : isRangeMiddle ? 'text-primary-700 font-semibold' : 'text-primary-600 font-semibold';
  return (
    <span className={`text-[9px] sm:text-[10px] font-semibold block leading-none mt-0.5 ${textCls}`}>
      {formatCalendarPrice(price)}
    </span>
  );
}

function SoldOutBadge({ isSelected, isRangeMiddle }: { isSelected?: boolean; isRangeMiddle?: boolean }) {
  const textCls = isSelected && !isRangeMiddle ? 'text-white' : 'text-red-500 font-bold';
  return (
    <span className={`text-[9px] sm:text-[10px] font-bold block leading-none mt-0.5 ${textCls}`}>
      Penuh
    </span>
  );
}

function ClosedBadge({ reason, isSelected, isRangeMiddle }: { reason?: string | null; isSelected?: boolean; isRangeMiddle?: boolean }) {
  const textCls = isSelected && !isRangeMiddle ? 'text-white' : 'text-slate-500 font-bold';
  return (
    <span title={reason || 'Tutup (Tidak Tersedia)'} className={`text-[9px] sm:text-[10px] font-bold block leading-none mt-0.5 ${textCls}`}>
      Tutup
    </span>
  );
}

function UnavailableBadge({ item, isSelected, isRangeMiddle }: { item: CalendarDayItem; isSelected?: boolean; isRangeMiddle?: boolean }) {
  if (item.reason === 'Sold Out') {
    return <SoldOutBadge isSelected={isSelected} isRangeMiddle={isRangeMiddle} />;
  }
  return <ClosedBadge reason={item.reason} isSelected={isSelected} isRangeMiddle={isRangeMiddle} />;
}

export function CalendarDayCell({ dayNumber, item, isSelected, isRangeMiddle }: CellContentProps) {
  const numCls = isSelected && !isRangeMiddle ? 'text-white' : isRangeMiddle ? 'text-primary-900' : 'text-gray-900';
  return (
    <div className="flex flex-col items-center justify-center w-full leading-none">
      <span className={`text-xs sm:text-sm font-bold leading-none ${numCls}`}>{dayNumber}</span>
      {item && (
        item.isAvailable ? (
          <AvailableBadge price={item.price} isSelected={isSelected} isRangeMiddle={isRangeMiddle} />
        ) : (
          <UnavailableBadge item={item} isSelected={isSelected} isRangeMiddle={isRangeMiddle} />
        )
      )}
    </div>
  );
}

export function CalendarDayButton(props: DayProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const r = useDayRender(props.date, props.displayMonth, ref);
  if (r.isHidden) return <div role="gridcell" />;
  if (!r.isButton) return <div {...r.divProps} />;
  const ariaDisabled = r.buttonProps.disabled ? 'true' : undefined;
  return (
    <button type="button" ref={ref} {...r.buttonProps} aria-disabled={ariaDisabled} />
  );
}

function DayItemCell({ props, dateMap }: { props: DayContentProps; dateMap: Map<string, CalendarDayItem> }) {
  const item = dateMap.get(format(props.date, 'yyyy-MM-dd'));
  const isSelected = Boolean(props.activeModifiers?.selected);
  const isRangeMiddle = Boolean(props.activeModifiers?.range_middle);
  return <CalendarDayCell dayNumber={props.date.getDate()} item={item} isSelected={isSelected} isRangeMiddle={isRangeMiddle} />;
}

export function createDayContentRenderer(dateMap: Map<string, CalendarDayItem>) {
  return (props: DayContentProps) => <DayItemCell props={props} dateMap={dateMap} />;
}
