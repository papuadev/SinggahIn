import nodemailer from 'nodemailer';

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const SMTP_FROM =
  process.env.SMTP_FROM || 'SinggahIn <no-reply@singgahin.com>';

function getTransporter(): nodemailer.Transporter {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || ''
    }
  });
}

function buildVerificationHtml(link: string): string {
  return `
    <div style="font-family: sans-serif; max-width: 600px; padding: 20px;">
      <h2>Verifikasi Akun SinggahIn Anda</h2>
      <p>Halo, terima kasih telah mendaftar di SinggahIn.</p>
      <p>Klik tombol di bawah ini untuk memverifikasi akun Anda. Tautan ini berlaku <strong>1 jam</strong>.</p>
      <p style="margin: 25px 0;">
        <a href="${link}" style="background-color: #0284c7; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Verifikasi Akun</a>
      </p>
      <p>Atau buka tautan berikut: <br/><a href="${link}">${link}</a></p>
    </div>
  `;
}

export async function sendVerificationEmail(
  to: string,
  token: string
): Promise<void> {
  const link = `${CLIENT_URL}/verify?token=${token}`;
  if (process.env.NODE_ENV === 'test' || !process.env.SMTP_USER) {
    return;
  }
  const transporter = getTransporter();
  await transporter.sendMail({
    from: SMTP_FROM,
    to,
    subject: 'Verifikasi Akun SinggahIn Anda (Berlaku 1 Jam)',
    html: buildVerificationHtml(link)
  });
}
