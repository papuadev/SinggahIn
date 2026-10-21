import React, { useState } from 'react';
import { Plus, Tag, Lock, Pencil, Trash2 } from 'lucide-react';
import { PropertyCategory } from '../../modules/property/property.types';
import {
  usePropertyCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from '../../modules/property/hooks/useProperties';
import { useAuthStore } from '../../stores/auth.store';
import { Button } from '../../components/atoms/Button';
import { Spinner } from '../../components/atoms/Spinner';
import { Badge } from '../../components/atoms/Badge';
import { Alert } from '../../components/atoms/Alert';
import { TenantCategoryFormModal, TenantCategoryDeleteModal } from './components/TenantCategoryModal';

function CategoryHeader({ onOpenCreate }: { onOpenCreate: () => void }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Kelola Kategori Properti</h1>
        <p className="text-sm text-gray-600 mt-1">Daftar kategori bawaan sistem dan kategori kustom yang Anda miliki.</p>
      </div>
      <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={onOpenCreate}>Tambah Kategori</Button>
    </div>
  );
}

function CategoryCardHeader({ cat }: { cat: PropertyCategory }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-bold text-gray-900 text-base flex items-center gap-2"><Tag className="w-4 h-4 text-primary-600" />{cat.name}</h3>
        <Badge variant={cat.isProtected ? 'neutral' : 'success'}>{cat.isProtected ? 'Sistem' : 'Kustom'}</Badge>
      </div>
      <p className="text-xs text-gray-400 font-mono">slug: {cat.slug}</p>
      <p className="text-xs text-gray-600 line-clamp-2 min-h-[32px]">{cat.description || 'Tidak ada deskripsi.'}</p>
    </div>
  );
}

type CatActionProps = { cat: PropertyCategory; onEdit: (c: PropertyCategory) => void; onDelete: (c: PropertyCategory) => void };

function CategoryCardActions({ cat, onEdit, onDelete }: CatActionProps) {
  if (cat.isProtected) return <span className="inline-flex items-center gap-1 text-gray-400 text-xs"><Lock className="w-3.5 h-3.5" /> Terkunci</span>;
  return (
    <div className="flex items-center gap-1.5">
      <Button type="button" variant="outline" size="sm" onClick={() => onEdit(cat)} leftIcon={<Pencil className="w-3 h-3" />}>Ubah</Button>
      <Button type="button" variant="ghost" size="sm" onClick={() => onDelete(cat)} className="text-gray-400 hover:text-rose-600" leftIcon={<Trash2 className="w-3 h-3" />}>Hapus</Button>
    </div>
  );
}

function CategoryItemCard({ cat, onEdit, onDelete }: CatActionProps) {
  const pCount = cat.propertyCount ?? cat._count?.properties ?? 0;
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:border-primary-200 transition-all shadow-xs flex flex-col justify-between gap-3">
      <CategoryCardHeader cat={cat} />
      <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
        <span className="text-gray-500 font-medium">{pCount} Properti</span>
        <CategoryCardActions cat={cat} onEdit={onEdit} onDelete={onDelete} />
      </div>
    </div>
  );
}

function CategoryEmptyNotice() {
  return (
    <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-8 text-center text-sm text-gray-500">
      Belum ada kategori kustom yang Anda buat. Klik "Tambah Kategori" di atas untuk menambahkan kategori baru.
    </div>
  );
}

function CategorySectionGrid({ categories, onEdit, onDelete }: { categories: PropertyCategory[]; onEdit: (c: PropertyCategory) => void; onDelete: (c: PropertyCategory) => void }) {
  if (categories.length === 0) return <CategoryEmptyNotice />;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {categories.map((c) => <CategoryItemCard key={c.id} cat={c} onEdit={onEdit} onDelete={onDelete} />)}
    </div>
  );
}

function CategorySection({ title, desc, categories, onEdit, onDelete }: { title: string; desc: string; categories: PropertyCategory[]; onEdit: (c: PropertyCategory) => void; onDelete: (c: PropertyCategory) => void }) {
  return (
    <section className="mb-8">
      <div className="mb-3">
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
        <p className="text-xs text-gray-500">{desc}</p>
      </div>
      <CategorySectionGrid categories={categories} onEdit={onEdit} onDelete={onDelete} />
    </section>
  );
}

function CategoryModals({ formTarget, setFormTarget, onFormSubmit, createMut, updateMut, deleteTarget, setDeleteTarget, onDelete, deleteMut }: any) {
  const formErr = createMut.error ? (createMut.error as Error).message : updateMut.error ? (updateMut.error as Error).message : null;
  const isFormLoad = createMut.isPending || updateMut.isPending;
  const delErr = deleteMut.error ? (deleteMut.error as Error).message : null;
  return (
    <>
      <TenantCategoryFormModal isOpen={formTarget !== undefined} onClose={() => setFormTarget(undefined)} initialData={formTarget} onSubmit={onFormSubmit} isLoading={isFormLoad} error={formErr} />
      <TenantCategoryDeleteModal isOpen={Boolean(deleteTarget)} target={deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={onDelete} isDeleting={deleteMut.isPending} error={delErr} />
    </>
  );
}

function useCategoryHandlers(formTarget: any, setFormTarget: any, deleteTarget: any, setDeleteTarget: any) {
  const createMut = useCreateCategory();
  const updateMut = useUpdateCategory();
  const deleteMut = useDeleteCategory();
  const onFormSubmit = async (data: { name: string; description?: string }) => {
    if (formTarget) await updateMut.mutateAsync({ id: formTarget.id, data });
    else await createMut.mutateAsync(data);
    setFormTarget(undefined);
  };
  const onDelete = async () => {
    if (deleteTarget) await deleteMut.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  };
  return { createMut, updateMut, deleteMut, onFormSubmit, onDelete };
}

function useCategorizedLists(categories: PropertyCategory[], currentTenantId?: string) {
  const sysCats = categories.filter((c) => c.isProtected);
  const myCustomCats = categories.filter((c) => !c.isProtected && c.tenantId === currentTenantId);
  return { sysCats, myCustomCats };
}

function useTenantCategoryState() {
  const { data: categories = [], isLoading, isError, error } = usePropertyCategories();
  const currentTenantId = useAuthStore((s) => s.user?.id);
  const [formTarget, setFormTarget] = useState<PropertyCategory | null | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = useState<PropertyCategory | null>(null);
  const h = useCategoryHandlers(formTarget, setFormTarget, deleteTarget, setDeleteTarget);
  const { sysCats, myCustomCats } = useCategorizedLists(categories, currentTenantId);
  return { formTarget, setFormTarget, deleteTarget, setDeleteTarget, h, sysCats, myCustomCats, isLoading, isError, error };
}

export function TenantCategoryPage(): React.JSX.Element {
  const s = useTenantCategoryState();
  if (s.isLoading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>;
  if (s.isError) return <Alert variant="error">{(s.error as Error)?.message || 'Gagal memuat kategori'}</Alert>;
  return (
    <div className="max-w-7xl mx-auto">
      <CategoryHeader onOpenCreate={() => s.setFormTarget(null)} />
      <CategorySection title="Kategori Bawaan Sistem" desc="Kategori standar sistem yang dapat digunakan oleh seluruh tenant." categories={s.sysCats} onEdit={s.setFormTarget} onDelete={s.setDeleteTarget} />
      <CategorySection title="Kategori Kustom Saya" desc="Daftar kategori kustom yang Anda buat. Anda dapat mengubah atau menghapus kategori ini." categories={s.myCustomCats} onEdit={s.setFormTarget} onDelete={s.setDeleteTarget} />
      <CategoryModals formTarget={s.formTarget} setFormTarget={s.setFormTarget} onFormSubmit={s.h.onFormSubmit} createMut={s.h.createMut} updateMut={s.h.updateMut} deleteTarget={s.deleteTarget} setDeleteTarget={s.setDeleteTarget} onDelete={s.h.onDelete} deleteMut={s.h.deleteMut} />
    </div>
  );
}
