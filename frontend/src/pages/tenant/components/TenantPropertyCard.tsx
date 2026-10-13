import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Edit, Trash2 } from 'lucide-react';
import { Property } from '../../../modules/property/property.types';
import { Button } from '../../../components/atoms/Button';
import { Badge } from '../../../components/atoms/Badge';

interface PropertyCardProps {
  property: Property;
  onDelete: (prop: Property) => void;
}

function CardActions({ property, onDelete }: PropertyCardProps): React.JSX.Element {
  return (
    <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
      <Link to={`/tenant/properties/${property.id}/edit`}>
        <Button variant="outline" size="sm" leftIcon={<Edit className="w-4 h-4" />}>Ubah</Button>
      </Link>
      <Button variant="ghost" size="sm" className="text-rose-600 hover:bg-rose-50" leftIcon={<Trash2 className="w-4 h-4" />} onClick={() => onDelete(property)}>
        Hapus
      </Button>
    </div>
  );
}

function CardDetails({ property }: { property: Property }): React.JSX.Element {
  return (
    <div className="text-xs text-gray-500 space-y-1 mb-4">
      <p className="flex items-center gap-1 font-medium text-gray-700">
        <MapPin className="w-3.5 h-3.5 text-primary-600 shrink-0" /> {property.city}
      </p>
      <p className="truncate pl-4.5">{property.address}</p>
    </div>
  );
}

export function TenantPropertyCard({ property, onDelete }: PropertyCardProps): React.JSX.Element {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-base font-bold text-gray-900 line-clamp-1">{property.title}</h3>
          <Badge variant="neutral">{property.category?.name || 'Umum'}</Badge>
        </div>
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">{property.description}</p>
        <CardDetails property={property} />
      </div>
      <CardActions property={property} onDelete={onDelete} />
    </div>
  );
}
