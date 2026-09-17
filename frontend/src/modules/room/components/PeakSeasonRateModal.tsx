import React, { useState } from 'react';
import { useForm, UseFormRegister, FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Trash2, TrendingUp } from 'lucide-react';
import { RoomPriceModifier } from '../pricing.types';
import { peakRateFormSchema, PeakRateFormData } from '../schemas/pricing.schema';
import {
  useRoomRates,
  useCreateRoomRate,
  useDeleteRoomRate,
  useBulkCreatePropertyRates,
} from '../hooks/useRoomPricing';
import { Modal } from '../../../components/molecules/Modal';
import { FormField } from '../../../components/molecules/FormField';
import { Input } from '../../../components/atoms/Input';
import { Button } from '../../../components/atoms/Button';
import { Alert } from '../../../components/atoms/Alert';
import { Spinner } from '../../../components/atoms/Spinner';
import { formatRupiah, formatDateID } from '../../../libs/formatters';

export interface PeakSeasonRateModalProps {
  roomId: string;
  roomName: string;
  propertyId: string;
  isOpen: boolean;
  onClose: () => void;
}

function RateItem({ rate, onDelete, isDeleting }: {
  rate: RoomPriceModifier;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}): React.JSX.Element {
  const badgeText = rate.adjustmentType === 'PERCENTAGE'
    ? `${rate.adjustmentValue > 0 ? '+' : ''}${rate.adjustmentValue}%`
    : `${rate.adjustmentValue > 0 ? '+' : ''}${formatRupiah(rate.adjustmentValue)}`;
  return (
    <div className="flex items-center justify-between p-2.5 rounded-lg border border-gray-200 bg-gray-50/50 text-xs">
      <div>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-primary-700 bg-primary-50 px-2 py-0.5 rounded border border-primary-100">{badgeText}</span>
          <span className="font-medium text-gray-800">{formatDateID(rate.startDate, 'dd MMM yyyy')} - {formatDateID(rate.endDate, 'dd MMM yyyy')}</span>
        </div>
        {rate.reason && <p className="text-gray-500 mt-1">{rate.reason}</p>}
      </div>
      <button type="button" onClick={() => onDelete(rate.id)} disabled={isDeleting} aria-label="Hapus tarif" className="p-1 text-gray-400 hover:text-rose-600 transition-colors disabled:opacity-50">
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

function RateDateFields({ register, errors }: { register: UseFormRegister<PeakRateFormData>; errors: FieldErrors<PeakRateFormData> }): React.JSX.Element {
  return (
    <div className="grid grid-cols-2 gap-3">
      <FormField label="Tanggal Mulai" htmlFor="peak-start-date" required error={errors.startDate?.message}>
        <Input id="peak-start-date" type="date" hasError={Boolean(errors.startDate)} {...register('startDate')} />
      </FormField>
      <FormField label="Tanggal Selesai" htmlFor="peak-end-date" required error={errors.endDate?.message}>
        <Input id="peak-end-date" type="date" hasError={Boolean(errors.endDate)} {...register('endDate')} />
      </FormField>
    </div>
  );
}

function RateAdjustmentFields({ register, errors, type }: { register: UseFormRegister<PeakRateFormData>; errors: FieldErrors<PeakRateFormData>; type: string }): React.JSX.Element {
  return (
    <div className="grid grid-cols-2 gap-3">
      <FormField label="Tipe Penyesuaian" htmlFor="peak-adj-type" required error={errors.adjustmentType?.message}>
        <select id="peak-adj-type" {...register('adjustmentType')} className="w-full rounded-lg border border-gray-300 py-2.5 px-3 text-sm bg-white focus:ring-2 focus:ring-primary-100 focus:border-primary-500">
          <option value="PERCENTAGE">Persentase (%)</option>
          <option value="NOMINAL">Nominal (Rp)</option>
        </select>
      </FormField>
      <FormField label={type === 'PERCENTAGE' ? 'Persentase (%)' : 'Nominal (Rp)'} htmlFor="peak-adj-val" required error={errors.adjustmentValue?.message}>
        <Input id="peak-adj-val" type="number" step={type === 'PERCENTAGE' ? 1 : 5000} placeholder={type === 'PERCENTAGE' ? 'Contoh: 25' : 'Contoh: 150000'} hasError={Boolean(errors.adjustmentValue)} {...register('adjustmentValue', { valueAsNumber: true })} />
      </FormField>
    </div>
  );
}

function RateReasonField({ register, errors }: { register: UseFormRegister<PeakRateFormData>; errors: FieldErrors<PeakRateFormData> }): React.JSX.Element {
  return (
    <div className="space-y-3">
      <FormField label="Alasan / Nama Musim" error={errors.reason?.message}>
        <Input placeholder="Contoh: Libur Lebaran, Libur Sekolah..." {...register('reason')} />
      </FormField>
      <label className="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer">
        <input type="checkbox" {...register('applyToAllRooms')} className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
        <span>Terapkan juga ke semua tipe kamar di properti ini</span>
      </label>
    </div>
  );
}

export function PeakSeasonRateModal({ roomId, roomName, propertyId, isOpen, onClose }: PeakSeasonRateModalProps): React.JSX.Element {
  const [formError, setFormError] = useState<string | null>(null);
  const { data: rates = [], isLoading: loadingRates } = useRoomRates(roomId);
  const createMut = useCreateRoomRate(roomId);
  const deleteMut = useDeleteRoomRate(roomId);
  const bulkMut = useBulkCreatePropertyRates(propertyId);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<PeakRateFormData>({
    resolver: zodResolver(peakRateFormSchema) as any,
    defaultValues: { startDate: '', endDate: '', adjustmentType: 'PERCENTAGE', adjustmentValue: 20, reason: '', applyToAllRooms: false },
  });

  const selectedType = watch('adjustmentType');
  const isBusy = createMut.isPending || deleteMut.isPending || bulkMut.isPending;

  const handleFormSubmit = async (data: PeakRateFormData) => {
    try {
      setFormError(null);
      const payload = { startDate: data.startDate, endDate: data.endDate, adjustmentType: data.adjustmentType, adjustmentValue: data.adjustmentValue, reason: data.reason || undefined };
      if (data.applyToAllRooms) await bulkMut.mutateAsync(payload);
      else await createMut.mutateAsync(payload);
      reset({ startDate: '', endDate: '', adjustmentType: 'PERCENTAGE', adjustmentValue: 20, reason: '', applyToAllRooms: false });
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Gagal menyimpan tarif');
    }
  };

  const handleDelete = async (rateId: string) => {
    try { setFormError(null); await deleteMut.mutateAsync(rateId); }
    catch (err: unknown) { setFormError(err instanceof Error ? err.message : 'Gagal menghapus tarif'); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Tarif Musiman: ${roomName}`} description="Atur penyesuaian harga khusus pada periode libur atau promo." footer={<Button type="button" variant="outline" size="sm" onClick={onClose}>Tutup</Button>}>
      <div className="space-y-5">
        {formError && <Alert variant="error">{formError}</Alert>}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-3 bg-white p-4 rounded-xl border border-gray-200">
          <RateDateFields register={register} errors={errors} />
          <RateAdjustmentFields register={register} errors={errors} type={selectedType} />
          <RateReasonField register={register} errors={errors} />
          <div className="pt-2 flex justify-end">
            <Button type="submit" variant="primary" size="sm" isLoading={isBusy} leftIcon={<TrendingUp className="w-3.5 h-3.5" />}>Simpan Tarif Musiman</Button>
          </div>
        </form>
        <div className="space-y-2 pt-2 border-t border-gray-100">
          <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Daftar Tarif Musiman Aktif ({rates.length})</h4>
          {loadingRates && <div className="py-4 text-center"><Spinner size="sm" /></div>}
          {!loadingRates && rates.length === 0 && <p className="text-xs text-gray-400 py-3 text-center">Belum ada pengaturan tarif musiman untuk kamar ini.</p>}
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {rates.map((rate) => <RateItem key={rate.id} rate={rate} onDelete={handleDelete} isDeleting={deleteMut.isPending} />)}
          </div>
        </div>
      </div>
    </Modal>
  );
}
