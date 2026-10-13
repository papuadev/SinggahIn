export type SelectSize = 'sm' | 'md';

export function getSelectBorder(hasError: boolean): string {
  if (hasError) return 'border-red-500 focus:border-red-500 focus:ring-red-200';
  return 'border-gray-300 focus:border-primary-500 focus:ring-primary-100';
}

export function getSelectPadding(size: SelectSize, hasLeft: boolean): string {
  const pl = hasLeft ? (size === 'sm' ? 'pl-8' : 'pl-10') : (size === 'sm' ? 'pl-2.5' : 'pl-3.5');
  const pr = size === 'sm' ? 'pr-8' : 'pr-10';
  const py = size === 'sm' ? 'py-1.5' : 'py-2.5';
  return `${pl} ${pr} ${py}`;
}

export function getSelectClasses(hasError: boolean, size: SelectSize, hasLeft: boolean, custom: string): string {
  const base = 'w-full appearance-none rounded-lg border bg-white transition-colors focus:outline-none focus:ring-2 disabled:bg-gray-50 disabled:text-gray-400 cursor-pointer disabled:cursor-not-allowed';
  const text = size === 'sm' ? 'text-xs' : 'text-sm';
  const border = getSelectBorder(hasError);
  const pad = getSelectPadding(size, hasLeft);
  return `${base} ${text} ${border} ${pad} ${custom}`;
}
