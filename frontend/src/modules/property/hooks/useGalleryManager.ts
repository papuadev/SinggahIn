import React, { useState, useEffect } from 'react';
import { PropertyImage } from '../property.types';
import { StagedImage } from '../property-gallery.types';
import {
  useUploadPropertyImages,
  useDeletePropertyImage,
  useSetCoverPropertyImage,
  useReorderPropertyImages,
} from './usePropertyImages';
import { useStagedGallery, moveListItem } from './useStagedGallery';

async function executeReorderMutation(
  copy: PropertyImage[], existing: PropertyImage[],
  setUploaded: React.Dispatch<React.SetStateAction<PropertyImage[]>>,
  reorderMut: ReturnType<typeof useReorderPropertyImages>,
  onError: (e: string | null) => void, onUpdated?: () => void
) {
  try {
    await reorderMut.mutateAsync(copy.map((img) => img.id));
    onUpdated?.();
  } catch (err: unknown) {
    setUploaded(existing);
    onError(err instanceof Error ? err.message : 'Gagal mengubah urutan foto.');
  }
}

function createUploadedMoveHandler(
  uploadedImages: PropertyImage[], existing: PropertyImage[],
  setUploaded: React.Dispatch<React.SetStateAction<PropertyImage[]>>,
  reorderMut: ReturnType<typeof useReorderPropertyImages>,
  onError: (e: string | null) => void, onUpdated?: () => void
) {
  return (from: number, to: number) => {
    if (to < 0 || to >= uploadedImages.length || from === to) return;
    const copy = moveListItem(uploadedImages, from, to);
    setUploaded(copy);
    onError(null);
    executeReorderMutation(copy, existing, setUploaded, reorderMut, onError, onUpdated);
  };
}

async function executeUploadMutation(
  stagedImages: StagedImage[], uploadMut: ReturnType<typeof useUploadPropertyImages>,
  clearStaged: () => void, onUpdated?: () => void
) {
  try {
    await uploadMut.mutateAsync(stagedImages.map((s) => s.file));
    clearStaged();
    onUpdated?.();
  } catch {
    // Error is caught by mutation state
  }
}

function createCommitUploadHandler(
  stagedImages: StagedImage[], uploadMut: ReturnType<typeof useUploadPropertyImages>,
  clearStaged: () => void, onError: (e: string | null) => void, onUpdated?: () => void
) {
  return () => {
    if (stagedImages.length === 0) return;
    onError(null);
    executeUploadMutation(stagedImages, uploadMut, clearStaged, onUpdated);
  };
}

function useGalleryMutations(propertyId: string) {
  const uploadMut = useUploadPropertyImages(propertyId);
  const deleteMut = useDeletePropertyImage(propertyId);
  const coverMut = useSetCoverPropertyImage(propertyId);
  const reorderMut = useReorderPropertyImages(propertyId);
  const isBusy = uploadMut.isPending || deleteMut.isPending || coverMut.isPending || reorderMut.isPending;
  return { uploadMut, deleteMut, coverMut, reorderMut, isBusy };
}

export function useGalleryManager(propertyId: string, existing: PropertyImage[], onUpdated?: () => void) {
  const [valError, setValError] = useState<string | null>(null);
  const [uploadedImages, setUploadedImages] = useState<PropertyImage[]>(existing);
  useEffect(() => setUploadedImages(existing), [existing]);
  const staged = useStagedGallery(uploadedImages.length, setValError);
  const muts = useGalleryMutations(propertyId);
  const handleMoveUploaded = createUploadedMoveHandler(uploadedImages, existing, setUploadedImages, muts.reorderMut, setValError, onUpdated);
  const handleCommitUpload = createCommitUploadHandler(staged.stagedImages, muts.uploadMut, staged.clearStaged, setValError, onUpdated);

  return { valError, uploadedImages, ...muts, handleMoveUploaded, handleCommitUpload, ...staged };
}
