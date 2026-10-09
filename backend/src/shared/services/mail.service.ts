import nodemailer from 'nodemailer';

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const SMTP_FROM = process.env.SMTP_FROM || 'SinggahIn <no-reply@singgahin.com>';

export interface BookingVoucherEmailData {
  bookingCode: string; propertyName: string; roomName: string;
  checkInDate: string; checkOutDate: string; totalGuests: number; totalPrice: number;
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
  return `<div style="font-family: sans-serif; max-width: 600px; padding: 20px;">
    <h2>Verifikasi Akun SinggahIn Anda</h2>
    <p>Halo, terima kasih telah mendaftar di SinggahIn.</p>
    <p>Klik tombol di bawah ini untuk memverifikasi akun Anda. Tautan ini berlaku <strong>1 jam</strong>.</p>
    <p style="margin: 25px 0;"><a href="${link}" style="background-color: #0284c7; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Verifikasi Akun</a></p>
    <p>Atau buka tautan berikut: <br/><a href="${link}">${link}</a></p>
  </div>`;
}

export async function sendVerificationEmail(to: string, token: string): Promise<void> {
  const link = `${CLIENT_URL}/verify?token=${token}`;
  if (process.env.NODE_ENV === 'test' || !process.env.SMTP_USER) return;
  await getTransporter().sendMail({ from: SMTP_FROM, to, subject: 'Verifikasi Akun SinggahIn Anda (Berlaku 1 Jam)', html: buildVerificationHtml(link) });
}

function buildVoucherHtml(d: BookingVoucherEmailData): string {
  return `<div style="font-family:sans-serif;max-width:600px;padding:20px;">
    <h2>Voucher Reservasi SinggahIn</h2>
    <p>Pembayaran Anda telah dikonfirmasi. Berikut detail reservasi Anda:</p>
    <ul>
      <li><strong>Kode:</strong> ${d.bookingCode}</li>
      <li><strong>Properti:</strong> ${d.propertyName} (${d.roomName})</li>
      <li><strong>Jadwal:</strong> ${d.checkInDate} s/d ${d.checkOutDate}</li>
      <li><strong>Tamu:</strong> ${d.totalGuests} orang</li>
      <li><strong>Total:</strong> Rp ${d.totalPrice.toLocaleString('id-ID')}</li>
    </ul>
  </div>`;
}

export async function sendBookingVoucherEmail(to: string, data: BookingVoucherEmailData): Promise<void> {
  if (process.env.NODE_ENV === 'test' || !process.env.SMTP_USER) return;
  await getTransporter().sendMail({
    from: SMTP_FROM, to, subject: `Voucher Reservasi SinggahIn - ${data.bookingCode}`, html: buildVoucherHtml(data),
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
