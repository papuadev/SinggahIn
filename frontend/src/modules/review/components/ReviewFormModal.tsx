import React, { useState } from 'react';
import { Modal } from '../../../components/molecules/Modal';
import { Button } from '../../../components/atoms/Button';
import { StarRatingInput } from './StarRating';
import { useCreateReview } from '../hooks/useCreateReview';

export interface ReviewFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  propertyTitle?: string;
}

export function getRatingLabel(rating: number): string {
  if (rating === 5) return 'Luar Biasa (5/5)';
  if (rating === 4) return 'Sangat Bagus (4/5)';
  if (rating === 3) return 'Cukup Baik (3/5)';
  if (rating === 2) return 'Kurang Memuaskan (2/5)';
  if (rating === 1) return 'Sangat Buruk (1/5)';
  return 'Pilih Bintang Penilaian';
}

function RatingField({ rating, setRating, disabled }: { rating: number; setRating: (r: number) => void; disabled: boolean }) {
  return (
    <div className="space-y-1.5 text-center flex flex-col items-center">
      <label className="text-xs font-semibold text-gray-700">Nilai Pengalaman Menginap Anda</label>
      <StarRatingInput value={rating} onChange={setRating} disabled={disabled} />
      <span className="text-xs font-medium text-amber-600">{getRatingLabel(rating)}</span>
    </div>
  );
}

function CommentField({ comment, setComment, disabled }: { comment: string; setComment: (c: string) => void; disabled: boolean }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center text-xs">
        <label className="font-semibold text-gray-700">Komentar Ulasan</label>
        <span className="text-gray-400">{comment.length}/1000</span>
      </div>
      <textarea
        value={comment} onChange={(e) => setComment(e.target.value)} disabled={disabled} rows={4} maxLength={1000}
        placeholder="Ceritakan kebersihan, pelayanan, dan kenyamanan kamar yang Anda rasakan (min. 5 karakter)..."
        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none disabled:bg-gray-50"
      />
    </div>
  );
}

function ReviewErrorAlert({ error }: { error: string | null }) {
  if (!error) return null;
  return <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs font-medium">{error}</div>;
}

function ReviewModalFooter({ isPending, onClose, onSubmit }: { isPending: boolean; onClose: () => void; onSubmit: () => void }) {
  return (
    <>
      <Button variant="ghost" onClick={onClose} disabled={isPending}>Batal</Button>
      <Button variant="primary" isLoading={isPending} onClick={onSubmit}>Kirim Ulasan</Button>
    </>
  );
}

function useReviewFormState(bookingId: string, onClose: () => void) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const mutation = useCreateReview(() => { setComment(''); setRating(5); setErr(null); onClose(); });
  const submit = () => {
    if (rating < 1 || rating > 5) return setErr('Silakan berikan rating bintang 1-5.');
    if (comment.trim().length < 5) return setErr('Komentar ulasan minimal 5 karakter.');
    setErr(null);
    mutation.mutate({ bookingId, rating, comment: comment.trim() }, { onError: (e: any) => setErr(e.response?.data?.message || 'Gagal mengirim ulasan.') });
  };
  return { rating, setRating, comment, setComment, err, isPending: mutation.isPending, submit };
}

function ModalBody({ f }: { f: ReturnType<typeof useReviewFormState> }) {
  return (
    <div className="space-y-4">
      <RatingField rating={f.rating} setRating={f.setRating} disabled={f.isPending} />
      <CommentField comment={f.comment} setComment={f.setComment} disabled={f.isPending} />
      <ReviewErrorAlert error={f.err} />
    </div>
  );
}

export function ReviewFormModal({ isOpen, onClose, bookingId, propertyTitle }: ReviewFormModalProps): React.JSX.Element {
  const form = useReviewFormState(bookingId, onClose);
  const desc = propertyTitle ? `Bagikan ulasan Anda untuk akomodasi ${propertyTitle}` : 'Bagikan ulasan Anda setelah menginap.';
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Beri Ulasan Penginapan" description={desc}
      footer={<ReviewModalFooter isPending={form.isPending} onClose={onClose} onSubmit={form.submit} />}>
      <ModalBody f={form} />
    </Modal>
  );
}
