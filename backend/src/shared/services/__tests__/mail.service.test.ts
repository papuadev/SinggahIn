import { describe, it, expect, vi, beforeEach } from 'vitest';
import nodemailer from 'nodemailer';
import { sendVerificationEmail } from '../mail.service';

vi.mock('nodemailer', () => ({
  default: {
    createTransport: vi.fn()
  }
}));

describe('Mail Service (Nodemailer Verification Dispatch)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not dispatch mail if NODE_ENV is test', async () => {
    const sendMailMock = vi.fn();
    vi.mocked(nodemailer.createTransport).mockReturnValue({ sendMail: sendMailMock } as any);

    await sendVerificationEmail('user@test.com', 'tok-123');
    expect(sendMailMock).not.toHaveBeenCalled();
  });

  it('should send email with 1h verification link when SMTP is enabled', async () => {
    const originalEnv = process.env.NODE_ENV;
    const originalUser = process.env.SMTP_USER;
    try {
      process.env.NODE_ENV = 'development';
      process.env.SMTP_USER = 'test@singgahin.com';

      const sendMailMock = vi.fn().mockResolvedValue({ messageId: 'm1' });
      vi.mocked(nodemailer.createTransport).mockReturnValue({ sendMail: sendMailMock } as any);

      await sendVerificationEmail('user@test.com', 'tok-123');

      expect(sendMailMock).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@test.com',
          subject: 'Verifikasi Akun SinggahIn Anda (Berlaku 1 Jam)',
          html: expect.stringContaining('/verify?token=tok-123')
        })
      );
    } finally {
      process.env.NODE_ENV = originalEnv;
      process.env.SMTP_USER = originalUser;
    }
  });
});
