import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

function getInputClasses(hasError: boolean, hasLeft: boolean, hasRight: boolean, custom: string): string {
  const base = 'w-full rounded-lg border text-sm transition-colors placeholder:text-gray-400 focus:outline-none focus:ring-2 disabled:bg-gray-50 disabled:text-gray-500';
  const border = hasError
    ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
    : 'border-gray-300 focus:border-primary-500 focus:ring-primary-100';
  const pl = hasLeft ? 'pl-10' : 'pl-3.5';
  const pr = hasRight ? 'pr-10' : 'pr-3.5';
  return `${base} ${border} ${pl} ${pr} py-2.5 ${custom}`;
}

function InputAdornment({ icon, side }: { icon: React.ReactNode; side: 'left' | 'right' }) {
  if (!icon) return null;
  const pos = side === 'left' ? 'left-0 pl-3 pointer-events-none' : 'right-0 pr-3';
  return <div className={`absolute inset-y-0 ${pos} flex items-center text-gray-400`}>{icon}</div>;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  function Input({ hasError = false, leftIcon, rightIcon, className = '', ...props }, ref): React.JSX.Element {
    const inputClass = getInputClasses(hasError, !!leftIcon, !!rightIcon, className);
    return (
      <div className="relative w-full">
        <InputAdornment icon={leftIcon} side="left" />
        <input ref={ref} className={inputClass} {...props} />
        <InputAdornment icon={rightIcon} side="right" />
      </div>
    );
  }
);
