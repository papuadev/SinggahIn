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

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  function Input(
    { hasError = false, leftIcon, rightIcon, className = '', ...props },
    ref
  ): React.JSX.Element {
    const inputClass = getInputClasses(hasError, !!leftIcon, !!rightIcon, className);
    return (
      <div className="relative w-full">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            {leftIcon}
          </div>
        )}
        <input ref={ref} className={inputClass} {...props} />
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400">
            {rightIcon}
          </div>
        )}
      </div>
    );
  }
);
