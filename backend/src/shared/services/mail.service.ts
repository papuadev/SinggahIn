import nodemailer from 'nodemailer';
import { generateInvoicePdf, InvoicePdfData } from './invoice-pdf.service';

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const SMTP_FROM = process.env.SMTP_FROM || 'SinggahIn <no-reply@singgahin.com>';

export interface BookingVoucherEmailData extends InvoicePdfData {
  bookingId?: string;
  pdfBuffer?: Buffer;
}

export interface EmergencyCancelEmailData {
  bookingCode: string; propertyName: string; cancellationReason: string; refundContact: string;
  isForceMajeure?: boolean;
}

function getTransporter(): nodemailer.Transporter {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: { user: process.env.SMTP_USER || '', pass: process.env.SMTP_PASS || '' },
  });
}

function buildVerificationHtml(link: string): string {
  return `<div style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;max-width:600px;margin:auto;padding:24px;border:1px solid #e2e8f0;border-radius:12px;">
    <h2 style="color:#0284c7;margin-top:0;">Verifikasi Akun SinggahIn Anda</h2>
    <p style="color:#334155;">Halo, terima kasih telah mendaftar di SinggahIn.</p>
    <p style="color:#334155;">Klik tombol di bawah untuk memverifikasi akun Anda. Tautan berlaku <strong>1 jam</strong>.</p>
    <p style="margin:24px 0;"><a href="${link}" style="background-color:#0284c7;color:#fff;padding:12px 24px;text-decoration:none;border-radius:8px;font-weight:bold;display:inline-block;">Aktivasi Akun Saya</a></p>
    <p style="color:#64748b;font-size:12px;">Atau buka tautan: <br/><a href="${link}" style="color:#0284c7;">${link}</a></p>
  </div>`;
}

export async function sendVerificationEmail(to: string, token: string): Promise<void> {
  const link = `${CLIENT_URL}/verify?token=${token}`;
  if (process.env.NODE_ENV === 'test' || !process.env.SMTP_USER) return;
  await getTransporter().sendMail({ from: SMTP_FROM, to, subject: 'Verifikasi Akun SinggahIn Anda (Berlaku 1 Jam)', html: buildVerificationHtml(link) });
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

function buildVoucherHtml(d: BookingVoucherEmailData): string {
  const name = d.guestName || 'Pelanggan Setia SinggahIn';
  const orderUrl = `${CLIENT_URL}/orders`;
  return `<div style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;max-width:600px;margin:auto;padding:24px;border:1px solid #e2e8f0;border-radius:12px;background:#ffffff;">
    <div style="border-bottom:2px solid #0284c7;padding-bottom:14px;margin-bottom:18px;">
      <h1 style="color:#0284c7;margin:0;font-size:24px;">SinggahIn</h1>
      <span style="display:inline-block;margin-top:6px;background:#ecfdf5;color:#065f46;font-size:11px;font-weight:bold;padding:4px 10px;border-radius:20px;border:1px solid #a7f3d0;">PEMBAYARAN BERHASIL</span>
    </div>
    <p style="color:#0f172a;font-size:15px;margin:0 0 12px;">Halo <strong>${name}</strong>,</p>
    <p style="color:#475569;font-size:14px;line-height:1.6;margin:0;">Pembayaran reservasi Anda telah berhasil diverifikasi. Terlampir invoice resmi dalam format PDF pada email ini untuk kemudahan proses check-in Anda.</p>
    ${buildVoucherTable(d)}
    <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:12px 16px;margin:18px 0;font-size:12px;color:#92400e;line-height:1.5;">
      <strong>Panduan Check-in:</strong> Waktu check-in standar mulai pukul 14:00 WIB dan check-out pukul 12:00 WIB. Tunjukkan identitas resmi (KTP/Paspor) serta invoice PDF terlampir saat tiba.
    </div>
    <div style="text-align:center;margin:24px 0;"><a href="${orderUrl}" style="background:#0284c7;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:bold;font-size:14px;display:inline-block;">Lihat Pesanan Saya</a></div>
    <p style="color:#94a3b8;font-size:11px;text-align:center;margin-top:24px;border-top:1px solid #f1f5f9;padding-top:14px;">Email ini dikirim otomatis oleh SinggahIn. Hak cipta dilindungi.</p>
  </div>`;
}

function buildVoucherText(d: BookingVoucherEmailData): string {
  const rp = `Rp ${d.totalPrice.toLocaleString('id-ID')}`;
  return `VOUCHER & INVOICE RESERVASI SINGGAHIN\n\n` +
    `Halo ${d.guestName || 'Pelanggan'},\nPembayaran Anda untuk reservasi ${d.bookingCode} telah berhasil dikonfirmasi.\n\n` +
    `Detail Reservasi:\n` +
    `- Kode Booking: ${d.bookingCode}\n` +
    `- Properti: ${d.propertyName} (${d.roomName})\n` +
    `- Jadwal: ${d.checkInDate} s/d ${d.checkOutDate}\n` +
    `- Tamu: ${d.totalGuests} Orang\n` +
    `- Total Biaya: ${rp}\n\n` +
    `Invoice resmi berformat PDF telah dilampirkan pada email ini.\n` +
    `Panduan Check-in: Check-in mulai 14:00 WIB, Check-out 12:00 WIB.\n` +
    `Terima kasih telah memilih SinggahIn!`;
}

export async function sendBookingVoucherEmail(to: string, data: BookingVoucherEmailData): Promise<void> {
  if (process.env.NODE_ENV === 'test' || !process.env.SMTP_USER) return;
  let pdf = data.pdfBuffer;
  if (!pdf) {
    try { pdf = await generateInvoicePdf(data); } catch (_err) {}
  }
  const attachments = pdf ? [{ filename: `Invoice-SinggahIn-${data.bookingCode}.pdf`, content: pdf, contentType: 'application/pdf' }] : [];
  await getTransporter().sendMail({
    from: SMTP_FROM, to, subject: `Bukti Pembayaran & Voucher Reservasi - ${data.bookingCode}`,
    text: buildVoucherText(data), html: buildVoucherHtml(data), attachments,
  });
}

function buildEmergencyCancelHtml(d: EmergencyCancelEmailData): string {
  const fm = d.isForceMajeure ? '<p><strong>Status:</strong> Pembatalan Keadaan Kahar (Force Majeure)</p>' : '';
  return `<div style="font-family:sans-serif;max-width:600px;padding:20px;">
    <h2>Pemberitahuan Pembatalan Darurat</h2>${fm}
    <p>Pesanan <strong>${d.bookingCode}</strong> di <strong>${d.propertyName}</strong> telah dibatalkan oleh pihak pengelola.</p>
    <p><strong>Alasan:</strong> ${d.cancellationReason}</p>
    <p>Hubungi nomor berikut untuk penyelesaian refund: <strong>${d.refundContact}</strong></p>
  </div>`;
}

export async function sendEmergencyCancellationEmail(to: string, data: EmergencyCancelEmailData): Promise<void> {
  if (process.env.NODE_ENV === 'test' || !process.env.SMTP_USER) return;
  await getTransporter().sendMail({
    from: SMTP_FROM, to, subject: `Pembatalan Darurat Pesanan - ${data.bookingCode}`, html: buildEmergencyCancelHtml(data),
  });
}
