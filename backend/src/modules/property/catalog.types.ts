export interface CatalogPropertyPricingDto {
  averageNightRate: number;
  totalStayPrice: number;
  totalNights: number;
}

export interface CatalogPropertyCategoryDto {
  name: string;
  slug: string;
}

export interface CatalogPropertyItemDto {
  id: string;
  title: string;
  city: string;
  address: string;
  category: CatalogPropertyCategoryDto;
  coverImage: string | null;
  averageRating: number;
  totalReviews: number;
  pricing: CatalogPropertyPricingDto;
}
