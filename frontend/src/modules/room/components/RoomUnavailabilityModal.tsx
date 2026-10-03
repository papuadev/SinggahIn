import React, { useState } from 'react';
import { useForm, UseFormRegister, FieldErrors, Control, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Trash2, CalendarOff } from 'lucide-react';
import { format } from 'date-fns';
import { RoomUnavailability } from '../pricing.types';
import {
  roomUnavailabilityFormSchema,
  RoomUnavailabilityFormData,
} from '../schemas/pricing.schema';
import {
  useRoomUnavailabilities,
  useCreateRoomUnavailability,
  useDeleteRoomUnavailability,
} from '../hooks/useRoomPricing';
import { Modal } from '../../../components/molecules/Modal';
import { FormField } from '../../../components/molecules/FormField';
import { DatePickerInput } from '../../../components/molecules/DatePickerInput';
import { Input } from '../../../components/atoms/Input';
import { Button } from '../../../components/atoms/Button';
import { Alert } from '../../../components/atoms/Alert';
import { Spinner } from '../../../components/atoms/Spinner';
import { formatDateID } from '../../../libs/formatters';

export interface RoomUnavailabilityModalProps {
  roomId: string;
  roomName: string;
  isOpen: boolean;
  onClose: () => void;
}

function UnavailabilityBadge() {
  return (
    <span className="font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-100 flex items-center gap-1">
      <CalendarOff className="w-3 h-3" /> Diblokir
    </span>
  );
}

function UnavailabilityItem({ item, onDelete, isDeleting }: { item: RoomUnavailability; onDelete: (id: string) => void; isDeleting: boolean }): React.JSX.Element {
  const dates = `${formatDateID(item.startDate, 'dd MMM yyyy')} - ${formatDateID(item.endDate, 'dd MMM yyyy')}`;
  return (
    <div className="flex items-center justify-between p-2.5 rounded-lg border border-gray-200 bg-gray-50/50 text-xs">
      <div>
        <div className="flex items-center gap-2"><UnavailabilityBadge /><span className="font-medium text-gray-800">{dates}</span></div>
        {item.reason && <p className="text-gray-500 mt-1">{item.reason}</p>}
      </div>
      <button type="button" onClick={() => onDelete(item.id)} disabled={isDeleting} aria-label="Batalkan blokir" className="p-1 text-gray-400 hover:text-rose-600 transition-colors disabled:opacity-50 cursor-pointer">
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

function UnavailStartDateField({ control, error, min }: { control: Control<RoomUnavailabilityFormData>; error?: string; min: string }): React.JSX.Element {
  return (
    <FormField label="Tanggal Mulai" htmlFor="unavail-start-date" required error={error}>
      <Controller
        name="startDate" control={control}
        render={({ field }) => <DatePickerInput id="unavail-start-date" min={min} value={field.value} onChange={field.onChange} hasError={Boolean(error)} aria-label="Tanggal Mulai" />}
      />
    </FormField>
  );
}

function UnavailEndDateField({ control, error, min }: { control: Control<RoomUnavailabilityFormData>; error?: string; min: string }): React.JSX.Element {
  return (
    <FormField label="Tanggal Selesai" htmlFor="unavail-end-date" required error={error}>
      <Controller
        name="endDate" control={control}
        render={({ field }) => <DatePickerInput id="unavail-end-date" min={min} value={field.value} onChange={field.onChange} hasError={Boolean(error)} align="right" aria-label="Tanggal Selesai" />}
      />
    </FormField>
  );
}

function UnavailabilityDateFields({ control, errors }: {
  control: Control<RoomUnavailabilityFormData>; errors: FieldErrors<RoomUnavailabilityFormData>;
}): React.JSX.Element {
  const minDate = format(new Date(), 'yyyy-MM-dd');
  return (
    <div className="grid grid-cols-2 gap-3">
      <UnavailStartDateField control={control} error={errors.startDate?.message} min={minDate} />
      <UnavailEndDateField control={control} error={errors.endDate?.message} min={minDate} />
    </div>
  );
}

function UnavailabilityReasonField({ register, errors }: {
  register: UseFormRegister<RoomUnavailabilityFormData>;
  errors: FieldErrors<RoomUnavailabilityFormData>;
}): React.JSX.Element {
  return (
    <FormField label="Alasan Pemblokiran" htmlFor="unavail-reason" error={errors.reason?.message}>
      <Input id="unavail-reason" placeholder="Contoh: Renovasi kamar, Maintenance AC, Offline booking..." {...register('reason')} />
    </FormField>
  );
}

type UnavailFormProps = {
  control: Control<RoomUnavailabilityFormData>; register: UseFormRegister<RoomUnavailabilityFormData>;
  errors: FieldErrors<RoomUnavailabilityFormData>; isPending: boolean; onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
};

function UnavailabilityForm({ control, register, errors, isPending, onSubmit }: UnavailFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-3 bg-white p-4 rounded-xl border border-gray-200">
      <UnavailabilityDateFields control={control} errors={errors} />
      <UnavailabilityReasonField register={register} errors={errors} />
      <div className="pt-2 flex justify-end">
        <Button type="submit" variant="primary" size="sm" isLoading={isPending} leftIcon={<CalendarOff className="w-3.5 h-3.5" />}>
          Simpan Pemblokiran Tanggal
        </Button>
      </div>
    </form>
  );
}

function BlockedDateList({ list, isLoading, isDeleting, onDelete }: any) {
  return (
    <div className="space-y-2 pt-2 border-t border-gray-100">
      <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Tanggal yang Sedang Diblokir ({list.length})</h4>
      {isLoading && <div className="py-4 text-center"><Spinner size="sm" /></div>}
      {!isLoading && list.length === 0 && <p className="text-xs text-gray-400 py-3 text-center">Tidak ada tanggal yang diblokir untuk kamar ini.</p>}
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {list.map((item: any) => <UnavailabilityItem key={item.id} item={item} onDelete={onDelete} isDeleting={isDeleting} />)}
      </div>
    </div>
  );
}

function useUnavailabilityModalState(roomId: string) {
  const [formError, setFormError] = useState<string | null>(null);
  const { data: unavailabilities = [], isLoading } = useRoomUnavailabilities(roomId);
  const createMut = useCreateRoomUnavailability(roomId);
  const deleteMut = useDeleteRoomUnavailability(roomId);
  const form = useForm<RoomUnavailabilityFormData>({
    resolver: zodResolver(roomUnavailabilityFormSchema) as any,
    defaultValues: { startDate: '', endDate: '', reason: '' },
  });
  return { formError, setFormError, unavailabilities, isLoading, createMut, deleteMut, form };
}

function createUnavailHandlers(createMut: any, deleteMut: any, reset: any, setError: (s: string | null) => void) {
  const onSubmit = async (data: RoomUnavailabilityFormData) => {
    try {
      setError(null);
      await createMut.mutateAsync({ startDate: data.startDate, endDate: data.endDate, reason: data.reason || undefined });
      reset({ startDate: '', endDate: '', reason: '' });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal memblokir tanggal kamar');
    }
  };
  const onDelete = async (id: string) => {
    try { setError(null); await deleteMut.mutateAsync(id); } catch (err: unknown) { setError(err instanceof Error ? err.message : 'Gagal membatalkan blokir'); }
  };
  return { onSubmit, onDelete };
}

export function RoomUnavailabilityModal({ roomId, roomName, isOpen, onClose }: RoomUnavailabilityModalProps): React.JSX.Element {
  const s = useUnavailabilityModalState(roomId);
  const h = createUnavailHandlers(s.createMut, s.deleteMut, s.form.reset, s.setFormError);
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Blokir Tanggal: ${roomName}`} description="Tutup ketersediaan kamar untuk keperluan renovasi atau pemeliharaan." footer={<Button type="button" variant="outline" size="sm" onClick={onClose}>Tutup</Button>}>
      <div className="space-y-5">
        {s.formError && <Alert variant="error">{s.formError}</Alert>}
        <UnavailabilityForm control={s.form.control} register={s.form.register} errors={s.form.formState.errors} isPending={s.createMut.isPending} onSubmit={s.form.handleSubmit(h.onSubmit)} />
        <BlockedDateList list={s.unavailabilities} isLoading={s.isLoading} isDeleting={s.deleteMut.isPending} onDelete={h.onDelete} />
      </div>
    </Modal>
  );
}
