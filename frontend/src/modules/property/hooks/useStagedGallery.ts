import React, { useState, useEffect } from 'react';
import { StagedImage } from '../property-gallery.types';
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

export function moveListItem<T>(list: T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length || from === to) return list;
  const copy = [...list];
  const [moved] = copy.splice(from, 1);
  copy.splice(to, 0, moved);
  return copy;
}

function removeStagedItem(prev: StagedImage[], id: string): StagedImage[] {
  const item = prev.find((s) => s.id === id);
  if (item) URL.revokeObjectURL(item.previewUrl);
  return prev.filter((s) => s.id !== id);
}

function createStageFilesHandler(
  uploadedCount: number, stagedCount: number,
  setStaged: React.Dispatch<React.SetStateAction<StagedImage[]>>,
  onError: (e: string | null) => void
) {
  return async (files: File[]) => {
    onError(null);
    const err = await validateImageBatchAsync(files, uploadedCount + stagedCount);
    if (err) return onError(err);
    setStaged((prev) => [...prev, ...files.map(makeStagedImage)]);
  };
}

export function useStagedGallery(uploadedCount: number, onError: (e: string | null) => void) {
  const [stagedImages, setStagedImages] = useState<StagedImage[]>([]);
  useEffect(() => () => revokeStagedList(stagedImages), [stagedImages]);
  const handleStageFiles = createStageFilesHandler(uploadedCount, stagedImages.length, setStagedImages, onError);
  const handleRemoveStaged = (id: string) => setStagedImages((p) => removeStagedItem(p, id));
  const handleClearAllStaged = () => { revokeStagedList(stagedImages); setStagedImages([]); };
  const handleMoveStaged = (from: number, to: number) => setStagedImages((p) => moveListItem(p, from, to));
  return { stagedImages, handleStageFiles, handleRemoveStaged, handleClearAllStaged, handleMoveStaged, clearStaged: handleClearAllStaged };
}
