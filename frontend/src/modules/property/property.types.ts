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
  description?: string | null;
  weekendRatePercent?: number | null;
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
  facilities?: string[];
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
  facilities?: string[];
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
  sortBy?: 'price' | 'name' | 'rating';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface CalendarDayItem {
  date: string;
  price: number;
  isAvailable: boolean;
  reason: string | null;
}

export interface CalendarResponseData {
  roomId: string;
  basePrice: number;
  calendar: CalendarDayItem[];
}

export interface CalendarQueryParams {
  month: number;
  year: number;
  roomId?: string;
}

