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

export const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  function CurrencyInput(
    {
      value,
      onValueChange,
      onChange,
      allowNegative = false,
      prefix,
      leftIcon,
      placeholder = 'Contoh: 100.000',
      ...rest
    },
    ref
  ): React.JSX.Element {
    const inputRef = useRef<HTMLInputElement | null>(null);
    useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

    const [displayValue, setDisplayValue] = useState<string>(() =>
      formatCurrencyInput(value, allowNegative)
    );

    useEffect(() => {
      const formatted = formatCurrencyInput(value, allowNegative);
      setDisplayValue((prev) => (prev !== formatted ? formatted : prev));
    }, [value, allowNegative]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      const prevCursor = e.target.selectionStart || 0;
      const nextFormatted = formatCurrencyInput(raw, allowNegative);
      const numeric = parseCurrencyInput(nextFormatted, allowNegative);

      setDisplayValue(nextFormatted);

      if (typeof window !== 'undefined' && inputRef.current?.setSelectionRange) {
        const nextCursor = computeCursor(raw, nextFormatted, prevCursor);
        requestAnimationFrame(() => {
          inputRef.current?.setSelectionRange(nextCursor, nextCursor);
        });
      }

      onValueChange?.(numeric);
      if (onChange) {
        onChange(buildSyntheticEvent(e, rest.name || '', nextFormatted, numeric));
      }
    };

    const icon = prefix ? (
      <span className="text-xs font-semibold text-gray-500 select-none">{prefix}</span>
    ) : (
      leftIcon
    );

    return (
      <Input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        value={displayValue}
        onChange={handleChange}
        placeholder={placeholder}
        leftIcon={icon}
        {...rest}
      />
    );
  }
);
