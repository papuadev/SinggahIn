export interface PropertyCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface PropertyImage {
  id: string;
  propertyId: string;
  imageUrl: string;
  publicId: string;
  isCover: boolean;
  createdAt?: string;
}

export interface PropertyRoomSummary {
  id: string;
  name: string;
  basePrice: number;
  capacity: number;
  totalUnits: number;
}

export interface PropertyItem {
  id: string;
  tenantId: string;
  categoryId: string;
  category?: PropertyCategory;
  title: string;
  description: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  createdAt: string;
  updatedAt: string;
  images?: PropertyImage[];
  rooms?: PropertyRoomSummary[];
  coverImage?: string;
  averageRating?: number;
  totalReviews?: number;
}

export type Property = PropertyItem;

export interface ReverseGeocodeResult {
  formattedAddress?: string;
  formatted?: string;
  address?: string;
  city: string;
  components?: {
    road?: string;
    suburb?: string;
    city?: string;
    state?: string;
    country?: string;
    postcode?: string;
  };
}

export interface GeocodeSuggestion {
  latitude: number;
  longitude: number;
  formattedAddress: string;
  city: string;
}

export interface CreatePropertyPayload {
  title: string;
  categoryId: string;
  description: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
}

export type UpdatePropertyPayload = Partial<CreatePropertyPayload>;

export interface CatalogPricing {
  averageNightRate: number;
  totalStayPrice: number;
  totalNights: number;
}

export interface CatalogPropertyItem {
  id: string;
  title: string;
  city: string;
  address: string;
  category: { name: string; slug: string };
  coverImage: string | null;
  averageRating: number;
  totalReviews: number;
  pricing: CatalogPricing;
}

export interface CatalogQueryParams {
  city?: string;
  name?: string;
  category?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  sortBy?: 'price' | 'name';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}
