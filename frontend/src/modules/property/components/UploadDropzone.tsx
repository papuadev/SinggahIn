import React, { useRef, useState } from 'react';
import { UploadCloud } from 'lucide-react';
import { Spinner } from '../../../components/atoms/Spinner';

interface DropzoneContentProps {
  isFull: boolean;
  isUploading: boolean;
  isDragOver: boolean;
}

function DropzoneContent({ isFull, isUploading, isDragOver }: DropzoneContentProps): React.JSX.Element {
  if (isUploading) {
    return (
      <div className="flex items-center justify-center gap-2 text-sm text-primary-600">
        <Spinner size="sm" />
        <span>Mengunggah foto...</span>
      </div>
    );
  }
  if (isFull) {
    return <p className="text-xs text-gray-400 font-medium">Batas maksimal 6 foto telah tercapai.</p>;
  }
  if (isDragOver) {
    return (
      <div className="animate-pulse">
        <UploadCloud className="w-8 h-8 text-primary-600 mx-auto mb-2" />
        <p className="text-sm font-semibold text-primary-700">Lepaskan file di sini</p>
        <p className="text-xs text-primary-500 mt-0.5">File akan ditambahkan ke antrean pratinjau</p>
      </div>
    );
  }
  return (
    <>
      <UploadCloud className="w-8 h-8 text-primary-500 mx-auto mb-2" />
      <p className="text-sm font-semibold text-gray-700">Klik atau seret foto (drag & drop) ke sini</p>
      <p className="text-xs text-gray-400 mt-0.5">JPG, PNG, WebP (Maksimal 1MB per file)</p>
    </>
  );
}

export interface UploadDropzoneProps {
  isFull: boolean;
  isUploading: boolean;
  onFilesSelected: (files: File[]) => void;
}

export function UploadDropzone({ isFull, isUploading, onFilesSelected }: UploadDropzoneProps): React.JSX.Element {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(Array.from(e.target.files));
      e.target.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isFull && !isUploading) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (!isFull && !isUploading && e.dataTransfer?.files?.length > 0) {
      onFilesSelected(Array.from(e.dataTransfer.files));
    }
  };

  const dropzoneClass = isFull || isUploading
    ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
    : isDragOver
    ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-300 cursor-copy scale-[1.01]'
    : 'border-primary-200 bg-primary-50/30 hover:bg-primary-50/60 cursor-pointer';

  return (
    <div
      onClick={() => !isFull && !isUploading && fileInputRef.current?.click()}
      onDragOver={handleDragOver}
      onDragEnter={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-xl p-6 text-center transition-all mb-6 ${dropzoneClass}`}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp"
        onChange={handleChange}
        disabled={isFull || isUploading}
        className="hidden"
        aria-label="Unggah foto properti"
      />
      <DropzoneContent isFull={isFull} isUploading={isUploading} isDragOver={isDragOver} />
    </div>
  );
}
