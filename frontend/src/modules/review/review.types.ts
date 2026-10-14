export interface ReviewAuthor {
  id: string;
  name: string;
  avatarUrl?: string | null;
}

export interface Review {
  id: string;
  bookingId: string;
  userId: string;
  propertyId: string;
  rating: number;
  comment: string;
  createdAt: string;
  user?: ReviewAuthor;
}

export interface CreateReviewPayload {
  bookingId: string;
  rating: number;
  comment: string;
}

export interface PropertyReviewResponse {
  reviews: Review[];
  totalReviews: number;
  averageRating: number;
  page: number;
  limit: number;
  totalPages: number;
}
