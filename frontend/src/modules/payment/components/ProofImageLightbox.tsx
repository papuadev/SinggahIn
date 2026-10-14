import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';

function LightboxCloseBtn({ onClose }: { onClose: () => void }) {
  return (
    <button
      type="button" onClick={onClose} aria-label="Tutup pratinjau bukti"
      className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2.5 text-white/80 hover:text-white bg-black/60 hover:bg-black/90 rounded-full transition-colors cursor-pointer z-20"
    >
      <X className="w-6 h-6" />
    </button>
  );
}

function LightboxImage({ src }: { src: string }) {
  return (
    <img
      src={src} alt="Bukti Transfer Pembayaran" onClick={(e) => e.stopPropagation()}
      className="max-h-[88vh] max-w-[92vw] object-contain rounded-xl shadow-2xl"
    />
  );
}

export function ProofImageLightbox({ isOpen, onClose, src }: { isOpen: boolean; onClose: () => void; src?: string | null }) {
  if (!isOpen || !src) return null;
  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100] transition-opacity" />
        <Dialog.Content className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 focus:outline-none select-none">
          <Dialog.Title className="sr-only">Bukti Transfer Ukuran Penuh</Dialog.Title>
          <LightboxCloseBtn onClose={onClose} />
          <LightboxImage src={src} />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
