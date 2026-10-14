import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  isProductionEnv,
  getSnapScriptUrl,
  loadMidtransSnapScript,
  openMidtransSnap,
} from '../services/midtrans.snap';

describe('midtrans.snap', () => {
  beforeEach(() => {
    document.querySelectorAll('script[src*="midtrans.com"]').forEach((el) => el.remove());
    delete (window as any).snap;
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('isProductionEnv & getSnapScriptUrl', () => {
    it('detects sandbox from sandbox redirectUrl regardless of clientKey format', () => {
      const sandboxUrl = 'https://app.sandbox.midtrans.com/snap/v4/redirection/token-123';
      expect(isProductionEnv(sandboxUrl)).toBe(false);
      expect(getSnapScriptUrl(sandboxUrl)).toBe('https://app.sandbox.midtrans.com/snap/snap.js');
    });

    it('detects production from production redirectUrl', () => {
      const prodUrl = 'https://app.midtrans.com/snap/v4/redirection/token-123';
      expect(isProductionEnv(prodUrl)).toBe(true);
      expect(getSnapScriptUrl(prodUrl)).toBe('https://app.midtrans.com/snap/snap.js');
    });

    it('defaults to sandbox when VITE_MIDTRANS_IS_PRODUCTION is not true', () => {
      vi.stubEnv('VITE_MIDTRANS_IS_PRODUCTION', 'false');
      expect(isProductionEnv()).toBe(false);
      expect(getSnapScriptUrl()).toBe('https://app.sandbox.midtrans.com/snap/snap.js');
    });

    it('detects production when VITE_MIDTRANS_IS_PRODUCTION is true', () => {
      vi.stubEnv('VITE_MIDTRANS_IS_PRODUCTION', 'true');
      expect(isProductionEnv()).toBe(true);
      expect(getSnapScriptUrl()).toBe('https://app.midtrans.com/snap/snap.js');
    });
  });

  describe('openMidtransSnap', () => {
    it('throws error when snapToken is empty string or whitespace', async () => {
      await expect(openMidtransSnap('', {})).rejects.toThrow('Data token pembayaran tidak tersedia');
      await expect(openMidtransSnap('   ', {})).rejects.toThrow('Data token pembayaran tidak tersedia');
    });

    it('throws error if snap is not available after script loading', async () => {
      vi.spyOn(document, 'createElement').mockReturnValue({
        setAttribute: vi.fn(),
        onload: null,
        onerror: null,
      } as any);
      vi.spyOn(document.body, 'appendChild').mockImplementation((el: any) => {
        if (el.onload) el.onload();
        return el;
      });

      await expect(openMidtransSnap('valid-tok', {})).rejects.toThrow('Midtrans Snap tidak tersedia');
    });

    it('calls window.snap.pay with valid token and callbacks', async () => {
      const mockPay = vi.fn();
      (window as any).snap = { pay: mockPay };

      const callbacks = { onSuccess: vi.fn() };
      await openMidtransSnap('valid-tok-123', callbacks);

      expect(mockPay).toHaveBeenCalledWith('valid-tok-123', callbacks);
    });
  });

  describe('loadMidtransSnapScript', () => {
    it('resolves immediately if matching window.snap is already available', async () => {
      (window as any).snap = { pay: vi.fn() };
      await expect(loadMidtransSnapScript()).resolves.toBeUndefined();
    });

    it('cleans up mismatched script when environment changes', async () => {
      const prodScript = document.createElement('script');
      prodScript.src = 'https://app.midtrans.com/snap/snap.js';
      document.body.appendChild(prodScript);
      (window as any).snap = { pay: vi.fn() };

      const sandboxUrl = 'https://app.sandbox.midtrans.com/snap/v4/redirection/tok';
      const promise = loadMidtransSnapScript(sandboxUrl);
      const injected = document.querySelector('script[src="https://app.sandbox.midtrans.com/snap/snap.js"]');
      expect(document.querySelector('script[src="https://app.midtrans.com/snap/snap.js"]')).toBeNull();
      if (injected) (injected as any).onload();
      await promise;
    });
  });
});
