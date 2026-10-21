import https from 'https';
import axios from 'axios';
import {
  GeocodeResult,
  ReverseGeocodeResult,
  GeocodeSuggestion,
  OpenCageApiResponse,
  OpenCageComponents,
  OpenCageItem,
} from '../types/opencage.types';

export { GeocodeResult, ReverseGeocodeResult, GeocodeSuggestion };

const httpsAgent = new https.Agent({ family: 4, keepAlive: true });

function getApiKey(): string | undefined {
  return process.env.OPENCAGE_API_KEY;
}

function buildGeocodeUrl(query: string, key: string, limit = 1): string {
  const base = 'https://api.opencagedata.com/geocode/v1/json';
  const encoded = encodeURIComponent(query);
  return `${base}?q=${encoded}&key=${key}&limit=${limit}&language=id&countrycode=id&no_annotations=1`;
}

async function fetchOpenCage(url: string): Promise<OpenCageApiResponse | null> {
  try {
    const response = await axios.get<OpenCageApiResponse>(url, { httpsAgent, timeout: 5000 });
    return response.data;
  } catch {
    return null;
  }
}

function extractCity(comp?: OpenCageComponents): string {
  if (!comp) return '';
  return comp._normalized_city || comp.city || comp.town || comp.village || comp.county || '';
}

function extractAddress(comp?: OpenCageComponents, formatted?: string): string {
  if (!comp) return formatted || '';
  const parts = [comp.road, comp.house_number].filter(Boolean);
  return parts.length > 0 ? parts.join(' No. ') : formatted || '';
}

function parseForwardResult(item?: OpenCageItem): GeocodeResult | null {
  if (!item?.geometry) return null;
  return {
    latitude: item.geometry.lat,
    longitude: item.geometry.lng,
    formattedAddress: item.formatted || '',
  };
}

function parseReverseResult(item?: OpenCageItem): ReverseGeocodeResult | null {
  if (!item) return null;
  return {
    city: extractCity(item.components),
    address: extractAddress(item.components, item.formatted),
    formatted: item.formatted || '',
  };
}

export async function forwardGeocode(
  address: string,
  city: string
): Promise<GeocodeResult | null> {
  const key = getApiKey();
  if (!key) return null;
  const query = [address, city].filter(Boolean).join(', ');
  if (!query) return null;
  const url = buildGeocodeUrl(query, key);
  const data = await fetchOpenCage(url);
  return parseForwardResult(data?.results?.[0]);
}

export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<ReverseGeocodeResult | null> {
  const key = getApiKey();
  if (!key) return null;
  const query = `${latitude}+${longitude}`;
  const url = buildGeocodeUrl(query, key);
  const data = await fetchOpenCage(url);
  return parseReverseResult(data?.results?.[0]);
}

function mapGeocodeSuggestion(item: OpenCageItem): GeocodeSuggestion {
  return {
    latitude: item.geometry.lat,
    longitude: item.geometry.lng,
    formattedAddress: item.formatted || '',
    city: extractCity(item.components),
  };
}

export async function searchAddress(
  query: string,
  limit = 5
): Promise<GeocodeSuggestion[]> {
  const key = getApiKey();
  if (!key || !query?.trim()) return [];
  const url = buildGeocodeUrl(query.trim(), key, limit);
  const data = await fetchOpenCage(url);
  return data?.results ? data.results.map(mapGeocodeSuggestion) : [];
}
