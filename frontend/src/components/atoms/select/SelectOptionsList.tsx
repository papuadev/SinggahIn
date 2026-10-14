import React from 'react';
import { Check } from 'lucide-react';

export interface ExtractedOption {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
}

export function extractOptions(children: React.ReactNode): ExtractedOption[] {
  const options: ExtractedOption[] = [];
  const traverse = (node: React.ReactNode) => {
    React.Children.forEach(node, (child) => {
      if (!React.isValidElement(child)) return;
      if (child.type === React.Fragment) {
        traverse(child.props.children);
      } else if (child.type === 'option') {
        const p = child.props as any;
        options.push({ value: p.value !== undefined ? String(p.value) : '', label: p.children, disabled: Boolean(p.disabled) });
      }
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

export function SelectOptionsList({ options, currentVal, onSelect }: SelectOptionsListProps): React.JSX.Element {
  return (
    <ul role="listbox" className="absolute z-50 left-0 right-0 top-full mt-1.5 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden max-h-60 overflow-y-auto py-1 animate-in fade-in zoom-in-95 duration-100">
      {options.map((opt, idx) => {
        const isSelected = opt.value === currentVal;
        const isPlaceholder = opt.value === '';
        const baseCls = opt.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';
        const activeCls = isSelected ? 'bg-primary-50 text-primary-700 font-semibold' : isPlaceholder ? 'text-gray-400 hover:bg-gray-50' : 'text-gray-700 hover:bg-primary-50/60 hover:text-primary-700';

        return (
          <li
            key={`${opt.value}-${idx}`} role="option" aria-selected={isSelected}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => { if (!opt.disabled) onSelect(opt.value); }}
            className={`px-3.5 py-2.5 text-sm transition-colors flex items-center justify-between ${baseCls} ${activeCls}`}
          >
            <span className="truncate">{opt.label}</span>
            {isSelected && !isPlaceholder && <Check className="w-4 h-4 text-primary-600 shrink-0 ml-2" />}
          </li>
        );
      })}
    </ul>
  );
}
