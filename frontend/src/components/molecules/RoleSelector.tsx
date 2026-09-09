import React from 'react';
import { User, Building2 } from 'lucide-react';
import { Role } from '../../types/auth.types';

export interface RoleSelectorProps {
  value: Role;
  onChange: (role: Role) => void;
  disabled?: boolean;
}

interface RoleOptionProps {
  role: Role;
  selected: boolean;
  disabled?: boolean;
  onClick: () => void;
  title: string;
  desc: string;
  icon: React.ReactNode;
}

function RoleOption({
  selected,
  disabled,
  onClick,
  title,
  desc,
  icon,
}: RoleOptionProps): React.JSX.Element {
  const activeClass = selected
    ? 'border-primary-600 bg-primary-50 ring-2 ring-primary-500'
    : 'border-gray-200 hover:border-gray-300 bg-white';
  const disabledClass = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`flex-1 p-4 rounded-xl border text-left transition-all ${activeClass} ${disabledClass}`}
    >
      <div className="flex items-center gap-3 mb-1">
        <div className={`p-2 rounded-lg ${selected ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
          {icon}
        </div>
        <div className="font-semibold text-sm text-gray-900">{title}</div>
      </div>
      <p className="text-xs text-gray-500 line-clamp-2">{desc}</p>
    </button>
  );
}

export function RoleSelector({
  value,
  onChange,
  disabled = false,
}: RoleSelectorProps): React.JSX.Element {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <RoleOption
        role="USER"
        selected={value === 'USER'}
        disabled={disabled}
        onClick={() => onChange('USER')}
        title="Penyewa (User)"
        desc="Cari dan booking properti idaman"
        icon={<User className="w-5 h-5" />}
      />
      <RoleOption
        role="TENANT"
        selected={value === 'TENANT'}
        disabled={disabled}
        onClick={() => onChange('TENANT')}
        title="Pemilik (Tenant)"
        desc="Daftarkan dan kelola penginapan Anda"
        icon={<Building2 className="w-5 h-5" />}
      />
    </div>
  );
}
