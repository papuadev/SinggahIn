import React from 'react';
import { Check } from 'lucide-react';

export interface ExtractedOption {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
}

function parseOption(child: React.ReactElement): ExtractedOption | null {
  if (child.type !== 'option') return null;
  const p = child.props as any;
  return { value: p.value !== undefined ? String(p.value) : '', label: p.children, disabled: Boolean(p.disabled) };
}

export function extractOptions(children: React.ReactNode): ExtractedOption[] {
  const options: ExtractedOption[] = [];
  const traverse = (node: React.ReactNode) => {
    React.Children.forEach(node, (child) => {
      if (!React.isValidElement(child)) return;
      if (child.type === React.Fragment) traverse(child.props.children);
      else { const opt = parseOption(child); if (opt) options.push(opt); }
    });
  };
  traverse(children);
  return options;
}

interface SelectOptionsListProps {
  options: ExtractedOption[];
  currentVal: string;
  onSelect: (val: string) => void;
}

function getOptionCls(disabled?: boolean, isSelected?: boolean, isPlaceholder?: boolean): string {
  const base = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';
  const active = isSelected ? 'bg-primary-50 text-primary-700 font-semibold' : isPlaceholder ? 'text-gray-400 hover:bg-gray-50' : 'text-gray-700 hover:bg-primary-50/60 hover:text-primary-700';
  return `px-3.5 py-2.5 text-sm transition-colors flex items-center justify-between ${base} ${active}`;
}

function SelectOptionItem({ opt, isSelected, onSelect }: { opt: ExtractedOption; isSelected: boolean; onSelect: (val: string) => void }) {
  const isPlaceholder = opt.value === '';
  const cls = getOptionCls(opt.disabled, isSelected, isPlaceholder);
  return (
    <li role="option" aria-selected={isSelected} onMouseDown={(e) => e.preventDefault()} onClick={() => !opt.disabled && onSelect(opt.value)} className={cls}>
      <span className="truncate">{opt.label}</span>
      {isSelected && !isPlaceholder && <Check className="w-4 h-4 text-primary-600 shrink-0 ml-2" />}
    </li>
  );
}

export function SelectOptionsList({ options, currentVal, onSelect }: SelectOptionsListProps): React.JSX.Element {
  return (
    <ul role="listbox" className="absolute z-50 left-0 right-0 top-full mt-1.5 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden max-h-60 overflow-y-auto py-1 animate-in fade-in zoom-in-95 duration-100">
      {options.map((opt, idx) => (
        <SelectOptionItem key={`${opt.value}-${idx}`} opt={opt} isSelected={opt.value === currentVal} onSelect={onSelect} />
      ))}
    </ul>
  );
}
