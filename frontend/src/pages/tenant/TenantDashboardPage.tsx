import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Plus, Edit, Calendar } from 'lucide-react';
import { useTenantProperties, usePropertyDetail } from '../../modules/property/hooks/useProperties';
import { TenantRoomStatusCalendar } from '../../modules/room/components/TenantRoomStatusCalendar';
import { Property } from '../../modules/property/property.types';
import { Button } from '../../components/atoms/Button';
import { Spinner } from '../../components/atoms/Spinner';
import { Alert } from '../../components/atoms/Alert';

function DashboardHeader(): React.JSX.Element {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <div className="flex items-center gap-2">
          <Calendar className="w-6 h-6 text-primary-600" />
          <h1 className="text-2xl font-bold text-gray-900">Dasbor &amp; Kalender Kamar</h1>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          Pantau status ketersediaan unit kamar (allotment) dan tarif harian untuk rekonsiliasi.
        </p>
      </div>
      <Link to="/tenant/properties/new">
        <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
          Tambah Properti
        </Button>
      </Link>
    </div>
  );
}

function EmptyDashboard(): React.JSX.Element {
  return (
    <div className="text-center py-16 bg-white rounded-xl border border-gray-200 p-8 shadow-xs">
      <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
      <h3 className="text-lg font-bold text-gray-900 mb-1">Belum Ada Properti Terdaftar</h3>
      <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
        Tambahkan properti pertama Anda untuk mulai mengelola unit kamar dan memantau kalender status ketersediaan.
      </p>
      <Link to="/tenant/properties/new">
        <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
          Tambah Properti Sekarang
        </Button>
      </Link>
    </div>
  );
}

interface SelectorProps {
  properties: Property[];
  selectedId: string;
  onChange: (id: string) => void;
}

function PropertySelectorBar({ properties, selectedId, onChange }: SelectorProps): React.JSX.Element {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white rounded-xl border border-gray-200 mb-6 shadow-xs">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <label htmlFor="dashboard-prop-select" className="text-xs sm:text-sm font-semibold text-gray-700 shrink-0">
          Pilih Properti:
        </label>
        <select
          id="dashboard-prop-select"
          value={selectedId}
          onChange={(e) => onChange(e.target.value)}
          className="text-xs sm:text-sm rounded-lg border border-gray-300 py-1.5 px-3 bg-white font-medium text-gray-800 focus:ring-2 focus:ring-primary-100 focus:border-primary-500 truncate"
        >
          {properties.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title} ({p.city})
            </option>
          ))}
        </select>
      </div>
      <Link to={`/tenant/properties/${selectedId}/edit`}>
        <Button variant="outline" size="sm" leftIcon={<Edit className="w-3.5 h-3.5" />}>
          Kelola Properti Ini
        </Button>
      </Link>
    </div>
  );
}

function CalendarDisplay({ propertyId }: { propertyId: string }): React.JSX.Element {
  const { data: prop, isLoading, error } = usePropertyDetail(propertyId);
  if (isLoading) return <div className="flex justify-center py-12"><Spinner size="md" /></div>;
  if (error || !prop) return <Alert variant="error">Gagal memuat detail kamar properti.</Alert>;
  return <TenantRoomStatusCalendar propertyId={propertyId} rooms={prop.rooms || []} />;
}

export function TenantDashboardPage(): React.JSX.Element {
  const { data: properties, isLoading, isError, error } = useTenantProperties();
  const [selectedPropId, setSelectedPropId] = useState<string>('');

  useEffect(() => {
    if (properties && properties.length > 0 && !selectedPropId) {
      setSelectedPropId(properties[0].id);
    }
  }, [properties, selectedPropId]);

  if (isLoading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>;
  if (isError) return <Alert variant="error">{error?.message || 'Gagal memuat properti'}</Alert>;
  if (!properties || properties.length === 0) return <EmptyDashboard />;

  const activeId = selectedPropId || properties[0].id;
  return (
    <div className="max-w-7xl mx-auto py-2">
      <DashboardHeader />
      <PropertySelectorBar properties={properties} selectedId={activeId} onChange={setSelectedPropId} />
      <CalendarDisplay propertyId={activeId} />
    </div>
  );
}
