import { useState, useEffect } from 'react';
import { PropertyImage } from '../property.types';
import { StagedImage } from '../property-gallery.types';
import {
  useUploadPropertyImages,
  useDeletePropertyImage,
  useSetCoverPropertyImage,
} from './usePropertyImages';
import { validateImageBatchAsync } from '../schemas/property-image.schema';

function makeStagedImage(file: File): StagedImage {
  const id = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `staged-${Date.now()}-${Math.random()}`;
  return { id, file, previewUrl: URL.createObjectURL(file) };
}

function revokeStagedList(list: StagedImage[]): void {
  list.forEach((s) => URL.revokeObjectURL(s.previewUrl));
}

export function useGalleryManager(
  propertyId: string,
  existingImages: PropertyImage[],
  onImagesUpdated?: () => void
) {
  const [valError, setValError] = useState<string | null>(null);
  const [stagedImages, setStagedImages] = useState<StagedImage[]>([]);
  const uploadMut = useUploadPropertyImages(propertyId);
  const deleteMut = useDeletePropertyImage(propertyId);
  const coverMut = useSetCoverPropertyImage(propertyId);
  const isBusy = uploadMut.isPending || deleteMut.isPending || coverMut.isPending;

  useEffect(() => () => revokeStagedList(stagedImages), [stagedImages]);

  const handleStageFiles = async (files: File[]) => {
    setValError(null);
    const total = existingImages.length + stagedImages.length;
    const err = await validateImageBatchAsync(files, total);
    if (err) return setValError(err);
    const newItems = files.map(makeStagedImage);
    setStagedImages((prev) => [...prev, ...newItems]);
  };

  const handleRemoveStaged = (id: string) => {
    setStagedImages((prev) => {
      const item = prev.find((s) => s.id === id);
      if (item) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((s) => s.id !== id);
    });
  };

  const handleClearAllStaged = () => {
    revokeStagedList(stagedImages);
    setStagedImages([]);
  };

  const handleMoveStaged = (from: number, to: number) => {
    if (to < 0 || to >= stagedImages.length || from === to) return;
    setStagedImages((prev) => {
      const copy = [...prev];
      const [moved] = copy.splice(from, 1);
      copy.splice(to, 0, moved);
      return copy;
    });
  };

  const handleCommitUpload = async () => {
    if (stagedImages.length === 0) return;
    setValError(null);
    try {
      await uploadMut.mutateAsync(stagedImages.map((s) => s.file));
      revokeStagedList(stagedImages);
      setStagedImages([]);
      onImagesUpdated?.();
    } catch {
      // Error is caught by mutation state
    }
  };

  return {
    valError,
    stagedImages,
    uploadMut,
    deleteMut,
    coverMut,
    isBusy,
    handleStageFiles,
    handleRemoveStaged,
    handleClearAllStaged,
    handleMoveStaged,
    handleCommitUpload,
  };
}
