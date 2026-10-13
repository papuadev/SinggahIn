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

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  function Select(
    { hasError = false, size = 'md', leftIcon, rightIcon, wrapperClassName, className = '', children, ...props },
    ref
  ): React.JSX.Element {
    const containerRef = useRef<HTMLDivElement>(null);
    const internalSelectRef = useRef<HTMLSelectElement | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [optionsList, setOptionsList] = useState<ExtractedOption[]>([]);
    const [currentVal, setCurrentVal] = useState<string>(
      props.value !== undefined ? String(props.value) : (props.defaultValue !== undefined ? String(props.defaultValue) : '')
    );

    const setRefs = (el: HTMLSelectElement | null) => {
      internalSelectRef.current = el;
      if (typeof ref === 'function') ref(el);
      else if (ref) (ref as React.MutableRefObject<HTMLSelectElement | null>).current = el;
    };

    const refreshOptions = () => {
      if (internalSelectRef.current && internalSelectRef.current.options.length > 0) {
        const opts: ExtractedOption[] = [];
        for (let i = 0; i < internalSelectRef.current.options.length; i++) {
          const o = internalSelectRef.current.options[i];
          opts.push({ value: o.value, label: o.text, disabled: o.disabled });
        }
        setOptionsList(opts);
        return;
      }
      setOptionsList(extractOptions(children));
    };

    useEffect(() => { if (props.value !== undefined) setCurrentVal(String(props.value)); }, [props.value]);
    useEffect(() => { refreshOptions(); }, [children]);
    useClickOutside(containerRef, isOpen, () => setIsOpen(false));

    const handleSelectOption = (optVal: string) => {
      setCurrentVal(optVal);
      if (internalSelectRef.current) {
        const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value')?.set;
        if (nativeSetter) nativeSetter.call(internalSelectRef.current, optVal);
        else internalSelectRef.current.value = optVal;
        internalSelectRef.current.dispatchEvent(new Event('change', { bubbles: true }));
      }
      setIsOpen(false);
    };

    const handleNativeMouseDown = (e: React.MouseEvent<HTMLSelectElement>) => {
      if (props.disabled) return;
      e.preventDefault();
      internalSelectRef.current?.focus();
      refreshOptions();
      setIsOpen((prev) => !prev);
    };

    const selectClass = getSelectClasses(hasError, size, Boolean(leftIcon), className);
    const wrapperCls = wrapperClassName ? `relative ${wrapperClassName}` : 'relative w-full';

    return (
      <div ref={containerRef} className={wrapperCls}>
        {leftIcon && <LeftIconWrapper icon={leftIcon} />}
        <select ref={setRefs} className={selectClass} onMouseDown={handleNativeMouseDown} onChange={(e) => { setCurrentVal(e.target.value); props.onChange?.(e); }} {...props}>
          {children}
        </select>
        {rightIcon ? <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">{rightIcon}</div> : <DefaultArrow size={size} isOpen={isOpen} />}
        {isOpen && optionsList.length > 0 && <SelectOptionsList options={optionsList} currentVal={currentVal} onSelect={handleSelectOption} />}
      </div>
    );
  }
);
