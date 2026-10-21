import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { SelectSize, getSelectClasses } from './select/select.styles';
import { ExtractedOption, extractOptions, SelectOptionsList } from './select/SelectOptionsList';

export type { SelectSize };

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  hasError?: boolean;
  size?: SelectSize;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  wrapperClassName?: string;
}

function DefaultArrow({ size, isOpen }: { size: SelectSize; isOpen?: boolean }) {
  const iconCls = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';
  const posCls = size === 'sm' ? 'right-2.5' : 'right-3.5';
  return (
    <div className={`absolute inset-y-0 ${posCls} flex items-center pointer-events-none text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
      <ChevronDown className={iconCls} />
    </div>
  );
}

function LeftIconWrapper({ icon }: { icon: React.ReactNode }) {
  return <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">{icon}</div>;
}

function useClickOutside(ref: React.RefObject<HTMLDivElement | null>, isOpen: boolean, onClose: () => void) {
  useEffect(() => {
    if (!isOpen) return;
    const onMouseDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, ref, onClose]);
}

function getOptions(el: HTMLSelectElement | null, children: React.ReactNode): ExtractedOption[] {
  if (el && el.options.length > 0) {
    return Array.from(el.options).map((o) => ({ value: o.value, label: o.text, disabled: o.disabled }));
  }
  return extractOptions(children);
}

function dispatchSelectValue(el: HTMLSelectElement, optVal: string): void {
  const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value')?.set;
  if (nativeSetter) nativeSetter.call(el, optVal);
  else el.value = optVal;
  el.dispatchEvent(new Event('change', { bubbles: true }));
}

function useForwardedRef<T>(ref: React.ForwardedRef<T>) {
  const innerRef = useRef<T | null>(null);
  const setRef = (el: T | null) => {
    innerRef.current = el;
    if (typeof ref === 'function') ref(el);
    else if (ref) (ref as React.MutableRefObject<T | null>).current = el;
  };
  return [innerRef, setRef] as const;
}

function useSelectDropdown(propsVal: unknown, defaultVal: unknown, children: React.ReactNode, selectEl: React.RefObject<HTMLSelectElement | null>) {
  const [isOpen, setIsOpen] = useState(false);
  const [optionsList, setOptionsList] = useState<ExtractedOption[]>([]);
  const [currentVal, setCurrentVal] = useState<string>(() => (propsVal !== undefined ? String(propsVal) : (defaultVal !== undefined ? String(defaultVal) : '')));
  useEffect(() => { if (propsVal !== undefined) setCurrentVal(String(propsVal)); }, [propsVal]);
  const refresh = () => setOptionsList(getOptions(selectEl.current, children));
  useEffect(() => { refresh(); }, [children]);
  const selectOption = (optVal: string) => {
    setCurrentVal(optVal);
    if (selectEl.current) dispatchSelectValue(selectEl.current, optVal);
    setIsOpen(false);
  };
  return { isOpen, setIsOpen, optionsList, currentVal, setCurrentVal, refresh, selectOption };
}

function useSelectMouseDown(disabled: boolean | undefined, selectRef: React.RefObject<HTMLSelectElement | null>, refresh: () => void, setIsOpen: React.Dispatch<React.SetStateAction<boolean>>) {
  return (e: React.MouseEvent<HTMLSelectElement>) => {
    if (disabled) return;
    e.preventDefault();
    selectRef.current?.focus();
    refresh();
    setIsOpen((p) => !p);
  };
}

function SelectRightIcon({ rightIcon, size, isOpen }: { rightIcon?: React.ReactNode; size: SelectSize; isOpen: boolean }) {
  if (rightIcon) return <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">{rightIcon}</div>;
  return <DefaultArrow size={size} isOpen={isOpen} />;
}

function useSelectState(ref: React.ForwardedRef<HTMLSelectElement>, props: SelectProps, children: React.ReactNode) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectRef, setRefs] = useForwardedRef(ref);
  const drop = useSelectDropdown(props.value, props.defaultValue, children, selectRef);
  useClickOutside(containerRef, drop.isOpen, () => drop.setIsOpen(false));
  const onMouseDown = useSelectMouseDown(props.disabled, selectRef, drop.refresh, drop.setIsOpen);
  return { containerRef, setRefs, onMouseDown, ...drop };
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  function Select({ hasError = false, size = 'md', leftIcon, rightIcon, wrapperClassName, className = '', children, ...props }, ref): React.JSX.Element {
    const s = useSelectState(ref, props, children);
    const selectClass = getSelectClasses(hasError, size, Boolean(leftIcon), className);
    return (
      <div ref={s.containerRef} className={wrapperClassName ? `relative ${wrapperClassName}` : 'relative w-full'}>
        {leftIcon && <LeftIconWrapper icon={leftIcon} />}
        <select ref={s.setRefs} className={selectClass} onMouseDown={s.onMouseDown} onChange={(e) => { s.setCurrentVal(e.target.value); props.onChange?.(e); }} {...props}>{children}</select>
        <SelectRightIcon rightIcon={rightIcon} size={size} isOpen={s.isOpen} />
        {s.isOpen && s.optionsList.length > 0 && <SelectOptionsList options={s.optionsList} currentVal={s.currentVal} onSelect={s.selectOption} />}
      </div>
    );
  }
);
