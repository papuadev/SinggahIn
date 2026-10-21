import React, { useState, useEffect } from 'react';
import { PropertyCategory } from '../../../modules/property/property.types';
import { Modal } from '../../../components/molecules/Modal';
import { Button } from '../../../components/atoms/Button';
import { Input } from '../../../components/atoms/Input';
import { FormField } from '../../../components/molecules/FormField';
import { Alert } from '../../../components/atoms/Alert';

export interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; description?: string }) => Promise<void>;
  initialData?: PropertyCategory | null;
  isLoading?: boolean;
  error?: string | null;
}

function CategoryModalFooter({ onClose, isLoading }: { onClose: () => void; isLoading: boolean }) {
  return (
    <div className="flex justify-end gap-2 w-full">
      <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>Batal</Button>
      <Button type="submit" form="category-form" variant="primary" isLoading={isLoading}>Simpan</Button>
    </div>
  );
}

type CatFieldProps = { name: string; setName: (v: string) => void; description: string; setDescription: (v: string) => void; error: string };

function CategoryFormFields({ name, setName, description, setDescription, error }: CatFieldProps) {
  return (
    <div className="space-y-4">
      {error && <Alert variant="error">{error}</Alert>}
      <FormField label="Nama Kategori" required error={error}>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Contoh: Glamping, Cottage, Resort" maxLength={50} autoFocus />
      </FormField>
      <FormField label="Deskripsi (Opsional)">
        <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Deskripsi singkat mengenai jenis penginapan ini..." maxLength={255} className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500 placeholder:text-gray-400" />
      </FormField>
    </div>
  );
}

function useCategoryForm(isOpen: boolean, initialData?: PropertyCategory | null) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setName(initialData?.name || '');
      setDescription(initialData?.description || '');
      setValidationError('');
    }
  }, [isOpen, initialData]);

  return { name, setName, description, setDescription, validationError, setValidationError };
}

function useCategorySubmit(f: any, onSubmit: any) {
  return async (e: React.FormEvent) => {
    e.preventDefault();
    if (f.name.trim().length < 3) return f.setValidationError('Nama kategori minimal 3 karakter.');
    f.setValidationError('');
    await onSubmit({ name: f.name.trim(), description: f.description.trim() || undefined });
  };
}

export function TenantCategoryFormModal({ isOpen, onClose, onSubmit, initialData, isLoading = false, error }: CategoryModalProps): React.JSX.Element {
  const f = useCategoryForm(isOpen, initialData);
  const handleSubmit = useCategorySubmit(f, onSubmit);
  const footer = <CategoryModalFooter onClose={onClose} isLoading={isLoading} />;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Ubah Kategori Properti' : 'Tambah Kategori Baru'} description="Kategori memudahkan tamu menemukan tipe penginapan yang sesuai." footer={footer}>
      <form id="category-form" onSubmit={handleSubmit}>
        <CategoryFormFields name={f.name} setName={f.setName} description={f.description} setDescription={f.setDescription} error={f.validationError || error || ''} />
      </form>
    </Modal>
  );
}

function CategoryDeleteFooter({ onClose, onConfirm, hasProperties, isDeleting }: { onClose: () => void; onConfirm: () => Promise<void>; hasProperties: boolean; isDeleting: boolean; }) {
  return (
    <div className="flex justify-end gap-2 w-full">
      <Button type="button" variant="outline" onClick={onClose} disabled={isDeleting}>Tutup</Button>
      {!hasProperties && <Button type="button" variant="danger" onClick={onConfirm} isLoading={isDeleting}>Ya, Hapus</Button>}
    </div>
  );
}

function CategoryDeleteBody({ target, error, hasProperties }: { target: PropertyCategory; error?: string | null; hasProperties: boolean }) {
  const pCount = target.propertyCount ?? target._count?.properties;
  return (
    <div className="space-y-3">
      {error && <Alert variant="error">{error}</Alert>}
      {hasProperties ? (
        <Alert variant="warning">Kategori <strong>{target.name}</strong> tidak dapat dihapus karena masih digunakan oleh {pCount} properti aktif.</Alert>
      ) : (
        <p className="text-sm text-gray-600">Apakah Anda yakin ingin menghapus kategori <strong>{target.name}</strong>? Tindakan ini tidak dapat dibatalkan.</p>
      )}
    </div>
  );
}

type CatDeleteModalProps = { target: PropertyCategory | null; isOpen: boolean; onClose: () => void; onConfirm: () => Promise<void>; isDeleting: boolean; error?: string | null };

export function TenantCategoryDeleteModal({ target, isOpen, onClose, onConfirm, isDeleting, error }: CatDeleteModalProps): React.JSX.Element {
  if (!target) return <></>;
  const hasProps = (target.propertyCount ?? target._count?.properties ?? 0) > 0;
  const footer = <CategoryDeleteFooter onClose={onClose} onConfirm={onConfirm} hasProperties={hasProps} isDeleting={isDeleting} />;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Hapus Kategori Properti" footer={footer}>
      <CategoryDeleteBody target={target} error={error} hasProperties={hasProps} />
    </Modal>
  );
}
