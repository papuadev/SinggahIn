import React from 'react';
import { ChevronDown } from 'lucide-react';

export type SelectSize = 'sm' | 'md';

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  hasError?: boolean;
  size?: SelectSize;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  wrapperClassName?: string;
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

function DefaultArrow({ size }: { size: SelectSize }) {
  const iconCls = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';
  const posCls = size === 'sm' ? 'right-2.5' : 'right-3.5';
  return (
    <div className={`absolute inset-y-0 ${posCls} flex items-center pointer-events-none text-gray-400`}>
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
    const selectClass = getSelectClasses(hasError, size, !!leftIcon, className);
    const wrapperCls = wrapperClassName ? `relative ${wrapperClassName}` : 'relative w-full';
    return (
      <div className={wrapperCls}>
        {leftIcon && <LeftIconWrapper icon={leftIcon} />}
        <select ref={ref} className={selectClass} {...props}>
          {children}
        </select>
        {rightIcon ? (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
            {rightIcon}
          </div>
        ) : (
          <DefaultArrow size={size} />
        )}
      </div>
    );
  }
);
