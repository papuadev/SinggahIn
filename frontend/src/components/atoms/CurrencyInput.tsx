import React, { useRef, useState, useEffect, useImperativeHandle } from 'react';
import { Input, InputProps } from './Input';
import { formatCurrencyInput, parseCurrencyInput } from '../../libs/formatters';

export interface CurrencyInputProps extends Omit<InputProps, 'value' | 'onChange'> {
  value?: number | string | null;
  onValueChange?: (value: number | undefined) => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  allowNegative?: boolean;
  prefix?: string;
}

function computeCursor(prevRaw: string, nextFormatted: string, prevCursor: number): number {
  const digitsBefore = prevRaw.slice(0, prevCursor).replace(/\D/g, '').length;
  let count = 0;
  for (let i = 0; i < nextFormatted.length; i++) {
    if (/\d/.test(nextFormatted[i])) count++;
    if (count === digitsBefore) return i + 1;
  }
  return nextFormatted.length;
}

function buildSyntheticEvent(
  e: React.ChangeEvent<HTMLInputElement>,
  name: string,
  formatted: string,
  numeric: number | undefined
): React.ChangeEvent<HTMLInputElement> {
  return {
    ...e,
    target: { ...e.target, name, value: formatted, valueAsNumber: numeric },
  } as React.ChangeEvent<HTMLInputElement>;
}

function restoreCursor(input: HTMLInputElement | null, raw: string, next: string, prevCursor: number): void {
  if (typeof window !== 'undefined' && input?.setSelectionRange) {
    const nextCursor = computeCursor(raw, next, prevCursor);
    requestAnimationFrame(() => input?.setSelectionRange(nextCursor, nextCursor));
  }
}

function useCurrencyInputState(value: number | string | null | undefined, allowNegative: boolean) {
  const [displayValue, setDisplayValue] = useState<string>(() => formatCurrencyInput(value, allowNegative));
  useEffect(() => {
    const formatted = formatCurrencyInput(value, allowNegative);
    setDisplayValue((prev) => (prev !== formatted ? formatted : prev));
  }, [value, allowNegative]);
  return [displayValue, setDisplayValue] as const;
}

type CurrencyChangeOpts = { allowNegative: boolean; name?: string; onValueChange?: (v?: number) => void; onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void };

function useCurrencyChangeHandler(inputRef: React.RefObject<HTMLInputElement | null>, setDisplayValue: React.Dispatch<React.SetStateAction<string>>, opts: CurrencyChangeOpts) {
  return (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const prevCursor = e.target.selectionStart || 0;
    const next = formatCurrencyInput(raw, opts.allowNegative);
    const num = parseCurrencyInput(next, opts.allowNegative);
    setDisplayValue(next);
    restoreCursor(inputRef.current, raw, next, prevCursor);
    opts.onValueChange?.(num);
    if (opts.onChange) opts.onChange(buildSyntheticEvent(e, opts.name || '', next, num));
  };
}

export const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  function CurrencyInput(props, ref): React.JSX.Element {
    const { value, onValueChange, onChange, allowNegative = false, prefix, leftIcon, placeholder = 'Contoh: 100.000', ...rest } = props;
    const inputRef = useRef<HTMLInputElement | null>(null);
    useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);
    const [displayValue, setDisplayValue] = useCurrencyInputState(value, allowNegative);
    const handleChange = useCurrencyChangeHandler(inputRef, setDisplayValue, { allowNegative, name: rest.name, onValueChange, onChange });
    const icon = prefix ? <span className="text-xs font-semibold text-gray-500 select-none">{prefix}</span> : leftIcon;
    return <Input ref={inputRef} type="text" inputMode="numeric" value={displayValue} onChange={handleChange} placeholder={placeholder} leftIcon={icon} {...rest} />;
  }
);
