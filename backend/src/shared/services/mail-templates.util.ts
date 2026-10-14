export const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

export interface EmailTemplateOptions {
  badgeText: string;
  badgeBgColor?: string;
  badgeTextColor?: string;
  heading: string;
  greeting?: string;
  bodyParagraphs: string[];
  actionUrl: string;
  actionText: string;
  noticeBox?: { type: 'warning' | 'info'; text: string };
  disclaimerText: string;
}

function buildNoticeBox(box?: { type: 'warning' | 'info'; text: string }): string {
  if (!box) return '';
  const isWarn = box.type === 'warning';
  const bg = isWarn ? '#fffbeb' : '#f0f9ff';
  const border = isWarn ? '#fde68a' : '#bae6fd';
  const text = isWarn ? '#92400e' : '#0369a1';
  return `<div style="background-color:${bg};border:1px solid ${border};border-radius:8px;padding:12px 16px;margin:20px 0;font-size:12px;color:${text};line-height:1.5;">${box.text}</div>`;
}

function buildBannerHtml(): string {
  return `<tr><td style="background:linear-gradient(135deg, #0284c7 0%, #1e40af 100%);padding:32px 28px;text-align:center;">
    <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:900;letter-spacing:-0.5px;line-height:1.2;">SinggahIn</h1>
    <p style="margin:6px 0 0;color:#e0f2fe;font-size:13px;font-weight:500;letter-spacing:0.3px;">Tempat Singgah Terbaik di Seluruh Indonesia</p>
  </td></tr>`;
}

function buildButtonHtml(url: string, text: string): string {
  return `<div style="text-align:center;margin:28px 0 24px;">
    <a href="${url}" style="background-color:#0284c7;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:700;display:inline-block;box-shadow:0 4px 6px -1px rgba(2,132,199,0.3);letter-spacing:0.3px;">${text}</a>
  </div>`;
}

function buildBadgeHtml(opts: EmailTemplateOptions): string {
  const bg = opts.badgeBgColor || '#e0f2fe';
  const col = opts.badgeTextColor || '#0369a1';
  return `<div style="margin-bottom:16px;"><span style="display:inline-block;background-color:${bg};color:${col};font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;padding:4px 12px;border-radius:20px;">${opts.badgeText}</span></div>`;
}

function buildAltLinkHtml(url: string): string {
  return `<div style="border-top:1px dashed #e2e8f0;padding-top:16px;margin-top:20px;">
    <p style="margin:0 0 4px;color:#64748b;font-size:11px;">Jika tombol di atas tidak berfungsi, salin dan buka tautan berikut di browser Anda:</p>
    <p style="margin:0;font-size:11px;word-break:break-all;"><a href="${url}" style="color:#0284c7;text-decoration:underline;">${url}</a></p>
  </div>`;
}

function buildEmailBodyContent(opts: EmailTemplateOptions): string {
  const paragraphs = opts.bodyParagraphs.map(p => `<p style="margin:0 0 14px;color:#475569;font-size:14px;line-height:1.6;">${p}</p>`).join('');
  const greeting = opts.greeting ? `<p style="margin:0 0 12px;color:#334155;font-size:14px;font-weight:600;">${opts.greeting}</p>` : '';
  return `${buildBadgeHtml(opts)}<h2 style="margin:0 0 16px;color:#0f172a;font-size:20px;font-weight:800;line-height:1.3;">${opts.heading}</h2>${greeting}${paragraphs}${buildButtonHtml(opts.actionUrl, opts.actionText)}${buildNoticeBox(opts.noticeBox)}${buildAltLinkHtml(opts.actionUrl)}<p style="margin:20px 0 0;color:#94a3b8;font-size:11px;line-height:1.5;">${opts.disclaimerText}</p>`;
}

function buildEmailFooterHtml(year: number): string {
  return `<tr><td style="background-color:#f8fafc;padding:20px 28px;text-align:center;border-top:1px solid #f1f5f9;font-size:11px;color:#94a3b8;line-height:1.6;">
    <p style="margin:0 0 4px;color:#64748b;">Butuh bantuan seputar akun Anda? Hubungi <a href="mailto:support@singgahin.biz.id" style="color:#0284c7;text-decoration:none;font-weight:600;">support@singgahin.biz.id</a></p>
    <p style="margin:0;">&copy; ${year} SinggahIn Indonesia. Seluruh hak cipta dilindungi undang-undang.</p>
  </td></tr>`;
}

export function buildBrandedEmailHtml(opts: EmailTemplateOptions): string {
  const year = new Date().getFullYear();
  return `<!DOCTYPE html><html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${opts.heading}</title></head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1e293b;">
  <div style="background-color:#f1f5f9;padding:36px 16px;">
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:560px;margin:0 auto;background-color:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
      ${buildBannerHtml()}
      <tr><td style="padding:32px 28px 28px;">${buildEmailBodyContent(opts)}</td></tr>
      ${buildEmailFooterHtml(year)}
    </table>
  </div>
</body></html>`;
}

export function buildVerificationHtml(link: string): string {
  return buildBrandedEmailHtml({
    badgeText: 'Aktivasi Akun Baru', badgeBgColor: '#e0f2fe', badgeTextColor: '#0369a1',
    heading: 'Verifikasi Akun SinggahIn Anda 🎉', greeting: 'Halo, Calon Pengguna SinggahIn!',
    bodyParagraphs: [
      'Terima kasih telah mendaftar di SinggahIn. Kami sangat senang menyambut Anda di komunitas kami.',
      'Silakan klik tombol di bawah untuk mengaktifkan akun Anda:',
    ],
    actionUrl: link, actionText: 'Aktivasi Akun Saya',
    noticeBox: { type: 'warning', text: '<strong>Penting:</strong> Tautan ini hanya berlaku <strong>1 jam</strong>.' },
    disclaimerText: 'Jika tidak merasa mendaftar di SinggahIn, abaikan email ini.',
  });
}

export function buildPasswordResetHtml(link: string): string {
  return buildBrandedEmailHtml({
    badgeText: 'Keamanan Akun', badgeBgColor: '#fef3c7', badgeTextColor: '#92400e',
    heading: 'Permintaan Reset Password Akun 🔒', greeting: 'Halo Pengguna SinggahIn,',
    bodyParagraphs: [
      'Kami menerima permintaan untuk mereset kata sandi akun SinggahIn Anda.',
      'Klik tombol di bawah untuk membuat kata sandi baru yang aman:',
    ],
    actionUrl: link, actionText: 'Reset Password Saya',
    noticeBox: { type: 'warning', text: '<strong>Pemberitahuan:</strong> Tautan hanya berlaku <strong>1 jam</strong> (1 kali pakai).' },
    disclaimerText: 'Jika Anda tidak meminta perubahan kata sandi, abaikan email ini.',
  });
}

export function buildEmailChangeHtml(link: string): string {
  return buildBrandedEmailHtml({
    badgeText: 'Pembaruan Email', badgeBgColor: '#ecfdf5', badgeTextColor: '#065f46',
    heading: 'Konfirmasi Alamat Email Baru Anda ✉️', greeting: 'Halo,',
    bodyParagraphs: [
      'Kami menerima permintaan untuk memperbarui alamat email akun SinggahIn Anda.',
      'Silakan klik tombol konfirmasi di bawah untuk mengaktifkan email baru ini:',
    ],
    actionUrl: link, actionText: 'Konfirmasi & Aktifkan Email Baru',
    noticeBox: { type: 'info', text: '<strong>Info:</strong> Tautan konfirmasi ini berlaku selama <strong>1 jam</strong>.' },
    disclaimerText: 'Jika Anda tidak meminta perubahan email ini, abaikan email ini.',
  });
}
