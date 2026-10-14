import { useState } from 'react';
import { Button } from '../../../components/atoms/Button';
import { EmergencyCancelPayload } from '../payment.types';

function useRejectAction(onConfirm: (r: string) => Promise<void>) {
  const [r, setR] = useState('Bukti transfer tidak jelas atau nominal tidak sesuai');
  const [err, setErr] = useState<string | null>(null);
  const handleConfirm = async () => {
    try { setErr(null); await onConfirm(r); }
    catch (e: any) { setErr(e.message || 'Gagal menolak bukti pembayaran.'); }
  };
  return { r, setR, err, handleConfirm };
}

function RejectFormBody({ r, setR, err }: { r: string; setR: (v: string) => void; err: string | null }) {
  return (
    <div className="bg-red-50/70 border border-red-200/80 rounded-xl p-3">
      <label className="text-xs font-bold text-red-900 block mb-1.5">Alasan Penolakan</label>
      <textarea
        value={r}
        onChange={(e) => setR(e.target.value)}
        rows={3}
        className="w-full border border-red-200 rounded-lg p-2.5 text-xs text-gray-800 bg-white focus:ring-2 focus:ring-red-400 focus:outline-none"
        placeholder="Tuliskan alasan penolakan bukti pembayaran..."
      />
      {err && <p className="text-xs text-red-600 font-medium mt-1.5">{err}</p>}
    </div>
  );
}

export function RejectView({ onConfirm, onBack, loading }: { onConfirm: (r: string) => Promise<void>; onBack: () => void; loading: boolean }) {
  const { r, setR, err, handleConfirm } = useRejectAction(onConfirm);
  return (
    <div className="space-y-4">
      <RejectFormBody r={r} setR={setR} err={err} />
      <div className="flex justify-end gap-2 pt-1 border-t border-gray-100">
        <Button variant="ghost" size="sm" onClick={onBack} disabled={loading}>Kembali</Button>
        <Button variant="danger" size="sm" isLoading={loading} onClick={handleConfirm}>Tolak Bukti</Button>
      </div>
    </div>
  );
}

function ForceMajeureCheckbox({ force, setForce }: { force: boolean; setForce: (b: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 pt-1 cursor-pointer text-xs text-gray-700 font-medium">
      <input type="checkbox" checked={force} onChange={(e) => setForce(e.target.checked)} className="rounded text-red-600 focus:ring-red-500" />
      <span>Force Majeure (Bencana Alam / Keadaan Darurat)</span>
    </label>
  );
}

function EmergencyFields({ form }: { form: any }) {
  return (
    <div className="space-y-3">
      <div>
        <label className="font-semibold block text-gray-700 text-xs mb-1">Alasan Pembatalan</label>
        <input value={form.reason} onChange={(e) => form.setReason(e.target.value)} className="w-full border border-gray-300 p-2 rounded-lg text-xs" placeholder="Alasan pembatalan (min. 5 karakter)" />
      </div>
      <div>
        <label className="font-semibold block text-gray-700 text-xs mb-1">Kontak Refund</label>
        <input value={form.contact} onChange={(e) => form.setContact(e.target.value)} className="w-full border border-gray-300 p-2 rounded-lg text-xs" placeholder="Nomor kontak refund (min. 8 karakter)" />
      </div>
      <ForceMajeureCheckbox force={form.force} setForce={form.setForce} />
    </div>
  );
}

function useEmergencyForm(onConfirm: (p: EmergencyCancelPayload) => Promise<void>) {
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

export function EmergencyView({ onConfirm, onBack, loading }: { onConfirm: (p: EmergencyCancelPayload) => Promise<void>; onBack: () => void; loading: boolean }) {
  const form = useEmergencyForm(onConfirm);
  return (
    <div className="space-y-4">
      <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3.5">
        <EmergencyFields form={form} />
        {form.err && <p className="text-xs text-rose-600 font-medium mt-2">{form.err}</p>}
      </div>
      <div className="flex justify-end gap-2 pt-1 border-t border-gray-100">
        <Button variant="ghost" size="sm" onClick={onBack} disabled={loading}>Kembali</Button>
        <Button variant="danger" size="sm" isLoading={loading} onClick={form.submit}>Batalkan Darurat</Button>
      </div>
    </div>
  );
}
