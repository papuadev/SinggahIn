import React, { useState } from 'react';
import { ReceiptText, Maximize2, ZoomIn, ImageOff, AlertTriangle, Check, X, ShieldCheck, Zap, Clock } from 'lucide-react';
import { Modal } from '../../../components/molecules/Modal';
import { Button } from '../../../components/atoms/Button';
import { Booking } from '../../booking/booking.types';
import { EmergencyCancelPayload } from '../payment.types';
import { GuestInfoRow } from './TenantOrderGuestCard';
import { TenantOrderPropertyCard } from './TenantOrderPropertyCard';
import { RejectView, EmergencyView } from './TenantOrderEmergencyViews';
import { ProofImageLightbox } from './ProofImageLightbox';

export interface TenantOrderApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  onApprove: (id: string) => Promise<void> | void;
  onReject: (id: string, reason?: string) => Promise<void> | void;
  onEmergency: (id: string, p: EmergencyCancelPayload) => Promise<void> | void;
  isLoading: boolean;
}

function ProofEmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 p-6 flex flex-col items-center justify-center text-center gap-2">
      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
        <ImageOff className="w-5 h-5" />
      </div>
      <p className="text-xs font-semibold text-gray-700">Bukti transfer belum diunggah</p>
      <p className="text-[11px] text-gray-400">Tamu belum melampirkan foto bukti pembayaran.</p>
    </div>
  );
}

function ProofFullLink({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      type="button" onClick={onOpen}
      className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary-600 hover:text-primary-700 hover:underline cursor-pointer"
    >
      <Maximize2 className="w-3 h-3" />
      <span>Lihat Ukuran Penuh</span>
    </button>
  );
}

function ProofImageHeader({ url, onOpen }: { url?: string | null; onOpen: () => void }) {
  return (
    <div className="flex items-center justify-between pb-1 text-xs">
      <span className="font-bold text-gray-800 flex items-center gap-1.5">
        <ReceiptText className="w-4 h-4 text-primary-600" />
        <span>Bukti Transfer Pembayaran</span>
      </span>
      {url && <ProofFullLink onOpen={onOpen} />}
    </div>
  );
}

function ProofZoomBadge() {
  return (
    <div className="absolute bottom-3 px-3 py-1 bg-gray-900/80 text-white text-[11px] font-medium rounded-full backdrop-blur-xs flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md">
      <ZoomIn className="w-3.5 h-3.5" />
      <span>Klik untuk perbesar</span>
    </div>
  );
}

function ProofImageViewer({ url, onOpen }: { url: string; onOpen: () => void }) {
  return (
    <div
      onClick={onOpen}
      className="relative group rounded-2xl border border-gray-200 bg-gray-950/5 p-2 overflow-hidden flex items-center justify-center min-h-[220px] max-h-72 transition-all hover:border-primary-300 cursor-pointer"
    >
      <img src={url} alt="Bukti Pembayaran" className="object-contain max-h-64 w-full rounded-xl transition-transform duration-200 group-hover:scale-[1.01]" />
      <ProofZoomBadge />
    </div>
  );
}

function ProofSection({ url, onOpen }: { url?: string | null; onOpen: () => void }) {
  return (
    <div className="space-y-1.5">
      <ProofImageHeader url={url} onOpen={onOpen} />
      {url ? <ProofImageViewer url={url} onOpen={onOpen} /> : <ProofEmptyState />}
    </div>
  );
}

function GatewayPendingCard({ bookingCode }: { bookingCode: string }) {
  return (
    <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 space-y-2">
      <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
        <Clock className="w-4 h-4 text-amber-600 shrink-0" />
        <span>Menunggu Pembayaran (Payment Gateway)</span>
      </div>
      <p className="text-xs text-amber-800 leading-relaxed">
        Pesanan <span className="font-mono font-bold text-amber-950">{bookingCode}</span> sedang menunggu pembayaran oleh tamu via Midtrans. Status akan otomatis diperbarui begitu transaksi berhasil.
      </p>
      <p className="flex items-center gap-1.5 text-[11px] text-amber-700 font-medium pt-0.5"><Zap className="w-3.5 h-3.5 text-amber-600 shrink-0" /><span>Verifikasi otomatis aktif secara real-time</span></p>
    </div>
  );
}

function GatewaySuccessCard({ bookingCode }: { bookingCode: string }) {
  return (
    <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 space-y-2">
      <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>Pembayaran Berhasil (Payment Gateway)</span>
      </div>
      <p className="text-xs text-emerald-700/90 leading-relaxed">
        Pesanan <span className="font-mono font-bold text-emerald-900">{bookingCode}</span> telah diverifikasi otomatis melalui Midtrans. Bukti transfer manual tidak diperlukan.
      </p>
      <p className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-medium pt-0.5"><Zap className="w-3.5 h-3.5 text-emerald-500 shrink-0" /><span>Verifikasi instan tersinkronisasi sistem</span></p>
    </div>
  );
}

function GatewayInfoCard({ bookingCode, status }: { bookingCode: string; status: Booking['status'] }) {
  if (status === 'WAITING_PAYMENT') return <GatewayPendingCard bookingCode={bookingCode} />;
  return <GatewaySuccessCard bookingCode={bookingCode} />;
}

function RightColumnPayment({ b, onOpenLightbox }: { b: Booking; onOpenLightbox: () => void }) {
  const isGateway = b.payment?.paymentMethod === 'PAYMENT_GATEWAY';
  const proofUrl = b.payment?.proofImageUrl || b.payment?.paymentProofUrl;
  if (isGateway) return <GatewayInfoCard bookingCode={b.bookingCode} status={b.status} />;
  return <ProofSection url={proofUrl} onOpen={onOpenLightbox} />;
}

function TwoColumnModalLayout({ b, onOpenLightbox }: { b: Booking; onOpenLightbox: () => void }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
      <div className="space-y-3">
        <TenantOrderPropertyCard b={b} />
        <GuestInfoRow b={b} />
      </div>
      <div className="space-y-3">
        <RightColumnPayment b={b} onOpenLightbox={onOpenLightbox} />
      </div>
    </div>
  );
}

function ActionButtons({ b, onApprove, onReject, onEmer, loading }: any) {
  const canApprove = b.status === 'WAITING_CONFIRMATION';
  const canEmergency = b.status === 'PROCESSED';
  if (!canApprove && !canEmergency) return null;
  return (
    <div className="flex flex-wrap justify-end gap-2.5 pt-3 border-t border-gray-100">
      {canEmergency && <Button variant="danger" size="sm" onClick={onEmer} disabled={loading} leftIcon={<AlertTriangle className="w-3.5 h-3.5" />}>Batal Darurat</Button>}
      {canApprove && <Button variant="outline" size="sm" onClick={onReject} disabled={loading} leftIcon={<X className="w-3.5 h-3.5" />}>Tolak</Button>}
      {canApprove && <Button variant="primary" size="sm" isLoading={loading} onClick={() => onApprove(b.id)} leftIcon={<Check className="w-3.5 h-3.5" />}>Setujui Bukti</Button>}
    </div>
  );
}

function ModalBody({ mode, b, props, setMode, onOpenLightbox }: any) {
  if (mode === 'reject') return <RejectView onConfirm={(r: string) => props.onReject(b.id, r)} onBack={() => setMode('detail')} loading={props.isLoading} />;
  if (mode === 'emergency') return <EmergencyView onConfirm={(p: any) => props.onEmergency(b.id, p)} onBack={() => setMode('detail')} loading={props.isLoading} />;
  return (
    <div className="space-y-4">
      <TwoColumnModalLayout b={b} onOpenLightbox={onOpenLightbox} />
      <ActionButtons b={b} onApprove={props.onApprove} onReject={() => setMode('reject')} onEmer={() => setMode('emergency')} loading={props.isLoading} />
    </div>
  );
}

export function TenantOrderApprovalModal(props: TenantOrderApprovalModalProps): React.JSX.Element | null {
  const [mode, setMode] = useState<'detail' | 'reject' | 'emergency'>('detail');
  const [isLight, setIsLight] = useState(false);
  if (!props.booking) return null;
  const proofUrl = props.booking.payment?.proofImageUrl || props.booking.payment?.paymentProofUrl;
  return (
    <>
      <Modal isOpen={props.isOpen} onClose={() => { setMode('detail'); props.onClose(); }} title={`Pesanan ${props.booking.bookingCode}`} maxWidth="max-w-3xl">
        <ModalBody mode={mode} b={props.booking} props={props} setMode={setMode} onOpenLightbox={() => setIsLight(true)} />
      </Modal>
      <ProofImageLightbox isOpen={isLight} onClose={() => setIsLight(false)} src={proofUrl} />
    </>
  );
}
