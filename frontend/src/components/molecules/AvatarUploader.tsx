import React, { useRef, useState } from 'react';
import { Camera, User as UserIcon } from 'lucide-react';
import { Spinner } from '../atoms/Spinner';

export interface AvatarUploaderProps {
  currentAvatarUrl?: string | null;
  userName?: string | null;
  onUpload: (file: File) => Promise<string>;
  disabled?: boolean;
}

const MAX_SIZE_BYTES = 1 * 1024 * 1024; // 1MB (CON-004)

function getInitials(name?: string | null): string {
  if (!name) return 'U';
  return name.trim().charAt(0).toUpperCase();
}

export function AvatarUploader({
  currentAvatarUrl,
  userName,
  onUpload,
  disabled = false,
}: AvatarUploaderProps): React.JSX.Element {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const displayUrl = previewUrl || currentAvatarUrl;

  const performUpload = async (file: File) => {
    setPreviewUrl(URL.createObjectURL(file));
    setIsUploading(true);
    try {
      await onUpload(file);
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal mengunggah foto.');
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_SIZE_BYTES) {
      setErrorMessage('Ukuran file melebihi batas maksimal 1MB.');
      return;
    }
    setErrorMessage(null);
    performUpload(file);
  };


  const triggerSelect = () => {
    if (!disabled && !isUploading) fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative group">
        <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200 bg-gray-100 flex items-center justify-center text-gray-500 shadow-sm">
          {displayUrl ? (
            <img src={displayUrl} alt={userName || 'Avatar'} className="w-full h-full object-cover" />
          ) : userName ? (
            <span className="text-2xl font-bold text-gray-600">{getInitials(userName)}</span>
          ) : (
            <UserIcon className="w-12 h-12 text-gray-400" />
          )}
          {isUploading && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <Spinner size="md" className="text-white" />
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={triggerSelect}
          disabled={disabled || isUploading}
          aria-label="Ubah foto profil"
          className="absolute bottom-0 right-0 p-2 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 transition-colors"
        >
          <Camera className="w-4 h-4" />
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          className="hidden"
          onChange={handleFileSelected}
        />
      </div>

      <p className="text-xs text-gray-500">Maks. 1MB (.jpg, .png, .webp)</p>
      {errorMessage && <p className="text-xs text-red-600 font-medium">{errorMessage}</p>}
    </div>
  );
}
