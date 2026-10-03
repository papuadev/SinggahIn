import React, { useEffect } from 'react';
import { useForm, UseFormRegister, FieldErrors, Control, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { roomFormSchema, RoomFormData } from '../schemas/room.schema';
import { Modal } from '../../../components/molecules/Modal';
import { FormField } from '../../../components/molecules/FormField';
import { Input } from '../../../components/atoms/Input';
import { CurrencyInput } from '../../../components/atoms/CurrencyInput';
import { Button } from '../../../components/atoms/Button';
import { Room } from '../room.types';

export interface RoomFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: RoomFormData) => Promise<void> | void;
  initialData?: Partial<RoomFormData> | Partial<Room> | null;
  isLoading?: boolean;
  title?: string;
}

interface FieldsProps {
  register: UseFormRegister<RoomFormData>;
  errors: FieldErrors<RoomFormData>;
}

function RoomNameField({ register, errors }: FieldsProps): React.JSX.Element {
  return (
    <FormField label="Nama Tipe Kamar" required error={errors.name?.message}>
      <Input placeholder="Contoh: Deluxe King Bed" hasError={Boolean(errors.name)} {...register('name')} />
    </FormField>
  );
}

function RoomPriceField({
  control, errors,
}: {
  control: Control<RoomFormData>;
  errors: FieldErrors<RoomFormData>;
}): React.JSX.Element {
  return (
    <FormField label="Harga Dasar (Rp)" required error={errors.basePrice?.message}>
      <Controller
        name="basePrice"
        control={control}
        render={({ field }) => (
          <CurrencyInput
            id="room-base-price"
            aria-label="Harga Dasar"
            placeholder="Contoh: 350.000"
            hasError={Boolean(errors.basePrice)}
            value={field.value}
            onValueChange={field.onChange}
            onBlur={field.onBlur}
          />
        )}
      />
    </FormField>
  );
}

function RoomWeekendRateField({ register, errors }: FieldsProps): React.JSX.Element {
  return (
    <FormField label="Tarif Weekend (+%)" error={errors.weekendRatePercent?.message}>
      <Input type="number" min={0} max={100} step={5} placeholder="Contoh: 20" hasError={Boolean(errors.weekendRatePercent)} {...register('weekendRatePercent', { valueAsNumber: true })} />
    </FormField>
  );
}

function RoomCapacityField({ register, errors }: FieldsProps): React.JSX.Element {
  return (
    <FormField label="Kapasitas Tamu" required error={errors.capacity?.message}>
      <Input type="number" min={1} max={50} placeholder="Contoh: 2" hasError={Boolean(errors.capacity)} {...register('capacity', { valueAsNumber: true })} />
    </FormField>
  );
}

function RoomUnitsField({ register, errors }: FieldsProps): React.JSX.Element {
  return (
    <FormField label="Jumlah Unit" required error={errors.totalUnits?.message}>
      <Input type="number" min={1} placeholder="Contoh: 5" hasError={Boolean(errors.totalUnits)} {...register('totalUnits', { valueAsNumber: true })} />
    </FormField>
  );
}

function RoomDescriptionField({ register, errors }: FieldsProps): React.JSX.Element {
  return (
    <FormField label="Deskripsi Kamar" error={errors.description?.message}>
      <textarea
        rows={3}
        placeholder="Fasilitas kamar khusus, tipe kasur, pemandangan jendela..."
        className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500 placeholder:text-gray-400"
        {...register('description')}
      />
    </FormField>
  );
}

function RoomModalFooter({ onClose, isLoading }: { onClose: () => void; isLoading: boolean }) {
  return (
    <div className="flex justify-end gap-2 w-full">
      <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
        Batal
      </Button>
      <Button type="submit" form="room-form" variant="primary" size="sm" isLoading={isLoading}>
        Simpan Kamar
      </Button>
    </div>
  );
}

function RoomFormBody({ register, control, errors, onSubmit }: {
  register: UseFormRegister<RoomFormData>;
  control: Control<RoomFormData>;
  errors: FieldErrors<RoomFormData>;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
}): React.JSX.Element {
  return (
    <form id="room-form" onSubmit={onSubmit} className="space-y-4">
      <RoomNameField register={register} errors={errors} />
      <div className="grid grid-cols-2 gap-3">
        <RoomPriceField control={control} errors={errors} />
        <RoomWeekendRateField register={register} errors={errors} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <RoomCapacityField register={register} errors={errors} />
        <RoomUnitsField register={register} errors={errors} />
      </div>
      <RoomDescriptionField register={register} errors={errors} />
    </form>
  );
}

function useRoomFormReset(
  isOpen: boolean,
  initialData: Partial<RoomFormData> | Partial<Room> | null | undefined,
  reset: (v: RoomFormData) => void
) {
  useEffect(() => {
    if (isOpen) {
      reset({
        name: initialData?.name ?? '',
        basePrice: initialData?.basePrice ?? 100000,
        weekendRatePercent: initialData?.weekendRatePercent ?? 0,
        capacity: initialData?.capacity ?? 2,
        totalUnits: initialData?.totalUnits ?? 1,
        description: initialData?.description ?? '',
      });
    }
  }, [isOpen, initialData, reset]);
}

export function RoomFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
  title = 'Tambah Tipe Kamar',
}: RoomFormModalProps): React.JSX.Element {
  const { register, control, handleSubmit, reset, formState: { errors } } = useForm<RoomFormData>({
    resolver: zodResolver(roomFormSchema) as any,
    defaultValues: { name: '', basePrice: 100000, weekendRatePercent: 0, capacity: 2, totalUnits: 1, description: '' },
  });
  useRoomFormReset(isOpen, initialData, reset);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description="Lengkapi detail tipe kamar, harga dasar per malam, dan unit yang tersedia."
      footer={<RoomModalFooter onClose={onClose} isLoading={isLoading} />}
    >
      <RoomFormBody register={register} control={control} errors={errors} onSubmit={handleSubmit(onSubmit)} />
    </Modal>
  );
}
