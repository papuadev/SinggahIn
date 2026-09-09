import React from 'react';
import { AlertCircle, CheckCircle2, AlertTriangle, Info } from 'lucide-react';

export type AlertVariant = 'error' | 'success' | 'warning' | 'info';

export interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const alertStyles: Record<AlertVariant, { box: string; text: string; icon: string }> = {
  error: {
    box: 'bg-red-50 border-red-200 text-red-800',
    text: 'text-red-700',
    icon: 'text-red-500',
  },
  success: {
    box: 'bg-green-50 border-green-200 text-green-800',
    text: 'text-green-700',
    icon: 'text-green-500',
  },
  warning: {
    box: 'bg-amber-50 border-amber-200 text-amber-800',
    text: 'text-amber-700',
    icon: 'text-amber-500',
  },
  info: {
    box: 'bg-blue-50 border-blue-200 text-blue-800',
    text: 'text-blue-700',
    icon: 'text-blue-500',
  },
};

function renderIcon(variant: AlertVariant): React.JSX.Element {
  const iconClass = `w-5 h-5 flex-shrink-0 mt-0.5 ${alertStyles[variant].icon}`;
  if (variant === 'error') return <AlertCircle className={iconClass} />;
  if (variant === 'success') return <CheckCircle2 className={iconClass} />;
  if (variant === 'warning') return <AlertTriangle className={iconClass} />;
  return <Info className={iconClass} />;
}

export function Alert({
  variant = 'info',
  title,
  children,
  className = '',
}: AlertProps): React.JSX.Element {
  const styles = alertStyles[variant];
  return (
    <div
      role="alert"
      className={`flex items-start gap-3 p-4 rounded-lg border text-sm ${styles.box} ${className}`}
    >
      {renderIcon(variant)}
      <div className="flex-1">
        {title && <h5 className="font-semibold mb-0.5">{title}</h5>}
        <div className={styles.text}>{children}</div>
      </div>
    </div>
  );
}
