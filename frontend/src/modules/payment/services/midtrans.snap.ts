import { MidtransSnapResult } from '../payment.types';

declare global {
  interface Window {
    snap?: {
      pay: (
        token: string,
        callbacks: {
          onSuccess?: (result: MidtransSnapResult) => void;
          onPending?: (result: MidtransSnapResult) => void;
          onError?: (result: MidtransSnapResult) => void;
          onClose?: () => void;
        }
      ) => void;
    };
  }
}

export interface SnapCallbacks {
  onSuccess?: (result: MidtransSnapResult) => void;
  onPending?: (result: MidtransSnapResult) => void;
  onError?: (result: MidtransSnapResult) => void;
  onClose?: () => void;
}

const MIDTRANS_SNAP_URL = 'https://app.sandbox.midtrans.com/snap/snap.js';

function injectSnapScript(resolve: () => void, reject: (err: Error) => void): void {
  const clientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY || 'SB-Mid-client-default';
  const script = document.createElement('script');
  script.src = MIDTRANS_SNAP_URL;
  script.setAttribute('data-client-key', clientKey);
  script.async = true;
  script.onload = () => resolve();
  script.onerror = () => reject(new Error('Gagal memuat Midtrans Snap SDK'));
  document.body.appendChild(script);
}

function handleExistingScript(existing: Element, resolve: () => void): void {
  existing.addEventListener('load', () => resolve());
}

export function loadMidtransSnapScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.snap) return resolve();
    const existing = document.querySelector(`script[src="${MIDTRANS_SNAP_URL}"]`);
    if (existing) return handleExistingScript(existing, resolve);
    injectSnapScript(resolve, reject);
  });
}

export async function openMidtransSnap(snapToken: string, callbacks: SnapCallbacks): Promise<void> {
  await loadMidtransSnapScript();
  if (!window.snap) {
    throw new Error('Midtrans Snap tidak tersedia');
  }
  window.snap.pay(snapToken, callbacks);
}
