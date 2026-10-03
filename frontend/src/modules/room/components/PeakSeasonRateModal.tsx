import React, { useState } from 'react';
import { useForm, UseFormRegister, FieldErrors, Control, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
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
import { CurrencyInput } from '../../../components/atoms/CurrencyInput';
import { Button } from '../../../components/atoms/Button';
import { Alert } from '../../../components/atoms/Alert';
import { RateListSection } from './RateListSection';

export interface PeakSeasonRateModalProps {
  roomId: string;
  roomName: string;
  propertyId: string;
  isOpen: boolean;
  onClose: () => void;
}

function RateDateFields({ register, errors }: { register: UseFormRegister<PeakRateFormData>; errors: FieldErrors<PeakRateFormData> }): React.JSX.Element {
  const minDate = format(new Date(), 'yyyy-MM-dd');
  return (
    <div className="grid grid-cols-2 gap-3">
      <FormField label="Tanggal Mulai" htmlFor="peak-start-date" required error={errors.startDate?.message}>
        <Input id="peak-start-date" type="date" min={minDate} hasError={Boolean(errors.startDate)} {...register('startDate')} />
      </FormField>
      <FormField label="Tanggal Selesai" htmlFor="peak-end-date" required error={errors.endDate?.message}>
        <Input id="peak-end-date" type="date" min={minDate} hasError={Boolean(errors.endDate)} {...register('endDate')} />
      </FormField>
    </div>
  );
}

function RateValueInput({ control, register, errors, type }: {
  control: Control<PeakRateFormData>; register: UseFormRegister<PeakRateFormData>;
  errors: FieldErrors<PeakRateFormData>; type: string;
}): React.JSX.Element {
  if (type === 'PERCENTAGE') {
    return (
      <Input
        id="peak-adj-val"
        type="number"
        step={1}
        placeholder="Contoh: 25"
        hasError={Boolean(errors.adjustmentValue)}
        {...register('adjustmentValue', { valueAsNumber: true })}
      />
    );
  }
  return (
    <Controller
      name="adjustmentValue"
      control={control}
      render={({ field }) => (
        <CurrencyInput
          id="peak-adj-val"
          aria-label="Nominal (Rp)"
          placeholder="Contoh: 150.000"
          hasError={Boolean(errors.adjustmentValue)}
          value={field.value}
          onValueChange={field.onChange}
          onBlur={field.onBlur}
        />
      )}
    />
  );
}

function RateAdjustmentFields({
  register, control, errors, type,
}: {
  register: UseFormRegister<PeakRateFormData>; control: Control<PeakRateFormData>;
  errors: FieldErrors<PeakRateFormData>; type: string;
}): React.JSX.Element {
  return (
    <div className="grid grid-cols-2 gap-3">
      <FormField label="Tipe Penyesuaian" htmlFor="peak-adj-type" required error={errors.adjustmentType?.message}>
        <select id="peak-adj-type" {...register('adjustmentType')} className="w-full rounded-lg border border-gray-300 py-2.5 px-3 text-sm bg-white focus:ring-2 focus:ring-primary-100 focus:border-primary-500">
          <option value="PERCENTAGE">Persentase (%)</option>
          <option value="NOMINAL">Nominal (Rp)</option>
        </select>
      </FormField>
      <FormField label={type === 'PERCENTAGE' ? 'Persentase (%)' : 'Nominal (Rp)'} htmlFor="peak-adj-val" required error={errors.adjustmentValue?.message}>
        <RateValueInput control={control} register={register} errors={errors} type={type} />
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

function RateForm({
  register, control, errors, selectedType, isBusy, onSubmit,
}: {
  register: UseFormRegister<PeakRateFormData>; control: Control<PeakRateFormData>;
  errors: FieldErrors<PeakRateFormData>; selectedType: string; isBusy: boolean;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
}): React.JSX.Element {
  return (
    <form onSubmit={onSubmit} className="space-y-4 p-4 rounded-xl border border-gray-100 bg-gray-50/50">
      <RateDateFields register={register} errors={errors} />
      <RateAdjustmentFields register={register} control={control} errors={errors} type={selectedType} />
      <RateReasonField register={register} errors={errors} />
      <Button type="submit" variant="primary" size="sm" isLoading={isBusy} className="w-full" leftIcon={<TrendingUp className="w-4 h-4" />}>
        Simpan Tarif Musiman
      </Button>
    </form>
  );
}

export function PeakSeasonRateModal({ roomId, roomName, propertyId, isOpen, onClose }: PeakSeasonRateModalProps): React.JSX.Element {
  const [formError, setFormError] = useState<string | null>(null);
  const { data: rates = [], isLoading: loadingRates } = useRoomRates(roomId);
  const createMut = useCreateRoomRate(roomId);
  const deleteMut = useDeleteRoomRate(roomId);
  const bulkMut = useBulkCreatePropertyRates(propertyId);

  const { register, control, handleSubmit, reset, watch, formState: { errors } } = useForm<PeakRateFormData>({
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
      setFormError((err as Error).message || 'Gagal menyimpan tarif musiman.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Tarif Musiman: ${roomName}`} description="Atur penyesuaian harga khusus pada periode libur atau promo." footer={<Button type="button" variant="outline" size="sm" onClick={onClose}>Tutup</Button>}>
      <div className="space-y-6">
        {formError && <Alert variant="error">{formError}</Alert>}
        <RateForm register={register} control={control} errors={errors} selectedType={selectedType} isBusy={isBusy} onSubmit={handleSubmit(handleFormSubmit)} />
        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Daftar Tarif Musiman Aktif</h4>
          <RateListSection rates={rates} isLoading={loadingRates} onDelete={(id) => deleteMut.mutate(id)} isDeleting={deleteMut.isPending} />
        </div>
      </div>
    </Modal>
  );
}
