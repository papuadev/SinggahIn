import React from 'react';
import { Label } from '../atoms/Label';

export interface FormFieldProps {
  label?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormField({
  label,
  required,
  error,
  hint,
  htmlFor,
  children,
  className = '',
}: FormFieldProps): React.JSX.Element {
  return (
    <div className={`w-full space-y-1 ${className}`}>
      {label && (
        <Label htmlFor={htmlFor} required={required}>
          {label}
        </Label>
      )}
      {children}
      {error && <p className="text-xs text-red-600 font-medium mt-1">{error}</p>}
      {!error && hint && <p className="text-xs text-gray-500 mt-1">{hint}</p>}
    </div>
  );
}
