import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { bookingApi } from '../services/booking.api';
import { paymentApi } from '../../payment/services/payment.api';
import { openMidtransSnap } from '../../payment/services/midtrans.snap';
import { useCountdownTimer } from './useCountdownTimer';

export function validateProofFile(file: File): string | null {
  if (file.size > 1024 * 1024) return 'Ukuran bukti transfer maksimal 1MB';
  const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
  const validExts = ['.jpg', '.jpeg', '.png', '.webp'];
  const validMimes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
  if (!validMimes.includes(file.type) && !validExts.includes(ext)) {
    return 'Format file harus berupa JPG, PNG, atau WEBP';
  }
  return null;
}

async function executeUploadProof(bookingId: string, file: File, onDone: () => void) {
  await paymentApi.uploadPaymentProof(bookingId, file);
  onDone();
}

interface UploadSetters {
  setErr: (e: string | null) => void;
  setSucc: (s: string | null) => void;
}

async function handleUploadFlow(bookingId: string, file: File, onDone: () => void, s: UploadSetters) {
  const err = validateProofFile(file);
  if (err) return s.setErr(err);
  s.setErr(null);
  try {
    await executeUploadProof(bookingId, file, onDone);
    s.setSucc('Bukti pembayaran berhasil diunggah!');
  } catch (e: any) {
    s.setErr(e.response?.data?.message || e.message || 'Gagal mengunggah bukti bayar');
  }
}

export function useOrderUploadProof(bookingId: string, onDone: () => void) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const upload = async (file: File) => {
    setUploading(true);
    await handleUploadFlow(bookingId, file, onDone, { setErr: setError, setSucc: setSuccess });
    setUploading(false);
  };
  return { isUploading: uploading, uploadError: error, uploadSuccess: success, uploadProof: upload };
}

async function executeSnapCharge(bookingId: string, onDone: () => void, setError: (e: string) => void) {
  const { data } = await paymentApi.createSnapCharge(bookingId);
  await openMidtransSnap(data.snapToken, {
    onSuccess: () => onDone(),
    onPending: () => onDone(),
    onError: () => setError('Pembayaran gagal diproses.'),
  });
}

export function useOrderMidtrans(bookingId: string, onDone: () => void) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const payWithSnap = async () => {
    setLoading(true); setError(null);
    try { await executeSnapCharge(bookingId, onDone, setError); }
    catch (e: any) { setError(e.response?.data?.message || e.message || 'Gagal memulai transaksi Midtrans'); }
    finally { setLoading(false); }
  };
  return { isPayingSnap: loading, snapError: error, payWithSnap };
}

export function useOrderCancellation(bookingId: string, onDone: () => void) {
  const [cancelling, setCancelling] = useState(false);
  const cancelOrder = async (reason?: string) => {
    setCancelling(true);
    try {
      await bookingApi.cancelBooking(bookingId, reason);
      onDone();
    } finally { setCancelling(false); }
  };
  return { isCancelling: cancelling, cancelOrder };
}

function useBookingQueryAndTimer(bookingId: string) {
  const q = useQuery({
    queryKey: ['order-detail', bookingId],
    queryFn: () => bookingApi.getBookingById(bookingId),
    enabled: Boolean(bookingId),
  });
  const booking = q.data?.data;
  const timer = useCountdownTimer(booking?.expiresAt, () => q.refetch());
  return { q, booking, timer };
}

export function useOrderPayment(bookingId: string) {
  const { q, booking, timer } = useBookingQueryAndTimer(bookingId);
  const upload = useOrderUploadProof(bookingId, () => q.refetch());
  const snap = useOrderMidtrans(bookingId, () => q.refetch());
  const cancel = useOrderCancellation(bookingId, () => q.refetch());
  return {
    booking, isLoading: q.isLoading, isError: q.isError, refetch: q.refetch,
    timer, ...upload, ...snap, ...cancel,
  };
}
