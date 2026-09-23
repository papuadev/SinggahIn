export interface PropertyCategoryDto {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
}

export interface PropertyImageDto {
  id: string;
  propertyId: string;
  imageUrl: string;
  publicId: string;
  isCover: boolean;
  createdAt: Date;
}

export interface PropertyResponseDto {
  id: string;
  tenantId: string;
  categoryId: string;
  title: string;
  description: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  facilities?: string[];
  category?: PropertyCategoryDto;
  images?: PropertyImageDto[];
  rooms?: any[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PropertyListItemDto {
  id: string;
  title: string;
  city: string;
  address: string;
  category: PropertyCategoryDto;
  coverImage: string | null;
  createdAt: Date;
}
