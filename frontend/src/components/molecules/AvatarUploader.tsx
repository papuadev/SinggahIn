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
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

function getInitials(name?: string | null): string {
  if (!name) return 'U';
  return name.trim().charAt(0).toUpperCase();
}

function AvatarVisual({ displayUrl, userName }: { displayUrl?: string | null; userName?: string | null }): React.JSX.Element {
  if (displayUrl) {
    return <img src={displayUrl} alt={userName || 'Avatar'} className="w-full h-full object-cover" />;
  }
  if (userName) {
    return <span className="text-2xl font-bold text-gray-600">{getInitials(userName)}</span>;
  }
  return <UserIcon className="w-12 h-12 text-gray-400" />;
}

function validateAvatarFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) return 'Format file harus berupa JPG, PNG, GIF, atau WebP.';
  if (file.size > MAX_SIZE_BYTES) return 'Ukuran file melebihi batas maksimal 1MB.';
  return null;
}

async function executeUpload(
  file: File,
  onUpload: (file: File) => Promise<string>,
  setPreview: (url: string | null) => void,
  setErr: (msg: string | null) => void,
  setLoading: (l: boolean) => void
) {
  const objectUrl = URL.createObjectURL(file);
  setPreview(objectUrl);
  setLoading(true);
  setErr(null);
  try { await onUpload(file); setPreview(null); }
  catch (err: any) { setErr(err.message || 'Gagal mengunggah foto.'); setPreview(null); }
  finally { setLoading(false); URL.revokeObjectURL(objectUrl); }
}

function useAvatarUpload(onUpload: (file: File) => Promise<string>) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const err = validateAvatarFile(file);
    if (err) return setErrorMessage(err);
    executeUpload(file, onUpload, setPreviewUrl, setErrorMessage, setIsUploading);
    e.target.value = '';
  };
  return { isUploading, previewUrl, errorMessage, handleFileSelected };
}

function UploadButton({ onClick, disabled }: { onClick: () => void; disabled: boolean }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} aria-label="Ubah foto profil"
      className="absolute bottom-0 right-0 p-2 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 transition-colors">
      <Camera className="w-4 h-4" />
    </button>
  );
}

function AvatarFrame({ displayUrl, userName, isUploading, triggerSelect, disabled, fileInputRef, onFileChange }: any) {
  return (
    <div className="relative group">
      <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200 bg-gray-100 flex items-center justify-center text-gray-500 shadow-sm">
        <AvatarVisual displayUrl={displayUrl} userName={userName} />
        {isUploading && <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><Spinner size="md" className="text-white" /></div>}
      </div>
      <UploadButton onClick={triggerSelect} disabled={disabled || isUploading} />
      <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" className="hidden" onChange={onFileChange} />
    </div>
  );
}

export function AvatarUploader({ currentAvatarUrl, userName, onUpload, disabled = false }: AvatarUploaderProps): React.JSX.Element {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const u = useAvatarUpload(onUpload);
  const triggerSelect = () => { if (!disabled && !u.isUploading) fileInputRef.current?.click(); };
  return (
    <div className="flex flex-col items-center gap-2">
      <AvatarFrame displayUrl={u.previewUrl || currentAvatarUrl} userName={userName} isUploading={u.isUploading} triggerSelect={triggerSelect} disabled={disabled} fileInputRef={fileInputRef} onFileChange={u.handleFileSelected} />
      <p className="text-xs text-gray-500">Maks. 1MB (.jpg, .png, .webp)</p>
      {u.errorMessage && <p className="text-xs text-red-600 font-medium">{u.errorMessage}</p>}
    </div>
  );
}
