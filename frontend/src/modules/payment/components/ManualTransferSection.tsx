import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle2, AlertCircle, ZoomIn, RefreshCw, Trash2 } from 'lucide-react';
import { Button } from '../../../components/atoms/Button';
import { Modal } from '../../../components/molecules/Modal';

export interface ManualTransferSectionProps {
  isUploading: boolean;
  uploadError: string | null;
  uploadSuccess?: string | null;
  onUpload: (file: File) => void;
  existingProofUrl?: string | null;
}

function BankAccountInfo(): React.JSX.Element {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-2">
      <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Rekening Tujuan Transfer</p>
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm font-bold text-gray-900">Bank Central Asia (BCA)</p>
          <p className="font-mono text-base font-bold text-primary-600">8820 1928 3810</p>
        </div>
        <p className="text-xs text-gray-500 text-right">a.n. PT SinggahIn Indonesia</p>
      </div>
    </div>
  );
}

function ProofPreview({ preview, onClear }: { preview: string; onClear: () => void }) {
  return (
    <div className="relative border rounded-xl overflow-hidden bg-gray-100 max-h-48 flex items-center justify-center">
      <img src={preview} alt="Pratinjau Bukti" className="object-contain max-h-48 w-full" />
      <button
        type="button"
        onClick={onClear}
        className="absolute top-2 right-2 bg-rose-600 hover:bg-rose-700 text-white p-2 rounded-lg shadow-md transition-colors cursor-pointer"
        title="Hapus Bukti Transfer"
        aria-label="Hapus Bukti Transfer"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

function DropzonePrompt({ onClick, onDropFile }: { onClick: () => void; onDropFile: (f: File) => void }) {
  const [isDrag, setIsDrag] = useState(false);
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDrag(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onDropFile(file);
  };
  const cls = isDrag ? 'border-primary-600 bg-primary-50 ring-2 ring-primary-200' : 'border-gray-300 hover:border-primary-500 bg-gray-50/50';
  return (
    <div onClick={onClick} onDragOver={(e) => { e.preventDefault(); setIsDrag(true); }} onDragLeave={() => setIsDrag(false)} onDrop={onDrop} className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${cls}`}>
      <UploadCloud className={`w-8 h-8 mx-auto mb-2 transition-colors ${isDrag ? 'text-primary-600' : 'text-gray-400'}`} />
      <p className="text-sm font-medium text-gray-700">Pilih atau Seret Foto Bukti Transfer</p>
      <p className="text-xs text-gray-400 mt-1">Format JPG atau PNG (Maksimal 1MB)</p>
    </div>
  );
}

function ProofSuccessToast({ message }: { message: string }) {
  return (
    <div role="status" aria-live="polite" className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex flex-wrap items-center justify-between gap-2 shadow-xs">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
        <span className="font-semibold">{message}</span>
      </div>
      <span className="text-[11px] text-emerald-700 font-medium">Mengarahkan ke pesanan dalam 3 detik...</span>
    </div>
  );
}

function ExistingProofHeader() {
  return (
    <div className="flex items-center gap-2 text-gray-800 text-sm font-semibold">
      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
      <span>Bukti transfer berhasil diunggah (Menunggu konfirmasi tenant)</span>
    </div>
  );
}

function ExistingProofImage({ url, onOpen }: { url: string; onOpen: () => void }) {
  const onKey = (e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') onOpen(); };
  return (
    <div onClick={onOpen} onKeyDown={onKey} role="button" tabIndex={0} title="Klik untuk memperbesar gambar"
      className="group relative border border-gray-200 rounded-xl overflow-hidden bg-white max-h-64 flex items-center justify-center p-2 shadow-2xs cursor-pointer hover:border-primary-400 transition-all">
      <img src={url} alt="Bukti Pembayaran" className="object-contain max-h-60 w-full rounded-lg" />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors flex items-center justify-center pointer-events-none">
        <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/75 text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
          <ZoomIn className="w-3.5 h-3.5" /> Perbesar
        </span>
      </div>
    </div>
  );
}

function ExistingProofActions({ onReupload }: { onReupload: () => void }) {
  return (
    <div className="flex items-center justify-between pt-1 text-xs">
      <span className="text-gray-400">Klik gambar untuk memperbesar</span>
      <Button variant="ghost" size="sm" onClick={onReupload} leftIcon={<RefreshCw className="w-3 h-3" />}>
        Unggah Ulang
      </Button>
    </div>
  );
}

function ProofImageModal({ url, isOpen, onClose }: { url: string; isOpen: boolean; onClose: () => void }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Bukti Pembayaran">
      <div className="flex items-center justify-center bg-gray-100 rounded-xl overflow-hidden p-2">
        <img src={url} alt="Bukti Pembayaran Penuh" className="max-h-[70vh] w-auto object-contain rounded-lg" />
      </div>
    </Modal>
  );
}

function ExistingProofCard({ url, onReupload }: { url: string; onReupload: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-3">
      <ExistingProofHeader />
      <ExistingProofImage url={url} onOpen={() => setIsOpen(true)} />
      <ExistingProofActions onReupload={onReupload} />
      <ProofImageModal url={url} isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
}

function useFileSelect() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const processFile = (f: File) => { setSelectedFile(f); setPreview(URL.createObjectURL(f)); };
  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) processFile(f);
  };
  const clearSelection = () => { setSelectedFile(null); setPreview(null); };
  return { selectedFile, preview, fileInputRef, handleSelect, processFile, clearSelection };
}

function UploadActions({ isUploading, uploadError, selectedFile, onUpload }: any) {
  return (
    <>
      {uploadError && <p className="text-xs text-rose-600 flex items-center gap-1"><AlertCircle className="w-4 h-4" /> {uploadError}</p>}
      {selectedFile && <Button variant="primary" className="w-full" isLoading={isUploading} onClick={() => onUpload(selectedFile)}>Kirim Bukti Pembayaran</Button>}
    </>
  );
}

function UploadFormSection({ f, props, onCancelReupload }: any) {
  return (
    <div className="space-y-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-gray-900 text-lg">Instruksi Transfer Bank</h3>
        {onCancelReupload && <button type="button" onClick={onCancelReupload} className="text-xs text-gray-500 hover:underline">Batal</button>}
      </div>
      <BankAccountInfo />
      <input type="file" ref={f.fileInputRef} onChange={f.handleSelect} accept="image/png,image/jpeg,image/jpg,image/webp" className="hidden" />
      {f.preview ? <ProofPreview preview={f.preview} onClear={f.clearSelection} />
        : <DropzonePrompt onClick={() => f.fileInputRef.current?.click()} onDropFile={f.processFile} />}
      <UploadActions isUploading={props.isUploading} uploadError={props.uploadError} selectedFile={f.selectedFile} onUpload={props.onUpload} />
    </div>
  );
}

function ExistingProofSection({ url, onReupload }: { url: string; onReupload: () => void }) {
  return (
    <div className="space-y-4">
      <BankAccountInfo />
      <ExistingProofCard url={url} onReupload={onReupload} />
    </div>
  );
}

export function ManualTransferSection(props: ManualTransferSectionProps): React.JSX.Element {
  const fileSelect = useFileSelect();
  const [isReuploading, setIsReuploading] = useState(false);
  const showExisting = Boolean(props.existingProofUrl) && !isReuploading;
  const onCancel = props.existingProofUrl ? () => setIsReuploading(false) : undefined;
  return (
    <div className="space-y-4">
      {props.uploadSuccess && <ProofSuccessToast message={props.uploadSuccess} />}
      {showExisting ? <ExistingProofSection url={props.existingProofUrl!} onReupload={() => setIsReuploading(true)} />
        : <UploadFormSection f={fileSelect} props={props} onCancelReupload={onCancel} />}
    </div>
  );
}
