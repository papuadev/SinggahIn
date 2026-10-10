import React, { useState } from 'react';
import { MessageSquare, ChevronLeft, ChevronRight, User as UserIcon } from 'lucide-react';
import { usePropertyReviews } from '../hooks/usePropertyReviews';
import { StarRatingDisplay } from './StarRating';
import { formatDateID } from '../../../libs/formatters';
import { Review, PropertyReviewResponse } from '../review.types';
import { Button } from '../../../components/atoms/Button';

function ReviewSummaryCard({ avg, total }: { avg: number; total: number }) {
  return (
    <div className="flex items-center gap-4 p-4 bg-amber-50/60 border border-amber-100 rounded-xl mb-6">
      <div className="flex flex-col items-center justify-center min-w-[70px] border-r border-amber-200/60 pr-4">
        <span className="text-3xl font-bold text-gray-900">{avg > 0 ? avg.toFixed(1) : '0.0'}</span>
        <span className="text-[10px] text-gray-500 font-medium">dari 5.0</span>
      </div>
      <div className="space-y-1">
        <StarRatingDisplay rating={avg} size="md" />
        <p className="text-xs text-gray-600 font-medium">Berdasarkan {total} ulasan tamu terverifikasi</p>
      </div>
    </div>
  );
}

function ReviewAvatar({ name, avatarUrl }: { name?: string; avatarUrl?: string | null }) {
  if (avatarUrl) {
    return <img src={avatarUrl} alt={name || 'Tamu'} className="w-10 h-10 rounded-full object-cover border border-gray-200" />;
  }
  return (
    <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm shrink-0">
      {name ? name.charAt(0).toUpperCase() : <UserIcon className="w-5 h-5" />}
    </div>
  );
}

function ReviewItemCard({ review }: { review: Review }) {
  const authorName = review.user?.name || 'Tamu SinggahIn';
  return (
    <div className="p-4 bg-white rounded-xl border border-gray-100 space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ReviewAvatar name={authorName} avatarUrl={review.user?.avatarUrl} />
          <div>
            <h5 className="font-semibold text-gray-900 text-sm">{authorName}</h5>
            <span className="text-[11px] text-gray-400">{formatDateID(review.createdAt, 'dd MMMM yyyy')}</span>
          </div>
        </div>
        <StarRatingDisplay rating={review.rating} size="sm" />
      </div>
      <p className="text-xs sm:text-sm text-gray-700 leading-relaxed pl-13">{review.comment}</p>
    </div>
  );
}

function ReviewPagination({ page, totalPages, setPage }: { page: number; totalPages: number; setPage: (f: (p: number) => number) => void }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 pt-4">
      <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} leftIcon={<ChevronLeft className="w-4 h-4" />}>Sebelumnya</Button>
      <span className="text-xs text-gray-500">Hal. {page} dari {totalPages}</span>
      <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} rightIcon={<ChevronRight className="w-4 h-4" />}>Berikutnya</Button>
    </div>
  );
}

function ReviewEmptyState() {
  return (
    <div className="text-center py-8 border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
      <MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-2" />
      <p className="text-sm font-medium text-gray-600">Belum Ada Ulasan</p>
      <p className="text-xs text-gray-400 mt-0.5">Jadilah tamu pertama yang memberikan ulasan untuk properti ini!</p>
    </div>
  );
}

function ReviewCardsList({ data, page, setPage }: { data: PropertyReviewResponse; page: number; setPage: (f: (p: number) => number) => void }) {
  if (data.reviews.length === 0) return <ReviewEmptyState />;
  return (
    <div className="space-y-3">
      {data.reviews.map((rev) => <ReviewItemCard key={rev.id} review={rev} />)}
      <ReviewPagination page={page} totalPages={data.totalPages} setPage={setPage} />
    </div>
  );
}

export function ReviewList({ propertyId }: { propertyId: string }): React.JSX.Element {
  const [page, setPage] = useState(1);
  const { data, isLoading } = usePropertyReviews(propertyId, page, 5);
  if (isLoading) return <div className="py-6 text-center text-xs text-gray-400">Memuat ulasan...</div>;
  const total = data?.totalReviews || 0;
  return (
    <section className="py-6 border-t border-gray-100" aria-label="Ulasan Pengunjung">
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-primary-600" /> Ulasan Tamu ({total})
      </h3>
      {total > 0 && <ReviewSummaryCard avg={data?.averageRating || 0} total={total} />}
      {data && <ReviewCardsList data={data} page={page} setPage={setPage} />}
    </section>
  );
}
