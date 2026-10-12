import {
  toUtcDate,
  generateDateRange,
  resolveModifierForDate,
  buildDailyPrice,
  aggregateStayPricing,
} from '../room/pricing.helper';
import { RoomPriceModifierDto } from '../room/pricing.types';
import {
  CatalogPropertyItemDto,
  CatalogPropertyPricingDto,
} from './catalog.types';

export interface RawRoomRecord {
  id: string;
  basePrice: number;
  weekendRatePercent?: number | null;
  capacity: number;
  totalUnits: number;
  modifiers: RoomPriceModifierDto[];
  unavailabilities: unknown[];
  bookings: unknown[];
}

export interface RawPropertyRecord {
  id: string;
  title: string;
  city: string;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
  category: { name: string; slug: string };
  images: { imageUrl: string; isCover: boolean }[];
  reviews: { rating: number }[];
  rooms: RawRoomRecord[];
}

export function calculateRating(reviews: { rating: number }[]): {
  averageRating: number;
  totalReviews: number;
} {
  const total = reviews.length;
  if (total === 0) return { averageRating: 0, totalReviews: 0 };
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return { averageRating: Math.round((sum / total) * 10) / 10, totalReviews: total };
}

export function resolveCoverImage(
  images: { imageUrl: string; isCover: boolean }[]
): string | null {
  if (!images || images.length === 0) return null;
  const cover = images.find((img) => img.isCover);
  return cover ? cover.imageUrl : images[0].imageUrl;
}

export function isRoomAvailableForDates(room: RawRoomRecord): boolean {
  if (room.unavailabilities.length > 0) return false;
  return room.totalUnits > room.bookings.length;
}

export function computeRoomPricing(
  room: RawRoomRecord,
  checkIn?: string,
  checkOut?: string
): CatalogPropertyPricingDto {
  if (!checkIn || !checkOut) {
    return { averageNightRate: room.basePrice, totalStayPrice: room.basePrice, totalNights: 1 };
  }
  const dates = generateDateRange(toUtcDate(checkIn), toUtcDate(checkOut));
  const breakdown = dates.map((d) => {
    const mod = resolveModifierForDate(room.modifiers, d, room.basePrice);
    return buildDailyPrice(d, room.basePrice, mod, room.weekendRatePercent);
  });
  const res = aggregateStayPricing(room.id, checkIn, checkOut, room.basePrice, breakdown);
  return { averageNightRate: res.averageNightRate, totalStayPrice: res.totalStayPrice, totalNights: res.totalNights };
}

function filterEligibleRooms(
  rooms: RawRoomRecord[],
  checkIn?: string,
  checkOut?: string,
  guests?: number
): RawRoomRecord[] {
  return rooms.filter((r) => {
    if (guests && r.capacity < guests) return false;
    if (checkIn && checkOut && !isRoomAvailableForDates(r)) return false;
    return true;
  });
}

function pickCheaperPricing(
  current: CatalogPropertyPricingDto | null,
  next: CatalogPropertyPricingDto
): CatalogPropertyPricingDto {
  if (!current || next.averageNightRate < current.averageNightRate) return next;
  return current;
}

export function findBestRoomPricing(
  rooms: RawRoomRecord[],
  checkIn?: string,
  checkOut?: string,
  guests?: number
): CatalogPropertyPricingDto | null {
  const eligible = filterEligibleRooms(rooms, checkIn, checkOut, guests);
  if (eligible.length === 0) return null;
  return eligible.reduce<CatalogPropertyPricingDto | null>(
    (acc, room) => pickCheaperPricing(acc, computeRoomPricing(room, checkIn, checkOut)),
    null
  );
}

function mapPropertyBase(
  p: RawPropertyRecord,
  rating: { averageRating: number; totalReviews: number }
) {
  return {
    id: p.id,
    title: p.title,
    city: p.city,
    address: p.address,
    category: { name: p.category.name, slug: p.category.slug },
    coverImage: resolveCoverImage(p.images),
    averageRating: rating.averageRating,
    totalReviews: rating.totalReviews,
  };
}

export function calculateHaversineDistance(
  lat1: number, lon1: number, lat2: number, lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export function formatCatalogProperty(
  property: RawPropertyRecord,
  pricing: CatalogPropertyPricingDto,
  userLat?: number,
  userLon?: number
): CatalogPropertyItemDto {
  const ratingInfo = calculateRating(property.reviews);
  const dist =
    userLat !== undefined && userLon !== undefined && property.latitude && property.longitude
      ? calculateHaversineDistance(userLat, userLon, property.latitude, property.longitude)
      : undefined;
  return { ...mapPropertyBase(property, ratingInfo), pricing, distanceInKm: dist };
}
