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
import { DatePickerInput } from '../../../components/molecules/DatePickerInput';
import { Input } from '../../../components/atoms/Input';
import { Select } from '../../../components/atoms/Select';
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

function StartDateField({ control, error, min }: { control: Control<PeakRateFormData>; error?: string; min: string }): React.JSX.Element {
  return (
    <FormField label="Tanggal Mulai" htmlFor="peak-start-date" required error={error}>
      <Controller
        name="startDate" control={control}
        render={({ field }) => <DatePickerInput id="peak-start-date" min={min} value={field.value} onChange={field.onChange} hasError={Boolean(error)} aria-label="Tanggal Mulai" />}
      />
    </FormField>
  );
}

function EndDateField({ control, error, min }: { control: Control<PeakRateFormData>; error?: string; min: string }): React.JSX.Element {
  return (
    <FormField label="Tanggal Selesai" htmlFor="peak-end-date" required error={error}>
      <Controller
        name="endDate" control={control}
        render={({ field }) => <DatePickerInput id="peak-end-date" min={min} value={field.value} onChange={field.onChange} hasError={Boolean(error)} align="right" aria-label="Tanggal Selesai" />}
      />
    </FormField>
  );
}

function RateDateFields({ control, errors }: { control: Control<PeakRateFormData>; errors: FieldErrors<PeakRateFormData> }): React.JSX.Element {
  const minDate = format(new Date(), 'yyyy-MM-dd');
  return (
    <div className="grid grid-cols-2 gap-3">
      <StartDateField control={control} error={errors.startDate?.message} min={minDate} />
      <EndDateField control={control} error={errors.endDate?.message} min={minDate} />
    </div>
  );
}

type ValInputProps = {
  control: Control<PeakRateFormData>; register: UseFormRegister<PeakRateFormData>;
  errors: FieldErrors<PeakRateFormData>; type: string;
};

function RateValueInput({ control, register, errors, type }: ValInputProps) {
  const hasErr = Boolean(errors.adjustmentValue);
  if (type === 'PERCENTAGE') {
    return <Input id="peak-adj-val" type="number" step={1} placeholder="Contoh: 25" hasError={hasErr} {...register('adjustmentValue', { valueAsNumber: true })} />;
  }
  return (
    <Controller
      name="adjustmentValue" control={control}
      render={({ field }) => (
        <CurrencyInput id="peak-adj-val" aria-label="Nominal (Rp)" placeholder="Contoh: 150.000" hasError={hasErr} value={field.value} onValueChange={field.onChange} onBlur={field.onBlur} />
      )}
    />
  );
}

function AdjustmentTypeSelect({ register, error }: { register: UseFormRegister<PeakRateFormData>; error?: string }) {
  return (
    <FormField label="Tipe Penyesuaian" htmlFor="peak-adj-type" required error={error}>
      <Select id="peak-adj-type" hasError={Boolean(error)} {...register('adjustmentType')}>
        <option value="PERCENTAGE">Persentase (%)</option>
        <option value="NOMINAL">Nominal (Rp)</option>
      </Select>
    </FormField>
  );
}

type AdjProps = {
  register: UseFormRegister<PeakRateFormData>; control: Control<PeakRateFormData>;
  errors: FieldErrors<PeakRateFormData>; type: string;
};

function RateAdjustmentFields({ register, control, errors, type }: AdjProps) {
  const valLabel = type === 'PERCENTAGE' ? 'Persentase (%)' : 'Nominal (Rp)';
  return (
    <div className="grid grid-cols-2 gap-3">
      <AdjustmentTypeSelect register={register} error={errors.adjustmentType?.message} />
      <FormField label={valLabel} htmlFor="peak-adj-val" required error={errors.adjustmentValue?.message}>
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

type RateFormProps = {
  register: UseFormRegister<PeakRateFormData>; control: Control<PeakRateFormData>;
  errors: FieldErrors<PeakRateFormData>; selectedType: string; isBusy: boolean;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
};

function RateForm({ register, control, errors, selectedType, isBusy, onSubmit }: RateFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4 p-4 rounded-xl border border-gray-100 bg-gray-50/50">
      <RateDateFields control={control} errors={errors} />
      <RateAdjustmentFields register={register} control={control} errors={errors} type={selectedType} />
      <RateReasonField register={register} errors={errors} />
      <Button type="submit" variant="primary" size="sm" isLoading={isBusy} className="w-full" leftIcon={<TrendingUp className="w-4 h-4" />}>
        Simpan Tarif Musiman
      </Button>
    </form>
  );
}

function usePeakSeasonModalState(roomId: string, propertyId: string) {
  const [formError, setFormError] = useState<string | null>(null);
  const { data: rates = [], isLoading: loadingRates } = useRoomRates(roomId);
  const createMut = useCreateRoomRate(roomId);
  const deleteMut = useDeleteRoomRate(roomId);
  const bulkMut = useBulkCreatePropertyRates(propertyId);
  const form = useForm<PeakRateFormData>({
    resolver: zodResolver(peakRateFormSchema) as any,
    defaultValues: { startDate: '', endDate: '', adjustmentType: 'PERCENTAGE', adjustmentValue: 20, reason: '', applyToAllRooms: false },
  });
  return { formError, setFormError, rates, loadingRates, createMut, deleteMut, bulkMut, form };
}

async function submitRate(
  data: PeakRateFormData, bulkMut: any, createMut: any,
  reset: any, setError: (s: string | null) => void
) {
  try {
    setError(null);
    const p = { startDate: data.startDate, endDate: data.endDate, adjustmentType: data.adjustmentType, adjustmentValue: data.adjustmentValue, reason: data.reason || undefined };
    if (data.applyToAllRooms) await bulkMut.mutateAsync(p);
    else await createMut.mutateAsync(p);
    reset({ startDate: '', endDate: '', adjustmentType: 'PERCENTAGE', adjustmentValue: 20, reason: '', applyToAllRooms: false });
  } catch (err: unknown) {
    setError((err as Error).message || 'Gagal menyimpan tarif musiman.');
  }
}

function ActiveRatesList({ rates, isLoading, onDelete, isDeleting }: any) {
  return (
    <div>
      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Daftar Tarif Musiman Aktif</h4>
      <RateListSection rates={rates} isLoading={isLoading} onDelete={onDelete} isDeleting={isDeleting} />
    </div>
  );
}

export function PeakSeasonRateModal({ roomId, roomName, propertyId, isOpen, onClose }: PeakSeasonRateModalProps): React.JSX.Element {
  const s = usePeakSeasonModalState(roomId, propertyId);
  const isBusy = s.createMut.isPending || s.deleteMut.isPending || s.bulkMut.isPending;
  const onSub = (d: PeakRateFormData) => submitRate(d, s.bulkMut, s.createMut, s.form.reset, s.setFormError);
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Tarif Musiman: ${roomName}`} description="Atur penyesuaian harga khusus pada periode libur atau promo." footer={<Button type="button" variant="outline" size="sm" onClick={onClose}>Tutup</Button>}>
      <div className="space-y-6">
        {s.formError && <Alert variant="error">{s.formError}</Alert>}
        <RateForm register={s.form.register} control={s.form.control} errors={s.form.formState.errors} selectedType={s.form.watch('adjustmentType')} isBusy={isBusy} onSubmit={s.form.handleSubmit(onSub)} />
        <ActiveRatesList rates={s.rates} isLoading={s.loadingRates} onDelete={(id: string) => s.deleteMut.mutate(id)} isDeleting={s.deleteMut.isPending} />
      </div>
    </Modal>
  );
}
