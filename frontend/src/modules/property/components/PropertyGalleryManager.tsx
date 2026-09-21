import React, { useRef, useState } from 'react';
import { UploadCloud, Trash2, Star, Check } from 'lucide-react';
import { PropertyImage } from '../property.types';
import {
  useUploadPropertyImages,
  useDeletePropertyImage,
  useSetCoverPropertyImage,
} from '../hooks/usePropertyImages';
import {
  validateImageBatchAsync,
  MAX_PROPERTY_IMAGES,
} from '../schemas/property-image.schema';
import { Alert } from '../../../components/atoms/Alert';
import { Spinner } from '../../../components/atoms/Spinner';
import { Button } from '../../../components/atoms/Button';

function GalleryHeader({ count }: { count: number }): React.JSX.Element {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
      <div>
        <h3 className="text-base font-bold text-gray-900">Galeri Foto Properti</h3>
        <p className="text-xs text-gray-500">Unggah 1 hingga 6 foto penginapan terbaik (maks. 1MB per foto, JPG/PNG/WebP).</p>
      </div>
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-primary-50 text-primary-700 border border-primary-200 self-start sm:self-auto">
        {count} / {MAX_PROPERTY_IMAGES} Foto
      </span>
    </div>
  );
}

function DropzoneContent({ isFull, isUploading }: { isFull: boolean; isUploading: boolean }): React.JSX.Element {
  if (isUploading) {
    return <div className="flex items-center justify-center gap-2 text-sm text-primary-600"><Spinner size="sm" /><span>Mengunggah foto...</span></div>;
  }
  if (isFull) {
    return <p className="text-xs text-gray-400 font-medium">Batas maksimal 6 foto telah tercapai.</p>;
  }
  return (
    <>
      <UploadCloud className="w-8 h-8 text-primary-500 mx-auto mb-2" />
      <p className="text-sm font-semibold text-gray-700">Klik untuk memilih foto</p>
      <p className="text-xs text-gray-400 mt-0.5">JPG, PNG, WebP (Maksimal 1MB per file)</p>
    </>
  );
}

interface DropzoneProps {
  isFull: boolean;
  isUploading: boolean;
  onFilesSelected: (files: File[]) => void;
}

function UploadDropzone({ isFull, isUploading, onFilesSelected }: DropzoneProps): React.JSX.Element {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(Array.from(e.target.files));
      e.target.value = '';
    }
  };
  return (
    <div
      onClick={() => !isFull && !isUploading && fileInputRef.current?.click()}
      className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors mb-6 ${
        isFull || isUploading ? 'border-gray-200 bg-gray-50 cursor-not-allowed' : 'border-primary-200 bg-primary-50/30 hover:bg-primary-50/60 cursor-pointer'
      }`}
    >
      <input ref={fileInputRef} type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={handleChange} disabled={isFull || isUploading} className="hidden" aria-label="Unggah foto properti" />
      <DropzoneContent isFull={isFull} isUploading={isUploading} />
    </div>
  );
}

interface ImageActionsProps {
  isCover: boolean;
  disabled: boolean;
  onSetCover: () => void;
  onDelete: () => void;
}

function ImageActions({ isCover, disabled, onSetCover, onDelete }: ImageActionsProps): React.JSX.Element {
  return (
    <div className="flex items-center justify-between gap-1 p-2 bg-white border-t border-gray-100">
      {isCover ? (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary-700 bg-primary-50 px-2 py-0.5 rounded-md">
          <Check className="w-3 h-3" /> Sampul Utama
        </span>
      ) : (
        <Button variant="ghost" size="sm" onClick={onSetCover} disabled={disabled} className="text-xs text-gray-600 hover:text-primary-600" leftIcon={<Star className="w-3 h-3" />}>
          Jadikan Sampul
        </Button>
      )}
      <button type="button" onClick={onDelete} disabled={disabled} aria-label="Hapus foto" className="p-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors disabled:opacity-50 cursor-pointer">
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

interface ImageCardProps {
  image: PropertyImage;
  disabled: boolean;
  onSetCover: (id: string) => void;
  onDelete: (id: string) => void;
}

function ImageCard({ image, disabled, onSetCover, onDelete }: ImageCardProps): React.JSX.Element {
  return (
    <div className={`group rounded-xl overflow-hidden border bg-white shadow-2xs transition-shadow ${image.isCover ? 'border-primary-500 ring-2 ring-primary-100' : 'border-gray-200'}`}>
      <div className="relative aspect-video bg-gray-100 overflow-hidden">
        <img src={image.imageUrl} alt="Foto Properti" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
      </div>
      <ImageActions isCover={image.isCover} disabled={disabled} onSetCover={() => onSetCover(image.id)} onDelete={() => onDelete(image.id)} />
    </div>
  );
}

function GalleryGrid({
  images, disabled, onSetCover, onDelete,
}: {
  images: PropertyImage[]; disabled: boolean; onSetCover: (id: string) => void; onDelete: (id: string) => void;
}): React.JSX.Element | null {
  if (images.length === 0) return null;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {images.map((img) => (
        <ImageCard key={img.id} image={img} disabled={disabled} onSetCover={onSetCover} onDelete={onDelete} />
      ))}
    </div>
  );
}

function useGalleryManager(propertyId: string, currentCount: number, onImagesUpdated?: () => void) {
  const [valError, setValError] = useState<string | null>(null);
  const uploadMut = useUploadPropertyImages(propertyId);
  const deleteMut = useDeletePropertyImage(propertyId);
  const coverMut = useSetCoverPropertyImage(propertyId);
  const isBusy = uploadMut.isPending || deleteMut.isPending || coverMut.isPending;

  const handleUpload = async (files: File[]) => {
    setValError(null);
    const err = await validateImageBatchAsync(files, currentCount);
    if (err) return setValError(err);
    await uploadMut.mutateAsync(files);
    onImagesUpdated?.();
  };

  return { valError, uploadMut, deleteMut, coverMut, isBusy, handleUpload };
}

export interface PropertyGalleryManagerProps {
  propertyId: string;
  images?: PropertyImage[];
  onImagesUpdated?: () => void;
}

export function PropertyGalleryManager({ propertyId, images = [], onImagesUpdated }: PropertyGalleryManagerProps): React.JSX.Element {
  const { valError, uploadMut, deleteMut, coverMut, isBusy, handleUpload } = useGalleryManager(propertyId, images.length, onImagesUpdated);
  const errorMsg = valError || (uploadMut.error as Error)?.message || (deleteMut.error as Error)?.message;
  const handleDelete = async (id: string) => { await deleteMut.mutateAsync(id); onImagesUpdated?.(); };
  const handleSetCover = async (id: string) => { await coverMut.mutateAsync(id); onImagesUpdated?.(); };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs">
      <GalleryHeader count={images.length} />
      {errorMsg && <Alert variant="error" className="mb-4">{errorMsg}</Alert>}
      <UploadDropzone isFull={images.length >= MAX_PROPERTY_IMAGES} isUploading={uploadMut.isPending} onFilesSelected={handleUpload} />
      <GalleryGrid images={images} disabled={isBusy} onSetCover={handleSetCover} onDelete={handleDelete} />
    </div>
  );
}
