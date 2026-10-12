import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export type SelectSize = 'sm' | 'md';

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  hasError?: boolean;
  size?: SelectSize;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  wrapperClassName?: string;
}

interface ExtractedOption {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
}

function extractOptions(children: React.ReactNode): ExtractedOption[] {
  const options: ExtractedOption[] = [];
  const traverse = (node: React.ReactNode) => {
    React.Children.forEach(node, (child) => {
      if (!React.isValidElement(child)) return;
      if (child.type === React.Fragment) {
        traverse(child.props.children);
      } else if (child.type === 'option') {
        const p = child.props as any;
        options.push({
          value: p.value !== undefined ? String(p.value) : '',
          label: p.children,
          disabled: Boolean(p.disabled),
        });
      }
    });
  };
  traverse(children);
  return options;
}

function getSelectBorder(hasError: boolean): string {
  if (hasError) return 'border-red-500 focus:border-red-500 focus:ring-red-200';
  return 'border-gray-300 focus:border-primary-500 focus:ring-primary-100';
}

function getSelectPadding(size: SelectSize, hasLeft: boolean): string {
  const pl = hasLeft ? (size === 'sm' ? 'pl-8' : 'pl-10') : (size === 'sm' ? 'pl-2.5' : 'pl-3.5');
  const pr = size === 'sm' ? 'pr-8' : 'pr-10';
  const py = size === 'sm' ? 'py-1.5' : 'py-2.5';
  return `${pl} ${pr} ${py}`;
}

function getSelectClasses(hasError: boolean, size: SelectSize, hasLeft: boolean, custom: string): string {
  const base = 'w-full appearance-none rounded-lg border bg-white transition-colors focus:outline-none focus:ring-2 disabled:bg-gray-50 disabled:text-gray-400 cursor-pointer disabled:cursor-not-allowed';
  const text = size === 'sm' ? 'text-xs' : 'text-sm';
  const border = getSelectBorder(hasError);
  const pad = getSelectPadding(size, hasLeft);
  return `${base} ${text} ${border} ${pad} ${custom}`;
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
  return (
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
      {icon}
    </div>
  );
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

    const setRefs = (element: HTMLSelectElement | null) => {
      internalSelectRef.current = element;
      if (typeof ref === 'function') {
        ref(element);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLSelectElement | null>).current = element;
      }
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

    useEffect(() => {
      if (props.value !== undefined) {
        setCurrentVal(String(props.value));
      }
    }, [props.value]);

    useEffect(() => {
      refreshOptions();
    }, [children]);

    useEffect(() => {
      if (!isOpen) return;
      const onMouseDown = (e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          setIsOpen(false);
        }
      };
      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setIsOpen(false);
      };
      document.addEventListener('mousedown', onMouseDown);
      document.addEventListener('keydown', onKeyDown);
      return () => {
        document.removeEventListener('mousedown', onMouseDown);
        document.removeEventListener('keydown', onKeyDown);
      };
    }, [isOpen]);

    const handleSelectOption = (optVal: string) => {
      setCurrentVal(optVal);
      if (internalSelectRef.current) {
        const nativeSetter = Object.getOwnPropertyDescriptor(
          window.HTMLSelectElement.prototype,
          'value'
        )?.set;
        if (nativeSetter) {
          nativeSetter.call(internalSelectRef.current, optVal);
        } else {
          internalSelectRef.current.value = optVal;
        }
        const event = new Event('change', { bubbles: true });
        internalSelectRef.current.dispatchEvent(event);
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

    const handleNativeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setCurrentVal(e.target.value);
      props.onChange?.(e);
    };

    const selectClass = getSelectClasses(hasError, size, !!leftIcon, className);
    const wrapperCls = wrapperClassName ? `relative ${wrapperClassName}` : 'relative w-full';

    return (
      <div ref={containerRef} className={wrapperCls}>
        {leftIcon && <LeftIconWrapper icon={leftIcon} />}
        <select
          ref={setRefs}
          className={selectClass}
          onMouseDown={handleNativeMouseDown}
          onChange={handleNativeChange}
          {...props}
        >
          {children}
        </select>
        {rightIcon ? (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
            {rightIcon}
          </div>
        ) : (
          <DefaultArrow size={size} isOpen={isOpen} />
        )}

        {isOpen && optionsList.length > 0 && (
          <ul
            role="listbox"
            className="absolute z-50 left-0 right-0 top-full mt-1.5 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden max-h-60 overflow-y-auto py-1 animate-in fade-in zoom-in-95 duration-100"
          >
            {optionsList.map((opt, idx) => {
              const isSelected = opt.value === currentVal;
              const isPlaceholder = opt.value === '';
              return (
                <li
                  key={`${opt.value}-${idx}`}
                  role="option"
                  aria-selected={isSelected}
                  onMouseDown={(e) => {
                    e.preventDefault();
                  }}
                  onClick={() => {
                    if (opt.disabled) return;
                    handleSelectOption(opt.value);
                  }}
                  className={`px-3.5 py-2.5 text-sm transition-colors flex items-center justify-between ${
                    opt.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                  } ${
                    isSelected
                      ? 'bg-primary-50 text-primary-700 font-semibold'
                      : isPlaceholder
                      ? 'text-gray-400 hover:bg-gray-50'
                      : 'text-gray-700 hover:bg-primary-50/60 hover:text-primary-700'
                  }`}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && !isPlaceholder && (
                    <Check className="w-4 h-4 text-primary-600 shrink-0 ml-2" />
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    );
  }
);
