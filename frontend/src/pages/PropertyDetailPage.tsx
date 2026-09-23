import React from 'react';
import { Link } from 'react-router-dom';
import { Building, ArrowLeft } from 'lucide-react';
import { PropertyDetailBreadcrumb } from '../components/organisms/property-detail/PropertyDetailBreadcrumb';
import { PropertyDetailHeader } from '../components/organisms/property-detail/PropertyDetailHeader';
import { PropertyDetailGallery } from '../components/organisms/property-detail/PropertyDetailGallery';
import { PropertyDetailDescription } from '../components/organisms/property-detail/PropertyDetailDescription';
import { PropertyDetailFacilities } from '../components/organisms/property-detail/PropertyDetailFacilities';
import { PropertyDetailRoomList } from '../components/organisms/property-detail/PropertyDetailRoomList';
import { PropertyDetailMap } from '../components/organisms/property-detail/PropertyDetailMap';
import { PropertyDetailSidebar } from '../components/organisms/property-detail/PropertyDetailSidebar';
import { PropertyDetailMobileBar } from '../components/organisms/property-detail/PropertyDetailMobileBar';
import { PropertyDetailSkeleton } from '../components/organisms/property-detail/PropertyDetailSkeleton';
import { Button } from '../components/atoms/Button';
import { usePropertyDetailPage } from './usePropertyDetailPage';

interface MainColProps {
  property: NonNullable<ReturnType<typeof usePropertyDetailPage>['property']>;
  rooms: ReturnType<typeof usePropertyDetailPage>['rooms'];
  checkIn?: string;
  checkOut?: string;
  onBook: (roomId: string) => void;
}

function PropertyNotFound() {
  return (
    <div className="py-20 text-center max-w-md mx-auto flex flex-col items-center gap-3">
      <Building className="w-12 h-12 text-gray-300" />
      <h2 className="text-xl font-bold text-gray-900">Properti Tidak Ditemukan</h2>
      <p className="text-sm text-gray-500">Properti yang Anda cari tidak tersedia atau mungkin telah dihapus.</p>
      <Link to="/search">
        <Button variant="primary" size="md" leftIcon={<ArrowLeft className="w-4 h-4" />}>Kembali ke Katalog</Button>
      </Link>
    </div>
  );
}

function PropertyMainCol({ property, rooms, checkIn, checkOut, onBook }: MainColProps) {
  return (
    <div className="lg:col-span-8 flex flex-col">
      <PropertyDetailDescription description={property.description} />
      <PropertyDetailFacilities facilities={property.facilities} />
      <PropertyDetailRoomList propertyId={property.id} rooms={rooms} checkIn={checkIn} checkOut={checkOut} onBookRoom={onBook} />
      <PropertyDetailMap latitude={property.latitude} longitude={property.longitude} address={property.address} city={property.city} />
    </div>
  );
}

function PropertyDetailHero({ property }: { property: NonNullable<ReturnType<typeof usePropertyDetailPage>['property']> }) {
  const { title, category, address, city, averageRating, totalReviews, images } = property;
  return (
    <>
      <PropertyDetailBreadcrumb title={title} city={city} />
      <PropertyDetailHeader title={title} categoryName={category?.name} address={address} city={city} averageRating={averageRating} totalReviews={totalReviews} />
      <PropertyDetailGallery images={images} title={title} />
    </>
  );
}

function PropertyDetailGrid({ state }: { state: ReturnType<typeof usePropertyDetailPage> }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <PropertyMainCol property={state.property!} rooms={state.rooms} checkIn={state.checkIn} checkOut={state.checkOut} onBook={state.handleBookRoom} />
      <div className="lg:col-span-4">
        <PropertyDetailSidebar lowestPrice={state.lowestPrice} onScrollToRooms={state.scrollToRooms} />
      </div>
    </div>
  );
}

export function PropertyDetailPage(): React.JSX.Element {
  const state = usePropertyDetailPage();
  if (state.isLoading) return <PropertyDetailSkeleton />;
  if (state.isError || !state.property) return <PropertyNotFound />;
  return (
    <article className="pb-16 flex flex-col gap-6 max-w-7xl mx-auto">
      <PropertyDetailHero property={state.property} />
      <PropertyDetailGrid state={state} />
      <PropertyDetailMobileBar lowestPrice={state.lowestPrice} onScrollToRooms={state.scrollToRooms} />
    </article>
  );
}
