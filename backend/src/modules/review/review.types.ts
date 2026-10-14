export interface CreateReviewInput {
  bookingId: string;
  rating: number;
  comment: string;
}

export interface ReviewAuthorDto {
  id: string;
  name: string;
  avatarUrl?: string | null;
}

export interface ReviewResponseDto {
  id: string;
  bookingId: string;
  userId: string;
  propertyId: string;
  rating: number;
  comment: string;
  createdAt: string;
  user?: ReviewAuthorDto;
}

export interface PropertyReviewListResponseDto {
  reviews: ReviewResponseDto[];
  totalReviews: number;
  averageRating: number;
  page: number;
  limit: number;
  totalPages: number;
}
