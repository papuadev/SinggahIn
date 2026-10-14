import { InvoicePdfData } from './invoice-pdf.service';
import { CLIENT_URL } from './mail-templates.util';

export interface BookingVoucherEmailData extends InvoicePdfData {
  bookingId?: string;
  pdfBuffer?: Buffer;
}

export interface EmergencyCancelEmailData {
  bookingCode: string;
  propertyName: string;
  cancellationReason: string;
  refundContact: string;
  isForceMajeure?: boolean;
}

function buildVoucherTable(d: BookingVoucherEmailData): string {
  const rp = `Rp ${d.totalPrice.toLocaleString('id-ID')}`;
  return `<table style="width:100%;border-collapse:collapse;margin:20px 0;font-size:14px;">
    <tr style="border-bottom:1px solid #f1f5f9;"><td style="padding:10px 0;color:#64748b;">Kode Reservasi</td><td style="padding:10px 0;text-align:right;font-weight:bold;font-family:monospace;color:#0284c7;">${d.bookingCode}</td></tr>
    <tr style="border-bottom:1px solid #f1f5f9;"><td style="padding:10px 0;color:#64748b;">Properti & Kamar</td><td style="padding:10px 0;text-align:right;font-weight:600;color:#0f172a;">${d.propertyName} (${d.roomName})</td></tr>
    <tr style="border-bottom:1px solid #f1f5f9;"><td style="padding:10px 0;color:#64748b;">Jadwal Menginap</td><td style="padding:10px 0;text-align:right;color:#0f172a;">${d.checkInDate} s/d ${d.checkOutDate}</td></tr>
    <tr style="border-bottom:1px solid #f1f5f9;"><td style="padding:10px 0;color:#64748b;">Kapasitas Tamu</td><td style="padding:10px 0;text-align:right;color:#0f172a;">${d.totalGuests} Orang</td></tr>
    <tr><td style="padding:12px 0;color:#0f172a;font-weight:bold;">Total Pembayaran</td><td style="padding:12px 0;text-align:right;font-weight:bold;color:#0284c7;font-size:16px;">${rp}</td></tr>
  </table>`;
}

function buildVoucherFooter(orderUrl: string): string {
  return `<div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:12px 16px;margin:18px 0;font-size:12px;color:#92400e;line-height:1.5;">
    <strong>Panduan Check-in:</strong> Waktu check-in standar mulai pukul 14:00 WIB dan check-out pukul 12:00 WIB. Tunjukkan identitas resmi serta invoice PDF saat tiba.
  </div>
  <div style="text-align:center;margin:24px 0;"><a href="${orderUrl}" style="background:#0284c7;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:bold;font-size:14px;display:inline-block;">Lihat Pesanan Saya</a></div>
  <p style="color:#94a3b8;font-size:11px;text-align:center;margin-top:24px;border-top:1px solid #f1f5f9;padding-top:14px;">Email otomatis SinggahIn.</p>`;
}

export function buildVoucherHtml(d: BookingVoucherEmailData): string {
  const name = d.guestName || 'Pelanggan Setia SinggahIn';
  const orderUrl = `${CLIENT_URL}/orders`;
  return `<div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px;border:1px solid #e2e8f0;border-radius:12px;background:#ffffff;">
    <div style="border-bottom:2px solid #0284c7;padding-bottom:14px;margin-bottom:18px;">
      <h1 style="color:#0284c7;margin:0;font-size:24px;">SinggahIn</h1>
      <span style="display:inline-block;margin-top:6px;background:#ecfdf5;color:#065f46;font-size:11px;font-weight:bold;padding:4px 10px;border-radius:20px;border:1px solid #a7f3d0;">PEMBAYARAN BERHASIL</span>
    </div>
    <p style="color:#0f172a;font-size:15px;margin:0 0 12px;">Halo <strong>${name}</strong>,</p>
    <p style="color:#475569;font-size:14px;line-height:1.6;margin:0;">Pembayaran reservasi Anda berhasil diverifikasi. Terlampir invoice PDF untuk kemudahan check-in.</p>
    ${buildVoucherTable(d)}
    ${buildVoucherFooter(orderUrl)}
  </div>`;
}

export function buildVoucherText(d: BookingVoucherEmailData): string {
  const rp = `Rp ${d.totalPrice.toLocaleString('id-ID')}`;
  return `VOUCHER RESERVASI SINGGAHIN\nHalo ${d.guestName || 'Pelanggan'},\nReservasi ${d.bookingCode} berhasil dikonfirmasi.\n- Kode: ${d.bookingCode}\n- Properti: ${d.propertyName} (${d.roomName})\n- Jadwal: ${d.checkInDate} s/d ${d.checkOutDate}\n- Tamu: ${d.totalGuests} Orang\n- Total: ${rp}\nInvoice PDF terlampir.\nTerima kasih!`;
}

export function buildEmergencyCancelHtml(d: EmergencyCancelEmailData): string {
  const fm = d.isForceMajeure ? '<p><strong>Status:</strong> Pembatalan Keadaan Kahar (Force Majeure)</p>' : '';
  return `<div style="font-family:sans-serif;max-width:600px;padding:20px;">
    <h2>Pemberitahuan Pembatalan Darurat</h2>${fm}
    <p>Pesanan <strong>${d.bookingCode}</strong> di <strong>${d.propertyName}</strong> telah dibatalkan oleh pihak pengelola.</p>
    <p><strong>Alasan:</strong> ${d.cancellationReason}</p>
    <p>Hubungi nomor berikut untuk penyelesaian refund: <strong>${d.refundContact}</strong></p>
  </div>`;
}
