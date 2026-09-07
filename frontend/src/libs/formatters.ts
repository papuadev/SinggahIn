import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(amount);
}

function formatUnit(val: number, unit: string): string {
  const formatted = val.toFixed(1).replace('.0', '').replace('.', ',');
  return `Rp ${formatted}${unit}`;
}

export function formatCompactRupiah(amount: number): string {
  if (amount >= 1_000_000_000) return formatUnit(amount / 1_000_000_000, 'M');
  if (amount >= 1_000_000) return formatUnit(amount / 1_000_000, 'jt');
  if (amount >= 1_000) return `Rp ${(amount / 1_000).toFixed(0)}rb`;
  return `Rp ${amount}`;
}

export function formatDateID(
  date: Date | string | number,
  pattern = 'dd MMMM yyyy'
): string {
  const d = typeof date === 'string' ? parseISO(date) : new Date(date);
  return format(d, pattern, { locale: id });
}
