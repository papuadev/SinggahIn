import React from 'react';
import { PropertyImage } from '../property.types';
import { MAX_PROPERTY_IMAGES } from '../schemas/property-image.schema';
import { Alert } from '../../../components/atoms/Alert';
import { useGalleryManager } from '../hooks/useGalleryManager';
import { UploadDropzone } from './UploadDropzone';
import { StagedGallerySection } from './StagedGallerySection';
import { UploadedImageCard } from './UploadedImageCard';
import { PropertyGalleryManagerProps, StagedImage } from '../property-gallery.types';

export type { StagedImage, PropertyGalleryManagerProps };

function GalleryHeader({ count, stagedCount }: { count: number; stagedCount: number }): React.JSX.Element {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
      <div>
        <h3 className="text-base font-bold text-gray-900">Galeri Foto Properti</h3>
        <p className="text-xs text-gray-500">Unggah 1 hingga 6 foto penginapan terbaik (maks. 1MB per foto, JPG/PNG/WebP).</p>
      </div>
      <div className="flex items-center gap-2 self-start sm:self-auto">
        {stagedCount > 0 && <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">{stagedCount} Siap Diunggah</span>}
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-primary-50 text-primary-700 border border-primary-200">{count + stagedCount} / {MAX_PROPERTY_IMAGES} Foto</span>
      </div>
    </div>
  );
}

interface GalleryGridProps {
  images: PropertyImage[]; disabled: boolean;
  onSetCover: (id: string) => void; onDelete: (id: string) => void; onMove: (from: number, to: number) => void;
}

function GridHeader({ count }: { count: number }): React.JSX.Element {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-3">
      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Foto Properti Terunggah ({count})</h4>
      <p className="text-xs text-gray-400">Atur urutan foto dengan tombol panah atau seret (drag &amp; drop)</p>
    </div>
  );
}

function GalleryGrid(p: GalleryGridProps): React.JSX.Element | null {
  if (p.images.length === 0) return null;
  return (
    <div>
      <GridHeader count={p.images.length} />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {p.images.map((img, idx) => (
          <UploadedImageCard key={img.id} image={img} index={idx} total={p.images.length} disabled={p.disabled} onSetCover={p.onSetCover} onDelete={p.onDelete} onMove={p.onMove} />
        ))}
      </div>
    </div>
  );
}

function resolveError(valError: string | null, uploadErr: unknown, deleteErr: unknown, reorderErr: unknown): string | null {
  return valError || (uploadErr as Error)?.message || (deleteErr as Error)?.message || (reorderErr as Error)?.message || null;
}

function useManagerHandlers(gm: ReturnType<typeof useGalleryManager>, onUpdated?: () => void) {
  const onDelete = (id: string) => gm.deleteMut.mutateAsync(id).then(() => onUpdated?.());
  const onCover = (id: string) => gm.coverMut.mutateAsync(id).then(() => onUpdated?.());
  const err = resolveError(gm.valError, gm.uploadMut.error, gm.deleteMut.error, gm.reorderMut.error);
  const isFull = gm.uploadedImages.length + gm.stagedImages.length >= MAX_PROPERTY_IMAGES;
  return { onDelete, onCover, err, isFull };
}

export function PropertyGalleryManager({ propertyId, images = [], onImagesUpdated }: PropertyGalleryManagerProps): React.JSX.Element {
  const gm = useGalleryManager(propertyId, images, onImagesUpdated);
  const { onDelete, onCover, err, isFull } = useManagerHandlers(gm, onImagesUpdated);
  const hasCover = gm.uploadedImages.some((i) => i.isCover);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs">
      <GalleryHeader count={gm.uploadedImages.length} stagedCount={gm.stagedImages.length} />
      {err && <Alert variant="error" className="mb-4">{err}</Alert>}
      <UploadDropzone isFull={isFull} isUploading={gm.uploadMut.isPending} onFilesSelected={gm.handleStageFiles} />
      <StagedGallerySection stagedImages={gm.stagedImages} hasExistingCover={hasCover} isUploading={gm.uploadMut.isPending} onMove={gm.handleMoveStaged} onRemove={gm.handleRemoveStaged} onClearAll={gm.handleClearAllStaged} onUpload={gm.handleCommitUpload} />
      <GalleryGrid images={gm.uploadedImages} disabled={gm.isBusy} onSetCover={onCover} onDelete={onDelete} onMove={gm.handleMoveUploaded} />
    </div>
  );
}
