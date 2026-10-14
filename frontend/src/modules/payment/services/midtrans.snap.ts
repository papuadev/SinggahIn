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

export function isProductionEnv(redirectUrl?: string): boolean {
  if (redirectUrl) {
    if (redirectUrl.includes('sandbox.midtrans.com')) return false;
    if (redirectUrl.includes('app.midtrans.com')) return true;
  }
  return import.meta.env.VITE_MIDTRANS_IS_PRODUCTION === 'true';
}

export function getSnapScriptUrl(redirectUrl?: string): string {
  return isProductionEnv(redirectUrl)
    ? 'https://app.midtrans.com/snap/snap.js'
    : 'https://app.sandbox.midtrans.com/snap/snap.js';
}

function cleanupMismatchedScript(targetUrl: string): void {
  const scripts = document.querySelectorAll('script[src*="midtrans.com/snap/snap.js"]');
  scripts.forEach((el) => {
    if ((el as HTMLScriptElement).src !== targetUrl) {
      el.remove();
      delete (window as any).snap;
    }
  });
}

function injectSnapScript(url: string, resolve: () => void, reject: (err: Error) => void): void {
  const clientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY || 'SB-Mid-client-default';
  const script = document.createElement('script');
  script.src = url;
  script.setAttribute('data-client-key', clientKey);
  script.async = true;
  script.onload = () => resolve();
  script.onerror = () => reject(new Error('Gagal memuat Midtrans Snap SDK'));
  document.body.appendChild(script);
}

function handleExistingScript(existing: Element, resolve: () => void): void {
  existing.addEventListener('load', () => resolve());
}

export function loadMidtransSnapScript(redirectUrl?: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const snapUrl = getSnapScriptUrl(redirectUrl);
    cleanupMismatchedScript(snapUrl);
    if (window.snap) return resolve();
    const existing = document.querySelector(`script[src="${snapUrl}"]`);
    if (existing) return handleExistingScript(existing, resolve);
    injectSnapScript(snapUrl, resolve, reject);
  });
}

function validateSnapToken(snapToken: string): void {
  if (!snapToken || typeof snapToken !== 'string' || !snapToken.trim()) {
    throw new Error('Data token pembayaran tidak tersedia. Silakan muat ulang atau coba lagi.');
  }
}

export async function openMidtransSnap(
  snapToken: string,
  callbacks: SnapCallbacks,
  redirectUrl?: string
): Promise<void> {
  validateSnapToken(snapToken);
  await loadMidtransSnapScript(redirectUrl);
  if (!window.snap) {
    throw new Error('Midtrans Snap tidak tersedia');
  }
  window.snap.pay(snapToken, callbacks);
}
