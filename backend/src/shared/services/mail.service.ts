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

interface EmailTemplateOptions {
  badgeText: string;
  badgeBgColor?: string;
  badgeTextColor?: string;
  heading: string;
  greeting?: string;
  bodyParagraphs: string[];
  actionUrl: string;
  actionText: string;
  noticeBox?: {
    type: 'warning' | 'info';
    text: string;
  };
  disclaimerText: string;
}

function buildBrandedEmailHtml(opts: EmailTemplateOptions): string {
  const currentYear = new Date().getFullYear();
  const noticeBg = opts.noticeBox?.type === 'warning' ? '#fffbeb' : '#f0f9ff';
  const noticeBorder = opts.noticeBox?.type === 'warning' ? '#fde68a' : '#bae6fd';
  const noticeText = opts.noticeBox?.type === 'warning' ? '#92400e' : '#0369a1';

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${opts.heading}</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;color:#1e293b;">
  <div style="background-color:#f1f5f9;padding:36px 16px;">
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:560px;margin:0 auto;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 10px 25px -5px rgba(0,0,0,0.05),0 8px 10px -6px rgba(0,0,0,0.05);border:1px solid #e2e8f0;">
      <!-- Header Banner -->
      <tr>
        <td style="background:linear-gradient(135deg, #0284c7 0%, #1e40af 100%);padding:32px 28px;text-align:center;">
          <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:900;letter-spacing:-0.5px;line-height:1.2;">SinggahIn</h1>
          <p style="margin:6px 0 0;color:#e0f2fe;font-size:13px;font-weight:500;letter-spacing:0.3px;">Tempat Singgah Terbaik di Seluruh Indonesia</p>
        </td>
      </tr>

      <!-- Content Area -->
      <tr>
        <td style="padding:32px 28px 28px;">
          <!-- Badge -->
          <div style="margin-bottom:16px;">
            <span style="display:inline-block;background-color:${opts.badgeBgColor || '#e0f2fe'};color:${opts.badgeTextColor || '#0369a1'};font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;padding:4px 12px;border-radius:20px;">
              ${opts.badgeText}
            </span>
          </div>

          <!-- Heading -->
          <h2 style="margin:0 0 16px;color:#0f172a;font-size:20px;font-weight:800;line-height:1.3;">
            ${opts.heading}
          </h2>

          ${opts.greeting ? `<p style="margin:0 0 12px;color:#334155;font-size:14px;font-weight:600;">${opts.greeting}</p>` : ''}

          <!-- Paragraphs -->
          ${opts.bodyParagraphs.map(p => `<p style="margin:0 0 14px;color:#475569;font-size:14px;line-height:1.6;">${p}</p>`).join('')}

          <!-- Action Button -->
          <div style="text-align:center;margin:28px 0 24px;">
            <a href="${opts.actionUrl}" style="background-color:#0284c7;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:700;display:inline-block;box-shadow:0 4px 6px -1px rgba(2,132,199,0.3);letter-spacing:0.3px;">
              ${opts.actionText}
            </a>
          </div>

          <!-- Notice Box -->
          ${opts.noticeBox ? `
          <div style="background-color:${noticeBg};border:1px solid ${noticeBorder};border-radius:8px;padding:12px 16px;margin:20px 0;font-size:12px;color:${noticeText};line-height:1.5;">
            ${opts.noticeBox.text}
          </div>
          ` : ''}

          <!-- Alternative Link -->
          <div style="border-top:1px dashed #e2e8f0;padding-top:16px;margin-top:20px;">
            <p style="margin:0 0 4px;color:#64748b;font-size:11px;">Jika tombol di atas tidak berfungsi, salin dan buka tautan berikut di browser Anda:</p>
            <p style="margin:0;font-size:11px;word-break:break-all;">
              <a href="${opts.actionUrl}" style="color:#0284c7;text-decoration:underline;">${opts.actionUrl}</a>
            </p>
          </div>

          <!-- Disclaimer -->
          <p style="margin:20px 0 0;color:#94a3b8;font-size:11px;line-height:1.5;">
            ${opts.disclaimerText}
          </p>
        </td>
      </tr>

      <!-- Footer Strip -->
      <tr>
        <td style="background-color:#f8fafc;padding:20px 28px;text-align:center;border-top:1px solid #f1f5f9;font-size:11px;color:#94a3b8;line-height:1.6;">
          <p style="margin:0 0 4px;color:#64748b;">Butuh bantuan seputar akun Anda? Hubungi <a href="mailto:support@singgahin.biz.id" style="color:#0284c7;text-decoration:none;font-weight:600;">support@singgahin.biz.id</a></p>
          <p style="margin:0;">&copy; ${currentYear} SinggahIn Indonesia. Seluruh hak cipta dilindungi undang-undang.</p>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>`;
}

export function buildVerificationHtml(link: string): string {
  return buildBrandedEmailHtml({
    badgeText: 'Aktivasi Akun Baru',
    badgeBgColor: '#e0f2fe',
    badgeTextColor: '#0369a1',
    heading: 'Verifikasi Akun SinggahIn Anda 🎉',
    greeting: 'Halo, Calon Pengguna SinggahIn!',
    bodyParagraphs: [
      'Terima kasih telah mendaftar di SinggahIn. Kami sangat senang menyambut Anda di komunitas perjalanan dan penginapan terkurasi se-Indonesia.',
      'Satu langkah lagi untuk menyelesaikan pendaftaran dan mulai memesan kamar atau mengelola properti Anda. Silakan klik tombol di bawah untuk mengaktifkan akun:',
    ],
    actionUrl: link,
    actionText: 'Aktivasi Akun Saya',
    noticeBox: {
      type: 'warning',
      text: '<strong>Penting:</strong> Tautan aktivasi ini hanya berlaku selama <strong>1 jam</strong> demi keamanan akun Anda. Jika kedaluwarsa, silakan ajukan pendaftaran ulang.',
    },
    disclaimerText: 'Jika Anda tidak merasa mendaftar di SinggahIn, abaikan email ini dengan aman.',
  });
}

export async function sendVerificationEmail(to: string, token: string): Promise<void> {
  const link = `${CLIENT_URL}/verify?token=${token}`;
  if (process.env.NODE_ENV === 'test' || !process.env.SMTP_USER) return;
  await getTransporter().sendMail({
    from: SMTP_FROM,
    to,
    subject: 'Verifikasi Akun SinggahIn Anda (Berlaku 1 Jam)',
    html: buildVerificationHtml(link),
  });
}

export function buildPasswordResetHtml(link: string): string {
  return buildBrandedEmailHtml({
    badgeText: 'Keamanan Akun',
    badgeBgColor: '#fef3c7',
    badgeTextColor: '#92400e',
    heading: 'Permintaan Reset Password Akun 🔒',
    greeting: 'Halo Pengguna SinggahIn,',
    bodyParagraphs: [
      'Kami menerima permintaan untuk mereset kata sandi (password) akun SinggahIn yang terhubung dengan alamat email ini.',
      'Jika Anda yang meminta reset password, silakan klik tombol di bawah untuk membuat kata sandi baru yang aman:',
    ],
    actionUrl: link,
    actionText: 'Reset Password Saya',
    noticeBox: {
      type: 'warning',
      text: '<strong>Pemberitahuan Keamanan:</strong> Tautan ini hanya berlaku selama <strong>1 jam</strong> dan hanya dapat digunakan 1 kali.',
    },
    disclaimerText: 'Jika Anda tidak meminta perubahan kata sandi ini, abaikan email ini. Kata sandi akun Anda akan tetap aman dan tidak berubah.',
  });
}

export async function sendPasswordResetEmail(to: string, token: string): Promise<void> {
  const link = `${CLIENT_URL}/reset-password?token=${token}`;
  if (process.env.NODE_ENV === 'test' || !process.env.SMTP_USER) return;
  await getTransporter().sendMail({
    from: SMTP_FROM,
    to,
    subject: 'Permintaan Reset Password Akun SinggahIn (Berlaku 1 Jam)',
    html: buildPasswordResetHtml(link),
  });
}

export function buildEmailChangeHtml(link: string): string {
  return buildBrandedEmailHtml({
    badgeText: 'Pembaruan Email',
    badgeBgColor: '#ecfdf5',
    badgeTextColor: '#065f46',
    heading: 'Konfirmasi Alamat Email Baru Anda ✉️',
    greeting: 'Halo,',
    bodyParagraphs: [
      'Kami menerima permintaan untuk memperbarui alamat email akun SinggahIn Anda ke alamat email ini.',
      'Untuk memastikan bahwa Anda adalah pemilik sah dari email ini dan mengaktifkannya, silakan klik tombol konfirmasi di bawah:',
    ],
    actionUrl: link,
    actionText: 'Konfirmasi & Aktifkan Email Baru',
    noticeBox: {
      type: 'info',
      text: '<strong>Informasi:</strong> Tautan konfirmasi ini berlaku selama <strong>1 jam</strong>. Alamat email akun Anda belum akan berubah sampai Anda mengonfirmasi tautan ini.',
    },
    disclaimerText: 'Jika Anda tidak mengajukan permohonan perubahan email ini, abaikan email ini dan akun Anda akan tetap menggunakan email sebelumnya.',
  });
}

export async function sendEmailChangeVerificationEmail(to: string, token: string): Promise<void> {
  const link = `${CLIENT_URL}/verify-email-change?token=${token}`;
  if (process.env.NODE_ENV === 'test' || !process.env.SMTP_USER) return;
  await getTransporter().sendMail({
    from: SMTP_FROM,
    to,
    subject: 'Konfirmasi Perubahan Alamat Email SinggahIn (Berlaku 1 Jam)',
    html: buildEmailChangeHtml(link),
  });
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
    <strong>Panduan Check-in:</strong> Waktu check-in standar mulai pukul 14:00 WIB dan check-out pukul 12:00 WIB. Tunjukkan identitas resmi (KTP/Paspor) serta invoice PDF terlampir saat tiba.
  </div>
  <div style="text-align:center;margin:24px 0;"><a href="${orderUrl}" style="background:#0284c7;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:bold;font-size:14px;display:inline-block;">Lihat Pesanan Saya</a></div>
  <p style="color:#94a3b8;font-size:11px;text-align:center;margin-top:24px;border-top:1px solid #f1f5f9;padding-top:14px;">Email ini dikirim otomatis oleh SinggahIn. Hak cipta dilindungi.</p>`;
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
    ${buildVoucherFooter(orderUrl)}
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
