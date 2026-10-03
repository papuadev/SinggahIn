import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import nodemailer from 'nodemailer';
import {
  sendVerificationEmail,
  sendBookingVoucherEmail,
  sendEmergencyCancellationEmail,
} from '../mail.service';

vi.mock('nodemailer', () => ({
  default: { createTransport: vi.fn() },
}));

describe('Mail Service', () => {
  const originalEnv = process.env.NODE_ENV;
  const originalUser = process.env.SMTP_USER;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NODE_ENV = 'development';
    process.env.SMTP_USER = 'test@singgahin.com';
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    process.env.SMTP_USER = originalUser;
  });

  it('should not dispatch mail if NODE_ENV is test', async () => {
    process.env.NODE_ENV = 'test';
    const sendMailMock = vi.fn();
    vi.mocked(nodemailer.createTransport).mockReturnValue({ sendMail: sendMailMock } as any);
    await sendVerificationEmail('user@test.com', 'tok-123');
    expect(sendMailMock).not.toHaveBeenCalled();
  });

  it('should send verification email when SMTP is enabled', async () => {
    const sendMailMock = vi.fn().mockResolvedValue({ messageId: 'm1' });
    vi.mocked(nodemailer.createTransport).mockReturnValue({ sendMail: sendMailMock } as any);

    await sendVerificationEmail('user@test.com', 'tok-123');
    expect(sendMailMock).toHaveBeenCalledWith(expect.objectContaining({
      to: 'user@test.com',
      subject: 'Verifikasi Akun SinggahIn Anda (Berlaku 1 Jam)',
    }));
  });

  it('should send booking voucher email', async () => {
    const sendMailMock = vi.fn().mockResolvedValue({ messageId: 'm2' });
    vi.mocked(nodemailer.createTransport).mockReturnValue({ sendMail: sendMailMock } as any);
    const d = {
      bookingCode: 'SGH-20261010-ABCD', propertyName: 'Villa Lembang', roomName: 'Deluxe',
      checkInDate: '2026-10-10', checkOutDate: '2026-10-12', totalGuests: 2, totalPrice: 1000000,
    };
    await sendBookingVoucherEmail('user@test.com', d);
    expect(sendMailMock).toHaveBeenCalledWith(expect.objectContaining({ to: 'user@test.com' }));
  });

  it('should send emergency cancellation email with contact info', async () => {
    const sendMailMock = vi.fn().mockResolvedValue({ messageId: 'm3' });
    vi.mocked(nodemailer.createTransport).mockReturnValue({ sendMail: sendMailMock } as any);
    const d = { bookingCode: 'SGH-ABCD', propertyName: 'Villa', cancellationReason: 'Bocor', refundContact: '081234567890' };
    await sendEmergencyCancellationEmail('user@test.com', d);
    expect(sendMailMock).toHaveBeenCalledWith(expect.objectContaining({ to: 'user@test.com', html: expect.stringContaining('081234567890') }));
  });
});
