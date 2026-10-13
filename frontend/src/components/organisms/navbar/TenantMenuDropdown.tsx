import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, Building2, BarChart3, ChevronDown } from 'lucide-react';

interface TenantMenuProps {
  onSelect: () => void;
}

function SubLink({ to, label, onSelect }: { to: string; label: string; onSelect: () => void }) {
  return (
    <Link to={to} onClick={onSelect} className="block py-1.5 text-xs text-gray-600 hover:text-primary-600 hover:font-medium transition-colors">
      {label}
    </Link>
  );
}

function PropertySubMenu({ onSelect }: { onSelect: () => void }) {
  return (
    <div className="bg-gray-50/80 py-1 pl-10 pr-4 space-y-0.5 border-y border-gray-100">
      <SubLink to="/tenant/properties/new" label="Tambah Properti" onSelect={onSelect} />
      <SubLink to="/tenant/properties" label="Kelola Properti" onSelect={onSelect} />
      <SubLink to="/tenant/categories" label="Kategori Properti" onSelect={onSelect} />
    </div>
  );
}

function ReportSubMenu({ onSelect }: { onSelect: () => void }) {
  return (
    <div className="bg-gray-50/80 py-1 pl-10 pr-4 space-y-0.5 border-y border-gray-100">
      <SubLink to="/tenant/reports/sales" label="Laporan Penjualan" onSelect={onSelect} />
      <SubLink to="/tenant/reports/occupancy" label="Matriks Okupansi" onSelect={onSelect} />
    </div>
  );
}

function AccordionTrigger({ icon, label, isOpen, onToggle }: any) {
  const iconCls = isOpen ? 'rotate-180 text-primary-600' : 'text-gray-400';
  return (
    <button type="button" onClick={onToggle}
      className="w-full flex items-center justify-between px-4 py-2 hover:bg-gray-50 hover:text-primary-600 transition-colors text-left cursor-pointer">
      <div className="flex items-center gap-2.5">
        {icon} <span>{label}</span>
      </div>
      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${iconCls}`} />
    </button>
  );
}

function DirectLinks({ onSelect }: { onSelect: () => void }) {
  return (
    <>
      <Link to="/tenant/dashboard" onClick={onSelect} className="flex items-center gap-2.5 px-4 py-2 hover:bg-gray-50 hover:text-primary-600 transition-colors">
        <LayoutDashboard className="w-4 h-4 text-primary-600 shrink-0" /> Dashboard
      </Link>
      <Link to="/tenant/orders" onClick={onSelect} className="flex items-center gap-2.5 px-4 py-2 hover:bg-gray-50 hover:text-primary-600 transition-colors">
        <ClipboardList className="w-4 h-4 text-primary-600 shrink-0" /> Kelola Pesanan
      </Link>
    </>
  );
}

function PropertySection({ onSelect }: { onSelect: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div>
      <AccordionTrigger icon={<Building2 className="w-4 h-4 text-primary-600 shrink-0" />} label="Manajemen Properti" isOpen={isOpen} onToggle={() => setIsOpen((p) => !p)} />
      {isOpen && <PropertySubMenu onSelect={onSelect} />}
    </div>
  );
}

function ReportSection({ onSelect }: { onSelect: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div>
      <AccordionTrigger icon={<BarChart3 className="w-4 h-4 text-primary-600 shrink-0" />} label="Laporan / Analytic" isOpen={isOpen} onToggle={() => setIsOpen((p) => !p)} />
      {isOpen && <ReportSubMenu onSelect={onSelect} />}
    </div>
  );
}

export function TenantMenuDropdown({ onSelect }: TenantMenuProps): React.JSX.Element {
  return (
    <div className="space-y-0.5">
      <DirectLinks onSelect={onSelect} />
      <PropertySection onSelect={onSelect} />
      <ReportSection onSelect={onSelect} />
    </div>
  );
}
