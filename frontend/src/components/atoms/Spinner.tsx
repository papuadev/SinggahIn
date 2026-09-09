import React from 'react';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses: Record<NonNullable<SpinnerProps['size']>, string> = {
  sm: 'w-4 h-4 border-2',
  md: 'w-5 h-5 border-2',
  lg: 'w-8 h-8 border-3',
};

export function Spinner({ size = 'md', className = '' }: SpinnerProps): React.JSX.Element {
  const sizeClass = sizeClasses[size];
  const combined = `animate-spin rounded-full border-current border-t-transparent ${sizeClass} ${className}`;
  return (
    <span
      role="status"
      aria-label="Memuat..."
      className={combined}
    />
  );
}
