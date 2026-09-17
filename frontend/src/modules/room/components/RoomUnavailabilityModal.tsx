import React, { useState } from 'react';
import { useForm, UseFormRegister, FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Trash2, CalendarOff } from 'lucide-react';
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

function UnavailabilityItem({ item, onDelete, isDeleting }: {
  item: RoomUnavailability;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}): React.JSX.Element {
  return (
    <div className="flex items-center justify-between p-2.5 rounded-lg border border-gray-200 bg-gray-50/50 text-xs">
      <div>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-100 flex items-center gap-1">
            <CalendarOff className="w-3 h-3" /> Diblokir
          </span>
          <span className="font-medium text-gray-800">
            {formatDateID(item.startDate, 'dd MMM yyyy')} - {formatDateID(item.endDate, 'dd MMM yyyy')}
          </span>
        </div>
        {item.reason && <p className="text-gray-500 mt-1">{item.reason}</p>}
      </div>
      <button
        type="button"
        onClick={() => onDelete(item.id)}
        disabled={isDeleting}
        aria-label="Batalkan blokir"
        className="p-1 text-gray-400 hover:text-rose-600 transition-colors disabled:opacity-50 cursor-pointer"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

function UnavailabilityDateFields({ register, errors }: {
  register: UseFormRegister<RoomUnavailabilityFormData>;
  errors: FieldErrors<RoomUnavailabilityFormData>;
}): React.JSX.Element {
  return (
    <div className="grid grid-cols-2 gap-3">
      <FormField label="Tanggal Mulai" htmlFor="unavail-start-date" required error={errors.startDate?.message}>
        <Input id="unavail-start-date" type="date" hasError={Boolean(errors.startDate)} {...register('startDate')} />
      </FormField>
      <FormField label="Tanggal Selesai" htmlFor="unavail-end-date" required error={errors.endDate?.message}>
        <Input id="unavail-end-date" type="date" hasError={Boolean(errors.endDate)} {...register('endDate')} />
      </FormField>
    </div>
  );
}

function UnavailabilityReasonField({ register, errors }: {
  register: UseFormRegister<RoomUnavailabilityFormData>;
  errors: FieldErrors<RoomUnavailabilityFormData>;
}): React.JSX.Element {
  return (
    <FormField label="Alasan Pemblokiran" htmlFor="unavail-reason" error={errors.reason?.message}>
      <Input
        id="unavail-reason"
        placeholder="Contoh: Renovasi kamar, Maintenance AC, Offline booking..."
        {...register('reason')}
      />
    </FormField>
  );
}

export function RoomUnavailabilityModal({
  roomId,
  roomName,
  isOpen,
  onClose,
}: RoomUnavailabilityModalProps): React.JSX.Element {
  const [formError, setFormError] = useState<string | null>(null);
  const { data: unavailabilities = [], isLoading } = useRoomUnavailabilities(roomId);
  const createMut = useCreateRoomUnavailability(roomId);
  const deleteMut = useDeleteRoomUnavailability(roomId);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<RoomUnavailabilityFormData>({
    resolver: zodResolver(roomUnavailabilityFormSchema) as any,
    defaultValues: { startDate: '', endDate: '', reason: '' },
  });

  const handleFormSubmit = async (data: RoomUnavailabilityFormData) => {
    try {
      setFormError(null);
      await createMut.mutateAsync({ startDate: data.startDate, endDate: data.endDate, reason: data.reason || undefined });
      reset({ startDate: '', endDate: '', reason: '' });
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Gagal memblokir tanggal kamar');
    }
  };

  const handleDelete = async (unavailabilityId: string) => {
    try {
      setFormError(null);
      await deleteMut.mutateAsync(unavailabilityId);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Gagal membatalkan blokir');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Blokir Tanggal: ${roomName}`}
      description="Tutup ketersediaan kamar untuk keperluan renovasi atau pemeliharaan."
      footer={<Button type="button" variant="outline" size="sm" onClick={onClose}>Tutup</Button>}
    >
      <div className="space-y-5">
        {formError && <Alert variant="error">{formError}</Alert>}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-3 bg-white p-4 rounded-xl border border-gray-200">
          <UnavailabilityDateFields register={register} errors={errors} />
          <UnavailabilityReasonField register={register} errors={errors} />
          <div className="pt-2 flex justify-end">
            <Button type="submit" variant="primary" size="sm" isLoading={createMut.isPending} leftIcon={<CalendarOff className="w-3.5 h-3.5" />}>
              Simpan Pemblokiran Tanggal
            </Button>
          </div>
        </form>
        <div className="space-y-2 pt-2 border-t border-gray-100">
          <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
            Tanggal yang Sedang Diblokir ({unavailabilities.length})
          </h4>
          {isLoading && <div className="py-4 text-center"><Spinner size="sm" /></div>}
          {!isLoading && unavailabilities.length === 0 && (
            <p className="text-xs text-gray-400 py-3 text-center">Tidak ada tanggal yang diblokir untuk kamar ini.</p>
          )}
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {unavailabilities.map((item) => (
              <UnavailabilityItem key={item.id} item={item} onDelete={handleDelete} isDeleting={deleteMut.isPending} />
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}
