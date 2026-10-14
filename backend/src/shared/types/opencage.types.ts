export interface GeocodeResult {
  latitude: number;
  longitude: number;
  formattedAddress: string;
}

export interface ReverseGeocodeResult {
  city: string;
  address: string;
  formatted: string;
  formattedAddress?: string;
}

export interface GeocodeSuggestion {
  latitude: number;
  longitude: number;
  formattedAddress: string;
  city: string;
}

export interface OpenCageGeometry {
  lat: number;
  lng: number;
}

export interface OpenCageComponents {
  city?: string;
  town?: string;
  village?: string;
  county?: string;
  _normalized_city?: string;
  road?: string;
  house_number?: string;
  postcode?: string;
  state?: string;
  country?: string;
}

export interface OpenCageItem {
  geometry: OpenCageGeometry;
  formatted: string;
  components: OpenCageComponents;
}

export interface OpenCageApiResponse {
  results: OpenCageItem[];
  status: {
    code: number;
    message: string;
  };
}
