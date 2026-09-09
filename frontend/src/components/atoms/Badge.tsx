import React from 'react';
import { Role } from '../../types/auth.types';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'user' | 'tenant' | 'success' | 'warning' | 'neutral';
  className?: string;
}

const variantStyles: Record<NonNullable<BadgeProps['variant']>, string> = {
  user: 'bg-sky-100 text-sky-800 border-sky-200',
  tenant: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  success: 'bg-green-100 text-green-800 border-green-200',
  warning: 'bg-amber-100 text-amber-800 border-amber-200',
  neutral: 'bg-gray-100 text-gray-800 border-gray-200',
};

export function Badge({
  children,
  variant = 'neutral',
  className = '',
}: BadgeProps): React.JSX.Element {
  const styles = variantStyles[variant];
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles} ${className}`}
    >
      {children}
    </span>
  );
}

export function RoleBadge({ role }: { role: Role }): React.JSX.Element {
  const isTenant = role === 'TENANT';
  const label = isTenant ? 'Pemilik (Tenant)' : 'Penyewa (User)';
  const variant = isTenant ? 'tenant' : 'user';
  return <Badge variant={variant}>{label}</Badge>;
}
