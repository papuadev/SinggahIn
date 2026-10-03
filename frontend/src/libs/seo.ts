export interface LodgingBusinessParams {
  title: string;
  description?: string;
  images?: Array<{ imageUrl: string }> | string[];
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  lowestPrice?: number;
  averageRating?: number;
  totalReviews?: number;
  url?: string;
}

export function buildFullTitle(title?: string): string {
  const brand = 'SinggahIn';
  if (!title) return `${brand} - Sewa Penginapan & Villa Impian di Indonesia`;
  return title.includes(brand) ? title : `${title} | ${brand}`;
}

function extractImageUrls(images?: Array<{ imageUrl: string }> | string[]): string[] {
  if (!images || images.length === 0) return [];
  return images.map((img) => (typeof img === 'string' ? img : img.imageUrl));
}

function buildRatingSchema(rating?: number, count?: number) {
  if (!count || count <= 0) return undefined;
  return { '@type': 'AggregateRating' as const, ratingValue: rating || 0, reviewCount: count };
}

function buildAddressSchema(streetAddress: string, addressLocality: string) {
  return { '@type': 'PostalAddress' as const, streetAddress, addressLocality, addressCountry: 'ID' };
}

function buildGeoSchema(latitude: number, longitude: number) {
  return { '@type': 'GeoCoordinates' as const, latitude, longitude };
}

export function createLodgingBusinessSchema(p: LodgingBusinessParams): Record<string, unknown> {
  const imgs = extractImageUrls(p.images);
  return {
    '@context': 'https://schema.org',
    '@type': 'LodgingBusiness',
    name: p.title,
    description: p.description || '',
    ...(imgs.length > 0 && { image: imgs }),
    address: buildAddressSchema(p.address, p.city),
    geo: buildGeoSchema(p.latitude, p.longitude),
    ...(p.lowestPrice && { priceRange: `IDR ${p.lowestPrice}` }),
    aggregateRating: buildRatingSchema(p.averageRating, p.totalReviews),
  };
}
