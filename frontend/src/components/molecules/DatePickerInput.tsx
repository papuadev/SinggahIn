import React, { useState, useRef, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { DayPicker } from 'react-day-picker';
import { Calendar } from 'lucide-react';

export interface DatePickerInputProps {
  id?: string;
  value?: string;
  onChange?: (dateStr: string) => void;
  min?: string;
  max?: string;
  hasError?: boolean;
  disabled?: boolean;
  placeholder?: string;
  align?: 'left' | 'right';
  'aria-label'?: string;
}

function parseDateSafe(dateStr?: string): Date | undefined {
  if (!dateStr) return undefined;
  try {
    return parseISO(dateStr);
  } catch {
    return undefined;
  }
}

function formatDisplayDate(dateStr?: string): string {
  const d = parseDateSafe(dateStr);
  if (!d) return '';
  try {
    return format(d, 'dd/MM/yyyy');
  } catch {
    return '';
  }
}

function buildDisabledMatcher(min?: string, max?: string) {
  const minDate = parseDateSafe(min);
  const maxDate = parseDateSafe(max);
  if (minDate && maxDate) return [{ before: minDate }, { after: maxDate }];
  if (minDate) return [{ before: minDate }];
  if (maxDate) return [{ after: maxDate }];
  return undefined;
}

function usePopoverDismiss(ref: React.RefObject<HTMLElement>, isOpen: boolean, onClose: () => void) {
  useEffect(() => {
    if (!isOpen) return;
    const onDown = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [ref, isOpen, onClose]);
}

type TriggerProps = {
  display: string; hasError?: boolean; disabled?: boolean;
  placeholder?: string; onClick: () => void;
};

function DateTriggerBtn({ display, hasError, disabled, placeholder, onClick }: TriggerProps) {
  const border = hasError ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 hover:border-gray-400 focus:border-primary-500';
  return (
    <button
      type="button" disabled={disabled} onClick={onClick}
      className={`w-full h-10 px-3 rounded-lg border text-sm flex items-center justify-between transition-colors bg-white ${border} disabled:bg-gray-50 disabled:text-gray-400`}
    >
      <span className={display ? 'text-gray-800 font-medium' : 'text-gray-400'}>
        {display || placeholder || 'Pilih tanggal'}
      </span>
      <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
    </button>
  );
}

function useDatePickerState(value?: string, onChange?: (s: string) => void) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  usePopoverDismiss(ref, isOpen, () => setIsOpen(false));
  const onSelect = (d: Date | undefined) => {
    if (d) { onChange?.(format(d, 'yyyy-MM-dd')); setIsOpen(false); }
  };
  return { isOpen, setIsOpen, ref, onSelect, selectedDate: parseDateSafe(value) };
}

type PopoverProps = {
  isOpen: boolean; align?: 'left' | 'right'; selected?: Date;
  onSelect: (d: Date | undefined) => void; disabledMatcher?: any;
};

function DatePickerPopover({ isOpen, align, selected, onSelect, disabledMatcher }: PopoverProps) {
  if (!isOpen) return null;
  const alignCls = align === 'right' ? 'right-0' : 'left-0';
  return (
    <div className={`absolute z-50 top-full mt-1.5 bg-white border border-gray-200 rounded-xl shadow-2xl p-2.5 ${alignCls}`}>
      <DayPicker mode="single" selected={selected} onSelect={onSelect} locale={idLocale} disabled={disabledMatcher} />
    </div>
  );
}

export function DatePickerInput(props: DatePickerInputProps): React.JSX.Element {
  const { id, value, onChange, min, max, hasError, disabled, placeholder, align = 'left' } = props;
  const s = useDatePickerState(value, onChange);
  const disabledMatcher = buildDisabledMatcher(min, max);
  return (
    <div ref={s.ref} className="relative w-full">
      <DateTriggerBtn display={formatDisplayDate(value)} hasError={hasError} disabled={disabled} placeholder={placeholder} onClick={() => !disabled && s.setIsOpen(!s.isOpen)} />
      <DatePickerPopover isOpen={s.isOpen} align={align} selected={s.selectedDate} onSelect={s.onSelect} disabledMatcher={disabledMatcher} />
      <input type="date" id={id} min={min} max={max} value={value || ''} onChange={(e) => onChange?.(e.target.value)} aria-label={props['aria-label']} className="sr-only" tabIndex={-1} />
    </div>
  );
}
