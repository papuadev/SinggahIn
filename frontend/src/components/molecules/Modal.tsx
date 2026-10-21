import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
}

function ModalHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-between pb-3 border-b border-gray-100">
      <Dialog.Title className="text-lg font-bold text-gray-900">{title}</Dialog.Title>
      <Dialog.Close asChild>
        <button type="button" className="text-gray-400 hover:text-gray-600 p-1 rounded-lg focus:outline-none" aria-label="Tutup">
          <X className="w-5 h-5" />
        </button>
      </Dialog.Close>
    </div>
  );
}

function ModalBody({ description, children }: { description?: string; children: React.ReactNode }) {
  return (
    <>
      {description && <Dialog.Description className="text-sm text-gray-500 mt-2">{description}</Dialog.Description>}
      <div className="py-4">{children}</div>
    </>
  );
}

const ModalContent = React.forwardRef<HTMLDivElement, Omit<ModalProps, 'isOpen' | 'onClose'>>(
  function ModalContent({ title, description, children, footer, maxWidth }, ref) {
    return (
      <Dialog.Content ref={ref} className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full ${maxWidth} bg-white rounded-2xl p-6 shadow-2xl z-50 focus:outline-none max-h-[90vh] overflow-y-auto`}>
        <ModalHeader title={title} />
        <ModalBody description={description}>{children}</ModalBody>
        {footer && <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">{footer}</div>}
      </Dialog.Content>
    );
  }
);

export function Modal({ isOpen, onClose, maxWidth = 'max-w-md', ...props }: ModalProps): React.JSX.Element {
  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 transition-opacity" />
        <ModalContent maxWidth={maxWidth} {...props} />
      </Dialog.Portal>
    </Dialog.Root>
  );
}
