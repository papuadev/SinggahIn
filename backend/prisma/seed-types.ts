export interface SeedRoomDef {
  name: string;
  basePrice: number;
  capacity: number;
  totalUnits: number;
  description: string;
}

export interface SeedPropertyDef {
  tenantEmail: string;
  categorySlug: string;
  title: string;
  description: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  facilities: string[];
  rooms: SeedRoomDef[];
}
