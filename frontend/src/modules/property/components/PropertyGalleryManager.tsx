import React from 'react';
import { Trash2, Star, Check } from 'lucide-react';
import { PropertyImage } from '../property.types';
import { MAX_PROPERTY_IMAGES } from '../schemas/property-image.schema';
import { Alert } from '../../../components/atoms/Alert';
import { Button } from '../../../components/atoms/Button';
import { useGalleryManager } from '../hooks/useGalleryManager';
import { UploadDropzone } from './UploadDropzone';
import { StagedGallerySection } from './StagedGallerySection';
import { PropertyGalleryManagerProps, StagedImage } from '../property-gallery.types';

export type { StagedImage, PropertyGalleryManagerProps };

function GalleryHeader({ count, stagedCount }: { count: number; stagedCount: number }): React.JSX.Element {
  const total = count + stagedCount;
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
      <div>
        <h3 className="text-base font-bold text-gray-900">Galeri Foto Properti</h3>
        <p className="text-xs text-gray-500">Unggah 1 hingga 6 foto penginapan terbaik (maks. 1MB per foto, JPG/PNG/WebP).</p>
      </div>
      <div className="flex items-center gap-2 self-start sm:self-auto">
        {stagedCount > 0 && (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            {stagedCount} Siap Diunggah
          </span>
        )}
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-primary-50 text-primary-700 border border-primary-200">
          {total} / {MAX_PROPERTY_IMAGES} Foto
        </span>
      </div>
    </div>
  );
}

function ImageCoverAction({ isCover, disabled, onSetCover }: { isCover: boolean; disabled: boolean; onSetCover: () => void }): React.JSX.Element {
  if (isCover) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary-700 bg-primary-50 px-2 py-0.5 rounded-md">
        <Check className="w-3 h-3" /> Sampul Utama
      </span>
    );
  }
  return (
    <Button variant="ghost" size="sm" onClick={onSetCover} disabled={disabled} className="text-xs text-gray-600 hover:text-primary-600" leftIcon={<Star className="w-3 h-3" />}>
      Jadikan Sampul
    </Button>
  );
}

function ImageCard({
  image, disabled, onSetCover, onDelete,
}: {
  image: PropertyImage; disabled: boolean; onSetCover: (id: string) => void; onDelete: (id: string) => void;
}): React.JSX.Element {
  return (
    <div className={`group rounded-xl overflow-hidden border bg-white shadow-2xs transition-shadow ${image.isCover ? 'border-primary-500 ring-2 ring-primary-100' : 'border-gray-200'}`}>
      <div className="relative aspect-video bg-gray-100 overflow-hidden">
        <img src={image.imageUrl} alt="Foto Properti" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
      </div>
      <div className="flex items-center justify-between gap-1 p-2 bg-white border-t border-gray-100">
        <ImageCoverAction isCover={image.isCover} disabled={disabled} onSetCover={() => onSetCover(image.id)} />
        <button type="button" onClick={() => onDelete(image.id)} disabled={disabled} aria-label="Hapus foto" className="p-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors disabled:opacity-50 cursor-pointer">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
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
    <div>
      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Foto Properti Terunggah</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((img) => (
          <ImageCard key={img.id} image={img} disabled={disabled} onSetCover={onSetCover} onDelete={onDelete} />
        ))}
      </div>
    </div>
  );
}

export function PropertyGalleryManager({ propertyId, images = [], onImagesUpdated }: PropertyGalleryManagerProps): React.JSX.Element {
  const {
    valError, stagedImages, uploadMut, deleteMut, coverMut, isBusy,
    handleStageFiles, handleRemoveStaged, handleClearAllStaged, handleMoveStaged, handleCommitUpload,
  } = useGalleryManager(propertyId, images, onImagesUpdated);

  const errorMsg = valError || (uploadMut.error as Error)?.message || (deleteMut.error as Error)?.message;
  const handleDelete = async (id: string) => { await deleteMut.mutateAsync(id); onImagesUpdated?.(); };
  const handleSetCover = async (id: string) => { await coverMut.mutateAsync(id); onImagesUpdated?.(); };
  const hasExistingCover = images.some((img) => img.isCover);
  const totalCount = images.length + stagedImages.length;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs">
      <GalleryHeader count={images.length} stagedCount={stagedImages.length} />
      {errorMsg && <Alert variant="error" className="mb-4">{errorMsg}</Alert>}
      <UploadDropzone isFull={totalCount >= MAX_PROPERTY_IMAGES} isUploading={uploadMut.isPending} onFilesSelected={handleStageFiles} />
      <StagedGallerySection
        stagedImages={stagedImages}
        hasExistingCover={hasExistingCover}
        isUploading={uploadMut.isPending}
        onMove={handleMoveStaged}
        onRemove={handleRemoveStaged}
        onClearAll={handleClearAllStaged}
        onUpload={handleCommitUpload}
      />
      <GalleryGrid images={images} disabled={isBusy} onSetCover={handleSetCover} onDelete={handleDelete} />
    </div>
  );
}
