import nodemailer from 'nodemailer';
import { generateInvoicePdf } from './invoice-pdf.service';
import {
  CLIENT_URL,
  buildVerificationHtml,
  buildPasswordResetHtml,
  buildEmailChangeHtml,
} from './mail-templates.util';
import {
  BookingVoucherEmailData,
  EmergencyCancelEmailData,
  buildVoucherHtml,
  buildVoucherText,
  buildEmergencyCancelHtml,
} from './voucher-mail.util';

export {
  buildVerificationHtml,
  buildPasswordResetHtml,
  buildEmailChangeHtml,
  BookingVoucherEmailData,
  EmergencyCancelEmailData,
};

const SMTP_FROM = process.env.SMTP_FROM || 'SinggahIn <no-reply@singgahin.com>';

function getTransporter(): nodemailer.Transporter {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: { user: process.env.SMTP_USER || '', pass: process.env.SMTP_PASS || '' },
  });
}

function shouldSkipMail(): boolean {
  return process.env.NODE_ENV === 'test' || !process.env.SMTP_USER;
}

export async function sendVerificationEmail(to: string, token: string): Promise<void> {
  const link = `${CLIENT_URL}/verify?token=${token}`;
  if (shouldSkipMail()) return;
  await getTransporter().sendMail({
    from: SMTP_FROM, to,
    subject: 'Verifikasi Akun SinggahIn Anda (Berlaku 1 Jam)',
    html: buildVerificationHtml(link),
  });
}

export async function sendPasswordResetEmail(to: string, token: string): Promise<void> {
  const link = `${CLIENT_URL}/reset-password?token=${token}`;
  if (shouldSkipMail()) return;
  await getTransporter().sendMail({
    from: SMTP_FROM, to,
    subject: 'Permintaan Reset Password Akun SinggahIn (Berlaku 1 Jam)',
    html: buildPasswordResetHtml(link),
  });
}

export async function sendEmailChangeVerificationEmail(to: string, token: string): Promise<void> {
  const link = `${CLIENT_URL}/verify-email-change?token=${token}`;
  if (shouldSkipMail()) return;
  await getTransporter().sendMail({
    from: SMTP_FROM, to,
    subject: 'Konfirmasi Perubahan Alamat Email SinggahIn (Berlaku 1 Jam)',
    html: buildEmailChangeHtml(link),
  });
}

async function resolvePdfBuffer(data: BookingVoucherEmailData): Promise<Buffer | undefined> {
  if (data.pdfBuffer) return data.pdfBuffer;
  try {
    return await generateInvoicePdf(data);
  } catch (_err) {
    return undefined;
  }
}

export async function sendBookingVoucherEmail(to: string, data: BookingVoucherEmailData): Promise<void> {
  if (shouldSkipMail()) return;
  const pdf = await resolvePdfBuffer(data);
  const attachments = pdf ? [{ filename: `Invoice-SinggahIn-${data.bookingCode}.pdf`, content: pdf, contentType: 'application/pdf' }] : [];
  await getTransporter().sendMail({
    from: SMTP_FROM, to,
    subject: `Bukti Pembayaran & Voucher Reservasi - ${data.bookingCode}`,
    text: buildVoucherText(data), html: buildVoucherHtml(data), attachments,
  });
}

export async function sendEmergencyCancellationEmail(to: string, data: EmergencyCancelEmailData): Promise<void> {
  if (shouldSkipMail()) return;
  await getTransporter().sendMail({
    from: SMTP_FROM, to,
    subject: `Pembatalan Darurat Pesanan - ${data.bookingCode}`,
    html: buildEmergencyCancelHtml(data),
  });
}
