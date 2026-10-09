import React, { useState } from 'react';
import { Modal } from '../../../components/molecules/Modal';
import { Button } from '../../../components/atoms/Button';
import { Booking } from '../../booking/booking.types';
import { EmergencyCancelPayload } from '../payment.types';
import { formatRupiah, formatDateID } from '../../../libs/formatters';

export interface TenantOrderApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  onApprove: (id: string) => Promise<void> | void;
  onReject: (id: string, reason?: string) => Promise<void> | void;
  onEmergency: (id: string, p: EmergencyCancelPayload) => Promise<void> | void;
  isLoading: boolean;
}

function GuestInfoRow({ b }: { b: Booking }) {
  return (
    <div className="bg-gray-50 p-3 rounded-lg border text-xs space-y-1">
      <p className="font-semibold text-gray-800">Tamu: {b.user?.name || 'Tamu'} ({b.user?.email})</p>
      <p className="text-gray-500">No. HP: {b.user?.phoneNumber || '-'}</p>
      <p className="text-gray-600 font-medium">{formatDateID(b.checkInDate, 'dd MMM yyyy')} - {formatDateID(b.checkOutDate, 'dd MMM yyyy')}</p>
      <p className="text-primary-700 font-bold">{formatRupiah(b.totalPrice)} • {b.payment?.paymentMethod}</p>
    </div>
  );
}

function ProofImage({ url }: { url?: string | null }) {
  if (!url) return <p className="text-xs text-gray-400 italic">Bukti transfer belum diunggah tamu.</p>;
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-100 max-h-56 flex items-center justify-center">
      <img src={url} alt="Bukti Pembayaran" className="object-contain max-h-56 w-full cursor-pointer" onClick={() => window.open(url, '_blank')} />
    </div>
  );
}

function useRejectAction(onConfirm: (r: string) => Promise<void>) {
  const [r, setR] = useState('Bukti transfer tidak jelas atau nominal tidak sesuai');
  const [err, setErr] = useState<string | null>(null);
  const handleConfirm = async () => {
    try { setErr(null); await onConfirm(r); }
    catch (e: any) { setErr(e.message || 'Gagal menolak bukti pembayaran.'); }
  };
  return { r, setR, err, handleConfirm };
}

function RejectView({ onConfirm, onBack, loading }: any) {
  const { r, setR, err, handleConfirm } = useRejectAction(onConfirm);
  return (
    <div className="space-y-3">
      <label className="text-xs font-semibold text-gray-700">Alasan Penolakan</label>
      <textarea value={r} onChange={(e) => setR(e.target.value)} rows={2} className="w-full border border-gray-300 p-2 rounded-lg text-xs" />
      {err && <p className="text-xs text-rose-600 font-medium">{err}</p>}
      <div className="flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={onBack} disabled={loading}>Kembali</Button>
        <Button variant="danger" size="sm" isLoading={loading} onClick={handleConfirm}>Tolak Bukti</Button>
      </div>
    </div>
  );
}

function ForceMajeureCheckbox({ force, setForce }: { force: boolean; setForce: (b: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 pt-1 cursor-pointer">
      <input type="checkbox" checked={force} onChange={(e) => setForce(e.target.checked)} />
      <span className="font-medium text-gray-700">Force Majeure (Bencana Alam / Keadaan Darurat)</span>
    </label>
  );
}

function EmergencyInputs({ form }: { form: any }) {
  return (
    <>
      <div>
        <label className="font-semibold block text-gray-700 mb-1">Alasan Pembatalan</label>
        <input value={form.reason} onChange={(e) => form.setReason(e.target.value)} className="w-full border border-gray-300 p-1.5 rounded text-xs" placeholder="Alasan pembatalan (min. 5 karakter)" />
      </div>
      <div>
        <label className="font-semibold block text-gray-700 mb-1">Kontak Refund</label>
        <input value={form.contact} onChange={(e) => form.setContact(e.target.value)} className="w-full border border-gray-300 p-1.5 rounded text-xs" placeholder="Nomor kontak refund (min. 8 karakter)" />
      </div>
      <ForceMajeureCheckbox force={form.force} setForce={form.setForce} />
    </>
  );
}

function useEmergencyForm(onConfirm: (p: any) => Promise<void>) {
  const [reason, setReason] = useState('Kondisi darurat properti');
  const [contact, setContact] = useState('081234567890');
  const [force, setForce] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const submit = async () => {
    if (!reason || reason.trim().length < 5) return setErr('Alasan pembatalan minimal 5 karakter.');
    if (!contact || contact.trim().length < 8) return setErr('Nomor kontak refund minimal 8 karakter.');
    setErr(null);
    try {
      await onConfirm({ cancellationReason: reason.trim(), reason: reason.trim(), refundContact: contact.trim(), isForceMajeure: force });
    } catch (e: any) { setErr(e.message || 'Gagal membatalkan pesanan secara darurat.'); }
  };
  return { reason, setReason, contact, setContact, force, setForce, err, submit };
}

function EmergencyView({ onConfirm, onBack, loading }: any) {
  const form = useEmergencyForm(onConfirm);
  return (
    <div className="space-y-3 text-xs">
      <EmergencyInputs form={form} />
      {form.err && <p className="text-xs text-rose-600 font-medium">{form.err}</p>}
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="ghost" size="sm" onClick={onBack} disabled={loading}>Kembali</Button>
        <Button variant="danger" size="sm" isLoading={loading} onClick={form.submit}>Batalkan Darurat</Button>
      </div>
    </div>
  );
}

function ActionButtons({ b, onApprove, onReject, onEmer, loading }: any) {
  const canApprove = b.status === 'WAITING_CONFIRMATION';
  const canEmergency = b.status === 'PROCESSED';
  if (!canApprove && !canEmergency) return null;
  return (
    <div className="flex flex-wrap justify-end gap-2 pt-2 border-t">
      {canEmergency && <Button variant="danger" size="sm" onClick={onEmer} disabled={loading}>Batal Darurat</Button>}
      {canApprove && <Button variant="outline" size="sm" onClick={onReject} disabled={loading}>Tolak</Button>}
      {canApprove && <Button variant="primary" size="sm" isLoading={loading} onClick={() => onApprove(b.id)}>Setujui Bukti</Button>}
    </div>
  );
}

function ModalBody({ mode, b, props, setMode }: any) {
  if (mode === 'reject') return <RejectView onConfirm={(r: string) => props.onReject(b.id, r)} onBack={() => setMode('detail')} loading={props.isLoading} />;
  if (mode === 'emergency') return <EmergencyView onConfirm={(p: any) => props.onEmergency(b.id, p)} onBack={() => setMode('detail')} loading={props.isLoading} />;
  const proofUrl = b.payment?.proofImageUrl || b.payment?.paymentProofUrl;
  return (
    <>
      <GuestInfoRow b={b} />
      <ProofImage url={proofUrl} />
      <ActionButtons b={b} onApprove={props.onApprove} onReject={() => setMode('reject')} onEmer={() => setMode('emergency')} loading={props.isLoading} />
    </>
  );
}

export function TenantOrderApprovalModal(props: TenantOrderApprovalModalProps): React.JSX.Element | null {
  const [mode, setMode] = useState<'detail' | 'reject' | 'emergency'>('detail');
  if (!props.booking) return null;
  const resetClose = () => { setMode('detail'); props.onClose(); };
  return (
    <Modal isOpen={props.isOpen} onClose={resetClose} title={`Pesanan ${props.booking.bookingCode}`}>
      <div className="space-y-4">
        <ModalBody mode={mode} b={props.booking} props={props} setMode={setMode} />
      </div>
    </Modal>
  );
}
