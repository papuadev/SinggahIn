import crypto from 'crypto';
import { MidtransWebhookPayload } from './midtrans.schema';

export function timingSafeMatch(expected: string, actual?: string): boolean {
  if (!actual) return false;
  const expectedBuf = Buffer.from(expected, 'utf8');
  const actualBuf = Buffer.from(actual, 'utf8');
  if (expectedBuf.length !== actualBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, actualBuf);
}

const defaultServerKey = process.env.MIDTRANS_SERVER_KEY || 'SB-Mid-server-default';

export function verifyMidtransSignature(payload: MidtransWebhookPayload, customServerKey?: string): boolean {
  const key = customServerKey || process.env.MIDTRANS_SERVER_KEY || defaultServerKey;
  const raw = `${payload.order_id}${payload.status_code}${payload.gross_amount}${key}`;
  const hash = crypto.createHash('sha512').update(raw).digest('hex');
  return timingSafeMatch(hash, payload.signature_key);
}


export function parsePendingInfo(res: any) {
  if (!res || res.transaction_status !== 'pending') return null;
  const va = res.va_numbers?.[0] || (res.permata_va_number ? { bank: 'permata', va_number: res.permata_va_number } : null);
  const qrAction = res.actions?.find((a: any) => a.name?.includes('qr-code'));
  return {
    paymentType: res.payment_type,
    bank: va?.bank ? String(va.bank).toUpperCase() : undefined,
    vaNumber: va?.va_number,
    billKey: res.bill_key,
    billerCode: res.biller_code,
    qrUrl: qrAction?.url,
    expiryTime: res.expiry_time,
  };
}

export function extractBaseBookingCode(orderId: string): string {
  return orderId.split('_')[0];
}
