import { useRef } from 'react';
import { DayContentProps, DayProps, useDayRender } from 'react-day-picker';
import { format } from 'date-fns';
import { CalendarDayItem } from '../../../../modules/property/property.types';
import { formatCalendarPrice } from '../../../../libs/formatters';

interface CellContentProps {
  dayNumber: number;
  item?: CalendarDayItem;
  isSelected?: boolean;
}

function AvailableBadge({ price, isSelected }: { price: number; isSelected?: boolean }) {
  const textCls = isSelected ? 'text-white' : 'text-primary-600 font-semibold';
  return (
    <span className={`text-[9px] sm:text-[10px] block leading-tight mt-0.5 ${textCls}`}>
      {formatCalendarPrice(price)}
    </span>
  );
}

function SoldOutBadge({ isSelected }: { isSelected?: boolean }) {
  const textCls = isSelected ? 'text-white' : 'text-red-500 font-bold';
  return (
    <span className={`text-[9px] sm:text-[10px] block leading-tight mt-0.5 ${textCls}`}>
      Penuh
    </span>
  );
}

export function CalendarDayCell({ dayNumber, item, isSelected }: CellContentProps) {
  return (
    <div className="flex flex-col items-center justify-center py-0.5 w-full">
      <span className="text-[11px] sm:text-xs font-semibold leading-tight">{dayNumber}</span>
      {item && (
        item.isAvailable ? (
          <AvailableBadge price={item.price} isSelected={isSelected} />
        ) : (
          <SoldOutBadge isSelected={isSelected} />
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

export function createDayContentRenderer(dateMap: Map<string, CalendarDayItem>) {
  return function DayContentRender(props: DayContentProps) {
    const key = format(props.date, 'yyyy-MM-dd');
    const item = dateMap.get(key);
    const isSelected = Boolean(props.activeModifiers?.selected);
    return (
      <CalendarDayCell
        dayNumber={props.date.getDate()}
        item={item}
        isSelected={isSelected}
      />
    );
  };
}
